import * as cdk from 'aws-cdk-lib';
import { CfnOutput } from 'aws-cdk-lib';
import { RestApi, LambdaIntegration } from 'aws-cdk-lib/aws-apigateway';
import { Table, AttributeType } from 'aws-cdk-lib/aws-dynamodb';
import { PolicyStatement, Policy } from 'aws-cdk-lib/aws-iam';
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import * as path from "path";

export class PersonDirectoryStack extends cdk.Stack {
  
  private readonly title: string;
  private personTable: Table;
  private personApiLambda: Function;
  private personApi: RestApi;
  
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.title = this.node.tryGetContext('title');

    this.createPersonTable();

    this.createPersonApiLambda();

    this.createPersonApi();
  }

  /*
        Creating a DynamoDB table for storing Person data
     */
        private createPersonTable = () => {
          this.personTable = new Table(this, `${this.title}-Persons-Table`, {
            tableName: 'Persons',
            partitionKey: {
              name: 'id',
              type: AttributeType.STRING
            },
            sortKey: {name: 'firstName', type: dynamodb.AttributeType.STRING},
          });
        }
      
        /*
            Creating lambda function for handling API endpoints
         */
        private createPersonApiLambda = () => {
          this.personApiLambda = new Function(this, `${this.title}-Person-Lambda`, {
            code: Code.fromAsset(path.join(__dirname, '../lambda')),
            handler: "person.handler",
            runtime: Runtime.NODEJS_14_X
          });
      
          //Required permissions for Lambda function to interact with Person table
          const personTablePermissionPolicy = new PolicyStatement({
            actions: [
              "dynamodb:BatchGetItem",
              "dynamodb:GetItem",
              "dynamodb:Scan",
              "dynamodb:Query",
              "dynamodb:BatchWriteItem",
              "dynamodb:PutItem",
              "dynamodb:UpdateItem",
              "dynamodb:DeleteItem"
            ],
            resources: [this.personTable.tableArn]
          });
      
          //Attaching an inline policy to the role
          this.personApiLambda.role?.attachInlinePolicy(
            new Policy(this, `${this.title}-PersonTablePermissions`, {
              statements: [personTablePermissionPolicy],
            }),
          );
        }
      
        /*
            API Gateway integration
         */
        private createPersonApi = () => {
          this.personApi = new RestApi(this, `${this.title}-Persons-API`, {
            description: 'Persons API',
            deployOptions: {
              stageName: 'dev'
            },
            defaultCorsPreflightOptions: {
              allowHeaders: [
                'Content-Type',
                'X-Amz-Date',
                'Authorization',
                'X-Api-Key',
              ],
              allowMethods: ['OPTIONS', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
              allowCredentials: true,
              allowOrigins: ['http://localhost:3000'],
            },
          });
          new CfnOutput(this, 'apiUrl', { value: this.personApi.url });
      
          this.addPersonApiResources();
        }
      
        private addPersonApiResources = () => {
          const persons = this.personApi.root.addResource('persons');
          const person = persons.addResource('{id}');
      
          persons.addMethod('GET', new LambdaIntegration(this.personApiLambda));
          persons.addMethod('POST', new LambdaIntegration(this.personApiLambda))
      
          person.addMethod('GET', new LambdaIntegration(this.personApiLambda));
          person.addMethod('DELETE', new LambdaIntegration(this.personApiLambda));
        }
}
