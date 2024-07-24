import * as iam from 'aws-cdk-lib/aws-iam';
import * as cdk from 'aws-cdk-lib';
import * as glue from 'aws-cdk-lib/aws-glue';
import { Construct } from 'constructs';

type dict = { [key: string]: any; }

export function createGlueJob(scope: Construct, id: string, role: iam.Role, environment: dict = {}): glue.CfnJob {

    const glueSourceName = id.replace(/-/g, '_')

    // Glue Jobの定義
    const glueJob = new glue.CfnJob(scope, id, {
        name: `${id}`,
        role: role.roleArn,
        command: {
            name: 'pythonshell',
            pythonVersion: '3.9',
            scriptLocation: `s3://cm-da-uehara/glue-scripts/${glueSourceName}.py`,
        },
        executionProperty: {
            maxConcurrentRuns: 3,
        },
        defaultArguments: {
            '--job-language': 'python',
            '--extra-py-files': `s3://cm-da-uehara/glue-scripts-common/common-0.1-py3-none-any.whl`,
            '--additional-python-modules': 'pytz==2024.1',
            '--environment': JSON.stringify(environment),
        },
    });

    return glueJob;
}
