import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import { Construct } from 'constructs';

export function createStepFunctions(
    scope: Construct,
    id: string,
    stateMachineRole: iam.Role,
    startLambda: cdk.aws_lambda.Function,
    endLambda: cdk.aws_lambda.Function,
): sfn.StateMachine {
    const retry: sfn.RetryProps = {
        errors: ['States.ALL'],
        maxAttempts: 2,
    }

    // Lambda タスク
    const startTask = new tasks.LambdaInvoke(scope, `${id}_start_task`, {
        lambdaFunction: startLambda,
        outputPath: '$.Payload',
    }).addRetry(retry)

    const endTask = new tasks.LambdaInvoke(scope, `${id}_end_task`, {
        lambdaFunction: endLambda,
        outputPath: '$.Payload',
    }).addRetry(retry);

    // ステートマシンの定義
    const definition = startTask.next(endTask);

    return new sfn.StateMachine(scope, id, {
        stateMachineName: `${id}`,
        definitionBody: sfn.DefinitionBody.fromChainable(definition),
        timeout: cdk.Duration.hours(1),
        role: stateMachineRole,
    });
}