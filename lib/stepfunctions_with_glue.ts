import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import { Construct } from 'constructs';

export function createStepFunctionsWithGlue(
    scope: Construct,
    id: string,
    stateMachineRole: iam.Role,
    startGlue: cdk.aws_glue.CfnJob,
    endLambda: cdk.aws_lambda.Function,
): sfn.StateMachine {
    const retry: sfn.RetryProps = {
        errors: ['States.ALL'],
        maxAttempts: 2,
    }

    // Glue タスク
    const startTask = new tasks.GlueStartJobRun(scope, `${id}_start_task`, {
        glueJobName: startGlue.name!,
        integrationPattern: sfn.IntegrationPattern.RUN_JOB,
        arguments: sfn.TaskInput.fromObject({
            '--event': sfn.JsonPath.stringAt('States.JsonToString($)'),
            '--task_token': sfn.JsonPath.taskToken
        }),
        timeout: cdk.Duration.minutes(30),
    }).addRetry(retry)

    // Lambda タスク
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