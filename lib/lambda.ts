import { Duration } from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

type dict = { [key: string]: any; }

export function createLambdaFunction(scope: Construct, id: string, role: iam.Role, layers: lambda.ILayerVersion[], environment: dict = {}): lambda.Function {

    const lambdaSourceName = id.replace(/-/g, '_')

    return new lambda.Function(scope, id, {
        functionName: `${id}-test`,
        runtime: lambda.Runtime.PYTHON_3_9,
        handler: `${lambdaSourceName}.lambda_handler`,
        code: lambda.Code.fromAsset("resources/lambda"),
        memorySize: 128,
        timeout: Duration.seconds(900),
        role: role,
        layers: layers,
        environment: environment,
    });
}
