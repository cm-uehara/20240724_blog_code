import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

// Lambda用のIAMロール作成
export function createLambdaRole(scope: Construct, id: string): iam.Role {
    const role = new iam.Role(scope, id, {
        assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
        managedPolicies: [
            iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
        ],
    });

    return role;
}

// StepFunctions用のLambdaロール作成
export function createStepFunctionsRole(scope: Construct, id: string): iam.Role {
    const role = new iam.Role(scope, id, {
        assumedBy: new iam.ServicePrincipal('states.amazonaws.com'),
        managedPolicies: [
            iam.ManagedPolicy.fromAwsManagedPolicyName('AWSStepFunctionsFullAccess'),
        ],
    });
    return role;
}

// Glue用のIAMロールを作成
export function createGlueRole(scope: Construct, id: string): iam.Role {
    const role = new iam.Role(scope, id, {
        assumedBy: new iam.ServicePrincipal('glue.amazonaws.com'),
        managedPolicies: [
            iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSGlueServiceRole'),
            iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonS3FullAccess"),
            iam.ManagedPolicy.fromAwsManagedPolicyName('AWSStepFunctionsFullAccess'),
        ],
    });

    return role;
}