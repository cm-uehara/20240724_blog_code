import json
import os
import sys

import boto3
from awsglue.utils import getResolvedOptions
from common import my_utils

SAVE_BUCKET_NAME = None

sfn_client = boto3.client("stepfunctions")


def get_task_token(args):
    for i in range(len(args)):
        if args[i] == "--task_token":
            return args[i + 1]
    raise Exception("task_tokenが見つかりませんでした")


def send_success_to_step_functions(task_token, output):
    response = sfn_client.send_task_success(taskToken=task_token, output=output)
    print(f"response: {response}")


def send_fail_to_step_functions(task_token, error=None, cause=None):
    response = sfn_client.send_task_failure(
        taskToken=task_token, error=error, cause=cause
    )
    print(f"response: {response}")


def main(argv):
    callback_token = get_task_token(argv)
    try:
        # argumentの取得
        args = getResolvedOptions(argv, ["event", "environment"])
        event = json.loads(args["event"])

        # 環境変数の設定
        env_dict = json.loads(args["environment"])
        for key, value in env_dict.items():
            os.environ[key.upper()] = str(value)
        global SAVE_BUCKET_NAME
        SAVE_BUCKET_NAME = os.getenv("SAVE_BUCKET_NAME", "")

        print(f"event: {json.dumps(event)}")
        name = event.get("name", "")

        hello_str = my_utils.get_hello_str(name)
        print(f"{hello_str}")

        s3_uri = f"s3://{SAVE_BUCKET_NAME}/test"

        output = {
            "result": "success",
            "s3_uri": s3_uri,
        }
        send_success_to_step_functions(callback_token, json.dumps(output))
    except Exception as e:
        error = type(e).__name__
        cause = str(e)
        send_fail_to_step_functions(callback_token, error=error, cause=cause)


if __name__ == "__main__":
    main(sys.argv)
