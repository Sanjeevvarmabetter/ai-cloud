import random
import json
from datetime import datetime, timedelta

def generate_resources(num_resources=100):
    resource_types = ["VM", "S3", "IAM", "RDS", "Lambda"]
    regions = ["us-east-1", "us-west-2", "eu-west-1", "ap-south-1"]
    resources = []

    for i in range(num_resources):
        resource_type = random.choice(resource_types)
        resource_id = f"{resource_type.lower()}-{str(i+1).zfill(3)}"
        resource = {
            "resource_id": resource_id,
            "type": resource_type,
            "region": random.choice(regions),
        }

        if resource_type == "VM":
            resource.update({
                "ports": random.sample([22, 80, 443, 3389], k=random.randint(1, 4)),
                "public": random.choice([True, False]),
                "tags": {"env": random.choice(["prod", "dev", "test"])},
                "traffic_volume": random.randint(50, 1000)
            })
        elif resource_type == "S3":
            resource.update({
                "public_access": random.choice([True, False]),
                "encryption": random.choice([True, False]),
                "size_mb": random.randint(100, 5000)
            })
        elif resource_type == "IAM":
            resource.update({
                "permissions": random.choice([["*"], ["read-only"], ["write-only"]]),
                "last_used": (datetime.now() - timedelta(days=random.randint(1, 30))).strftime("%Y-%m-%d")
            })
        elif resource_type == "RDS":
            resource.update({
                "publicly_accessible": random.choice([True, False]),
                "encrypted": random.choice([True, False]),
                "instance_type": random.choice(["db.t3.micro", "db.m5.large"])
            })
        elif resource_type == "Lambda":
            resource.update({
                "timeout": random.randint(3, 900),
                "public_endpoint": random.choice([True, False]),
                "last_invoked": (datetime.now() - timedelta(days=random.randint(1, 7))).strftime("%Y-%m-%d")
            })

        resources.append(resource)

    with open("cloud_resources.json", "w") as f:
        json.dump(resources, f, indent=2)
    print(f"Generated {len(resources)} resources in cloud_resources.json")

if __name__ == "__main__":
    generate_resources(50)