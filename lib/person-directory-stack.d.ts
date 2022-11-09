import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
export declare class PersonDirectoryStack extends cdk.Stack {
    private readonly title;
    private personTable;
    private personApiLambda;
    private personApi;
    constructor(scope: Construct, id: string, props?: cdk.StackProps);
    private createPersonTable;
    private createPersonApiLambda;
    private createPersonApi;
    private addPersonApiResources;
}
