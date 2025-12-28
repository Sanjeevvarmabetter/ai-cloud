from sklearn.ensemble import IsolationForest
import pandas as pd
from pymongo import MongoClient
from os import environ
from dotenv import load_dotenv

load_dotenv()

def extract_features(resource):
    features = {
        "public": 1 if resource.get("public", False) or resource.get("public_access", False) else 0,
        "open_ports": len(resource.get("ports", [])),
        "encryption": 0 if resource.get("encryption", True) == False else 1,
        "perm_count": len(resource.get("permissions", [])),
        "traffic_volume": resource.get("traffic_volume", 0)
    }
    print(f"Features for {resource['resource_id']}: {features}")
    return list(features.values())

def train_and_predict():
    try:
        MONGO_USER = environ.get("MONGO_USER", "admin")
        MONGO_PASS = environ.get("MONGO_PASS", "admin")
        client = MongoClient(
            f"mongodb+srv://admin:admin@cluster0.dumleoz.mongodb.net/?appName=Cluster0"
        )
        db = client["cspm_db"]
        collection = db["resources"]
        resources = list(collection.find())
        print(f"Found {len(resources)} resources")

        if not resources:
            print("No resources found in database")
            return {"status": "No resources to analyze"}

        X = [extract_features(res) for res in resources]
        print(f"Feature matrix shape: {len(X)} rows")

        model = IsolationForest(contamination=0.2, random_state=42)
        model.fit(X)
        predictions = model.predict(X)
        print(f"Predictions: {predictions}")

        for i, res in enumerate(resources):
            raw_score = model.decision_function([X[i]])[0]
            score =  (1 - raw_score) * 50
            risk = "High" if predictions[i] == -1 else "Low"
            print(f"Updating {res['resource_id']}: Score={score}, Risk={risk}")
            result = collection.update_one(
                {"resource_id": res["resource_id"]},
                {"$set": {"risk_score": round(float(score), 2), "risk_level": risk}}
            )
            print(f"Update result for {res['resource_id']}: {result.modified_count} document(s) modified")

        return {"status": "Risk analysis completed"}
    except Exception as e:
        print(f"Error in train_and_predict: {str(e)}")
        return {"status": f"Error: {str(e)}"}

if __name__ == "__main__":
    result = train_and_predict()
    print(result)