import json


def lambda_handler(event, context):
    print(f"event: {json.dumps(event)}")

    return {
        "result": "success"
    }
