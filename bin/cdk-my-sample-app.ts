#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CdkMySampleAppStack } from '../lib/cdk-my-sample-app-stack';

const app = new cdk.App();

new CdkMySampleAppStack(app, 'CdkMySampleAppStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  }
});