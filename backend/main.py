from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pymongo import MongoClient
from typing import List
from datetime import datetime  # ← IMPORT MOVED TO TOP!
import json
import uvicorn
from os import environ
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# CORS Middleware - keep this
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],  # Your React app
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
client = MongoClient(
    "mongodb+srv://admin:admin@cluster0.dumleoz.mongodb.net/?appName=Cluster0"
)
db = client["cspm_db"]
collection = db["resources"]

class Resource(BaseModel):
    resource_id: str
    type: str
    region: str
    attributes: dict

@app.post("/ingest")
async def ingest_resource(resource: Resource):
    normalized = {
        "resource_id": resource.resource_id,
        "type": resource.type,
        "region": resource.region,
        **resource.attributes
    }
    collection.insert_one(normalized)
    return {"status": "Resource ingested"}

@app.get("/resources")
async def get_resources():
    resources = list(collection.find({}, {"_id": 0}))
    return resources

@app.post("/remediate")
async def remediate_resource(data: dict):
    resource_id = data.get("resource_id")
    if not resource_id:
        raise HTTPException(status_code=400, detail="resource_id is required")

    resource = collection.find_one({"resource_id": resource_id})
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")

    resource_type = resource.get("type")
    updates = {}
    actions_performed: List[str] = []

    try:
        # ========================
        # S3 Bucket Remediations
        # ========================
        if resource_type == "S3":
            if resource.get("public_access"):
                updates["public_access"] = False
                actions_performed.append("Public access blocked")

            if not resource.get("encryption", True):
                updates["encryption"] = True
                actions_performed.append("Server-side encryption enabled (SSE-S3)")

            if not resource.get("versioning_enabled"):
                updates["versioning_enabled"] = True
                actions_performed.append("Versioning enabled")

            if not resource.get("logging_enabled"):
                updates["logging_enabled"] = True
                actions_performed.append("Access logging enabled")

        # ========================
        # VM Remediations
        # ========================
        elif resource_type == "VM":
            risky_ports = [22, 3389, 3306, 5432]
            current_ports: List[int] = resource.get("ports", [])
            open_risky = [p for p in risky_ports if p in current_ports]

            if open_risky:
                updates["ports"] = [p for p in current_ports if p not in risky_ports]
                actions_performed.append(f"Closed risky ports: {', '.join(map(str, open_risky))}")

            if resource.get("public", False):
                updates["public"] = False
                actions_performed.append("Public IP exposure removed")

        # ========================
        # IAM Remediations
        # ========================
        elif resource_type == "IAM":
            permissions: List[str] = resource.get("permissions", [])

            if any(p in permissions for p in ["*", "AdministratorAccess"]) or permissions == ["*"]:
                updates["permissions"] = ["read-only"]
                actions_performed.append("Overly permissive access restricted")

            last_used = resource.get("last_used")
            if last_used:
                try:
                    days_unused = (datetime.now() - datetime.strptime(last_used, "%Y-%m-%d")).days
                    if days_unused > 90:
                        updates["permissions"] = ["none"]
                        actions_performed.append(f"Inactive {days_unused} days → permissions revoked")
                except ValueError:
                    pass  # Invalid date format, skip

        # ========================
        # RDS Remediations
        # ========================
        elif resource_type == "RDS":
            if resource.get("publicly_accessible", False):
                updates["publicly_accessible"] = False
                actions_performed.append("Public accessibility disabled")

            if not resource.get("encrypted", True):
                updates["encrypted"] = True
                actions_performed.append("Storage encryption enabled")

            if not resource.get("deletion_protection"):
                updates["deletion_protection"] = True
                actions_performed.append("Deletion protection enabled")

        # ========================
        # Lambda Remediations
        # ========================
        elif resource_type == "Lambda":
            if resource.get("public_endpoint", False):
                updates["public_endpoint"] = False
                actions_performed.append("Public invocation disabled")

            timeout = resource.get("timeout", 3)
            if timeout > 300:
                updates["timeout"] = 300
                actions_performed.append(f"Timeout reduced from {timeout}s to 300s")

        # ========================
        # Apply Updates
        # ========================
        if actions_performed:
            updates["risk_score"] = 0.0
            updates["risk_level"] = "Low"
            updates["last_remediated"] = datetime.now().isoformat()
            remediation_message = " | ".join(actions_performed)
        else:
            remediation_message = "No known misconfigurations detected"
            updates["last_checked"] = datetime.now().isoformat()

        # Always update something
        collection.update_one(
            {"resource_id": resource_id},
            {"$set": updates}
        )

        return {
            "status": "success",
            "resource_id": resource_id,
            "remediation": remediation_message,
            "actions_performed": actions_performed
        }

    except Exception as e:
        # Log error but don't crash the whole endpoint
        print(f"Remediation error for {resource_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Remediation failed due to server error")

if __name__ == "__main__":
    collection.drop()
    try:
        with open("cloud_resources.json", "r") as f:
            resources = json.load(f)
            collection.insert_many(resources)
            print(f"Loaded {len(resources)} resources")
    except FileNotFoundError:
        print("Error: cloud_resources.json not found")
    except json.JSONDecodeError:
        print("Error: Invalid JSON in cloud_resources.json")

    print("Starting server on http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)