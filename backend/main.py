from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pymongo import MongoClient
import json
import uvicorn
from os import environ
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MONGO_USER = environ.get("MONGO_USER", "admin")
MONGO_PASS = environ.get("MONGO_PASS", "admin")
client = MongoClient(
    f"mongodb+srv://admin:admin@cluster0.zs7jdwh.mongodb.net/?appName=Cluster0"
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
    resource = collection.find_one({"resource_id": resource_id})
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")

    remediation_message = "No remediation needed"
    updates = {"risk_score": 0, "risk_level": "Low"}
    
    if resource["type"] == "S3" and resource.get("public_access"):
        updates["public_access"] = False
        remediation_message = "S3 bucket public access disabled"
    elif resource["type"] == "VM" and 22 in resource.get("ports", []):
        updates["ports"] = [p for p in resource["ports"] if p != 22]
        remediation_message = "Port 22 closed on VM"
    elif resource["type"] == "IAM" and resource.get("permissions") == ["*"]:
        updates["permissions"] = ["read-only"]
        remediation_message = "IAM permissions restricted to read-only"
    
    collection.update_one(
        {"resource_id": resource_id},
        {"$set": updates}
    )
    return {"status": remediation_message}

if __name__ == "__main__":
    collection.drop()
    try:
        with open("cloud_resources.json", "r") as f:
            resources = json.load(f)
            collection.insert_many(resources)
    except FileNotFoundError:
        print("Error: cloud_resources.json not found")
    uvicorn.run(app, host="0.0.0.0", port=8000)