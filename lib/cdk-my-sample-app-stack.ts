import * as lambdaPython from '@aws-cdk/aws-lambda-python-alpha';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { createLambdaRole, createStepFunctionsRole, createGlueRole } from './iam_role';
import { createLambdaFunction } from './lambda';
import { createStepFunctions } from './stepfunctions_with_lambda';
import { createStepFunctionsWithGlue } from './stepfunctions_with_glue';
import { deployGlueJobScript, deployGlueCommonScript } from './glue_scripts';
import { createGlueJob } from './glue';

export class CdkMySampleAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // LambdaLayerの作成
    const baseLayer = new lambdaPython.PythonLayerVersion(this, 'BaseLayer', {
      entry: 'resources/lambda_layer',
      compatibleRuntimes: [lambda.Runtime.PYTHON_3_9],
      description: 'The layer containing Python dependencies',
    });
    const layers = [baseLayer]

    // Lambda IAM Role
    const lambdaRole = createLambdaRole(this, 'my-lambda-role');

    // 環境変数の定義
    const env_vars = {
      SAVE_BUCKET_NAME: 'uehara-test-bucket',
    }
    
    // Lambda Function
    const startLambda = createLambdaFunction(this, 'start-handler', lambdaRole, layers, env_vars);
    const endLambda = createLambdaFunction(this, 'end-handler', lambdaRole, layers, {})

    // Step Functions IAM Role
    const stepFunctionsRole = createStepFunctionsRole(this, 'my-sfn-role');

    // Step Functions with Lambda
    const stepFunctions = createStepFunctions(this, 'my-sfn-with-lambda', stepFunctionsRole, startLambda, endLambda);

    // Glueのスクリプトをデプロイ
    deployGlueCommonScript(this, 'deploy-glue-common-script')
    deployGlueJobScript(this, 'deploy-glue-job-script');

    // Glue IAM Role
    const glueRole = createGlueRole(this, 'my-glue-role');
    
    // Glue
    const startGlue = createGlueJob(this, 'start-glue', glueRole, env_vars);

    // StepFunctions with Glue
    const stepFunctions_with_glue
      = createStepFunctionsWithGlue(this, 'my-sfn-with-glue', stepFunctionsRole, startGlue, endLambda);
  }
}
