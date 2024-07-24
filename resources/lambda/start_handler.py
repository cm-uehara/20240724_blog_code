import json
import os

from common import my_utils

SAVE_BUCKET_NAME = os.getenv("SAVE_BUCKET_NAME", "")


def lambda_handler(event, context):
    print(f"event: {json.dumps(event)}")
    name = event.get("name", "")

    hello_str = my_utils.get_hello_str(name)
    print(f"{hello_str}")

    s3_uri = f"s3://{SAVE_BUCKET_NAME}/test"

    return {
        "result": "success",
        "s3_uri": s3_uri,
    }
