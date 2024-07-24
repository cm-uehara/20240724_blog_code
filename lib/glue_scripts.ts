import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export function deployGlueJobScript(scope: Construct, id: string) {
    const destinationBucket = s3.Bucket.fromBucketName(scope, `${id}-bucket`, 'cm-da-uehara');
  
    // GlueスクリプトをS3バケットにアップロード
    new cdk.aws_s3_deployment.BucketDeployment(scope, id, {
        sources: [cdk.aws_s3_deployment.Source.asset("resources/glue/job_scripts")],
        destinationBucket:  destinationBucket,
        destinationKeyPrefix: 'glue-scripts/',
    });
}

export function deployGlueCommonScript(scope: Construct, id: string) {
    const destinationBucket = s3.Bucket.fromBucketName(scope, `${id}-bucket`, 'cm-da-uehara');
  
    // commonディレクトリをwhlファイルに変換してS3にアップロード
    new cdk.aws_s3_deployment.BucketDeployment(scope, id, {
        sources: [
          cdk.aws_s3_deployment.Source.asset(
            'resources/glue',
            {
              bundling: {
                image: cdk.DockerImage.fromRegistry('python:3.9'),
                command: [
                  'bash',
                  '-c',
                  'pip install --user --upgrade pip && ' +
                    'pip install --user --no-cache-dir build wheel && ' +
                    'python -m build --wheel && ' +
                    'cp dist/*.whl /asset-output/common-0.1-py3-none-any.whl && ' +
                    'rm -rf dist build *.egg-info',
                ],
                user: 'root',
              },
            }
          ),
        ],
        destinationBucket: destinationBucket,
        destinationKeyPrefix: 'glue-scripts-common/',
    });
}

