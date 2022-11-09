"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonDirectoryStack = void 0;
const cdk = require("aws-cdk-lib");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const aws_apigateway_1 = require("aws-cdk-lib/aws-apigateway");
const aws_dynamodb_1 = require("aws-cdk-lib/aws-dynamodb");
const aws_iam_1 = require("aws-cdk-lib/aws-iam");
const aws_lambda_1 = require("aws-cdk-lib/aws-lambda");
const path = require("path");
class PersonDirectoryStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        /*
              Creating a DynamoDB table for storing Person data
           */
        this.createPersonTable = () => {
            this.personTable = new aws_dynamodb_1.Table(this, `${this.title}-Persons-Table`, {
                tableName: 'Persons',
                partitionKey: {
                    name: 'id',
                    type: aws_dynamodb_1.AttributeType.STRING
                },
            });
        };
        /*
            Creating lambda function for handling API endpoints
         */
        this.createPersonApiLambda = () => {
            var _a;
            this.personApiLambda = new aws_lambda_1.Function(this, `${this.title}-Person-Lambda`, {
                code: aws_lambda_1.Code.fromAsset(path.join(__dirname, '../lambda')),
                handler: "person.handler",
                runtime: aws_lambda_1.Runtime.NODEJS_14_X
            });
            //Required permissions for Lambda function to interact with Person table
            const personTablePermissionPolicy = new aws_iam_1.PolicyStatement({
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
            (_a = this.personApiLambda.role) === null || _a === void 0 ? void 0 : _a.attachInlinePolicy(new aws_iam_1.Policy(this, `${this.title}-PersonTablePermissions`, {
                statements: [personTablePermissionPolicy],
            }));
        };
        /*
            API Gateway integration
         */
        this.createPersonApi = () => {
            this.personApi = new aws_apigateway_1.RestApi(this, `${this.title}-Persons-API`, {
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
            new aws_cdk_lib_1.CfnOutput(this, 'apiUrl', { value: this.personApi.url });
            this.addPersonApiResources();
        };
        this.addPersonApiResources = () => {
            const persons = this.personApi.root.addResource('persons');
            const person = persons.addResource('{id}');
            persons.addMethod('GET', new aws_apigateway_1.LambdaIntegration(this.personApiLambda));
            persons.addMethod('POST', new aws_apigateway_1.LambdaIntegration(this.personApiLambda));
            person.addMethod('GET', new aws_apigateway_1.LambdaIntegration(this.personApiLambda));
            person.addMethod('DELETE', new aws_apigateway_1.LambdaIntegration(this.personApiLambda));
        };
        this.title = this.node.tryGetContext('title');
        this.createPersonTable();
        this.createPersonApiLambda();
        this.createPersonApi();
    }
}
exports.PersonDirectoryStack = PersonDirectoryStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGVyc29uLWRpcmVjdG9yeS1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInBlcnNvbi1kaXJlY3Rvcnktc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQW1DO0FBQ25DLDZDQUF3QztBQUN4QywrREFBd0U7QUFDeEUsMkRBQWdFO0FBQ2hFLGlEQUE4RDtBQUM5RCx1REFBaUU7QUFFakUsNkJBQTZCO0FBRTdCLE1BQWEsb0JBQXFCLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFPakQsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFzQjtRQUM5RCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQVcxQjs7YUFFSztRQUNTLHNCQUFpQixHQUFHLEdBQUcsRUFBRTtZQUMvQixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksb0JBQUssQ0FBQyxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxnQkFBZ0IsRUFBRTtnQkFDaEUsU0FBUyxFQUFFLFNBQVM7Z0JBQ3BCLFlBQVksRUFBRTtvQkFDWixJQUFJLEVBQUUsSUFBSTtvQkFDVixJQUFJLEVBQUUsNEJBQWEsQ0FBQyxNQUFNO2lCQUMzQjthQUNGLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQTtRQUVEOztXQUVHO1FBQ0ssMEJBQXFCLEdBQUcsR0FBRyxFQUFFOztZQUNuQyxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUkscUJBQVEsQ0FBQyxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxnQkFBZ0IsRUFBRTtnQkFDdkUsSUFBSSxFQUFFLGlCQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLFdBQVcsQ0FBQyxDQUFDO2dCQUN2RCxPQUFPLEVBQUUsZ0JBQWdCO2dCQUN6QixPQUFPLEVBQUUsb0JBQU8sQ0FBQyxXQUFXO2FBQzdCLENBQUMsQ0FBQztZQUVILHdFQUF3RTtZQUN4RSxNQUFNLDJCQUEyQixHQUFHLElBQUkseUJBQWUsQ0FBQztnQkFDdEQsT0FBTyxFQUFFO29CQUNQLHVCQUF1QjtvQkFDdkIsa0JBQWtCO29CQUNsQixlQUFlO29CQUNmLGdCQUFnQjtvQkFDaEIseUJBQXlCO29CQUN6QixrQkFBa0I7b0JBQ2xCLHFCQUFxQjtvQkFDckIscUJBQXFCO2lCQUN0QjtnQkFDRCxTQUFTLEVBQUUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQzthQUN2QyxDQUFDLENBQUM7WUFFSCx3Q0FBd0M7WUFDeEMsTUFBQSxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksMENBQUUsa0JBQWtCLENBQzNDLElBQUksZ0JBQU0sQ0FBQyxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyx5QkFBeUIsRUFBRTtnQkFDdkQsVUFBVSxFQUFFLENBQUMsMkJBQTJCLENBQUM7YUFDMUMsQ0FBQyxFQUNGO1FBQ0osQ0FBQyxDQUFBO1FBRUQ7O1dBRUc7UUFDSyxvQkFBZSxHQUFHLEdBQUcsRUFBRTtZQUM3QixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksd0JBQU8sQ0FBQyxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxjQUFjLEVBQUU7Z0JBQzlELFdBQVcsRUFBRSxhQUFhO2dCQUMxQixhQUFhLEVBQUU7b0JBQ2IsU0FBUyxFQUFFLEtBQUs7aUJBQ2pCO2dCQUNELDJCQUEyQixFQUFFO29CQUMzQixZQUFZLEVBQUU7d0JBQ1osY0FBYzt3QkFDZCxZQUFZO3dCQUNaLGVBQWU7d0JBQ2YsV0FBVztxQkFDWjtvQkFDRCxZQUFZLEVBQUUsQ0FBQyxTQUFTLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLFFBQVEsQ0FBQztvQkFDbEUsZ0JBQWdCLEVBQUUsSUFBSTtvQkFDdEIsWUFBWSxFQUFFLENBQUMsdUJBQXVCLENBQUM7aUJBQ3hDO2FBQ0YsQ0FBQyxDQUFDO1lBQ0gsSUFBSSx1QkFBUyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1lBRTdELElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1FBQy9CLENBQUMsQ0FBQTtRQUVPLDBCQUFxQixHQUFHLEdBQUcsRUFBRTtZQUNuQyxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDM0QsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUUzQyxPQUFPLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxJQUFJLGtDQUFpQixDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO1lBQ3RFLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLElBQUksa0NBQWlCLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUE7WUFFdEUsTUFBTSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxrQ0FBaUIsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztZQUNyRSxNQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxJQUFJLGtDQUFpQixDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO1FBQzFFLENBQUMsQ0FBQTtRQTFGTCxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRTlDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBRXpCLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1FBRTdCLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztJQUN6QixDQUFDO0NBb0ZGO0FBckdELG9EQXFHQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgeyBDZm5PdXRwdXQgfSBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgeyBSZXN0QXBpLCBMYW1iZGFJbnRlZ3JhdGlvbiB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1hcGlnYXRld2F5JztcbmltcG9ydCB7IFRhYmxlLCBBdHRyaWJ1dGVUeXBlIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWR5bmFtb2RiJztcbmltcG9ydCB7IFBvbGljeVN0YXRlbWVudCwgUG9saWN5IH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWlhbSc7XG5pbXBvcnQgeyBDb2RlLCBGdW5jdGlvbiwgUnVudGltZSB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1sYW1iZGEnO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gXCJwYXRoXCI7XG5cbmV4cG9ydCBjbGFzcyBQZXJzb25EaXJlY3RvcnlTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XG4gIFxuICBwcml2YXRlIHJlYWRvbmx5IHRpdGxlOiBzdHJpbmc7XG4gIHByaXZhdGUgcGVyc29uVGFibGU6IFRhYmxlO1xuICBwcml2YXRlIHBlcnNvbkFwaUxhbWJkYTogRnVuY3Rpb247XG4gIHByaXZhdGUgcGVyc29uQXBpOiBSZXN0QXBpO1xuICBcbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM/OiBjZGsuU3RhY2tQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xuXG4gICAgdGhpcy50aXRsZSA9IHRoaXMubm9kZS50cnlHZXRDb250ZXh0KCd0aXRsZScpO1xuXG4gICAgdGhpcy5jcmVhdGVQZXJzb25UYWJsZSgpO1xuXG4gICAgdGhpcy5jcmVhdGVQZXJzb25BcGlMYW1iZGEoKTtcblxuICAgIHRoaXMuY3JlYXRlUGVyc29uQXBpKCk7XG4gIH1cblxuICAvKlxuICAgICAgICBDcmVhdGluZyBhIER5bmFtb0RCIHRhYmxlIGZvciBzdG9yaW5nIFBlcnNvbiBkYXRhXG4gICAgICovXG4gICAgICAgIHByaXZhdGUgY3JlYXRlUGVyc29uVGFibGUgPSAoKSA9PiB7XG4gICAgICAgICAgdGhpcy5wZXJzb25UYWJsZSA9IG5ldyBUYWJsZSh0aGlzLCBgJHt0aGlzLnRpdGxlfS1QZXJzb25zLVRhYmxlYCwge1xuICAgICAgICAgICAgdGFibGVOYW1lOiAnUGVyc29ucycsXG4gICAgICAgICAgICBwYXJ0aXRpb25LZXk6IHtcbiAgICAgICAgICAgICAgbmFtZTogJ2lkJyxcbiAgICAgICAgICAgICAgdHlwZTogQXR0cmlidXRlVHlwZS5TVFJJTkdcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIFxuICAgICAgICAvKlxuICAgICAgICAgICAgQ3JlYXRpbmcgbGFtYmRhIGZ1bmN0aW9uIGZvciBoYW5kbGluZyBBUEkgZW5kcG9pbnRzXG4gICAgICAgICAqL1xuICAgICAgICBwcml2YXRlIGNyZWF0ZVBlcnNvbkFwaUxhbWJkYSA9ICgpID0+IHtcbiAgICAgICAgICB0aGlzLnBlcnNvbkFwaUxhbWJkYSA9IG5ldyBGdW5jdGlvbih0aGlzLCBgJHt0aGlzLnRpdGxlfS1QZXJzb24tTGFtYmRhYCwge1xuICAgICAgICAgICAgY29kZTogQ29kZS5mcm9tQXNzZXQocGF0aC5qb2luKF9fZGlybmFtZSwgJy4uL2xhbWJkYScpKSxcbiAgICAgICAgICAgIGhhbmRsZXI6IFwicGVyc29uLmhhbmRsZXJcIixcbiAgICAgICAgICAgIHJ1bnRpbWU6IFJ1bnRpbWUuTk9ERUpTXzE0X1hcbiAgICAgICAgICB9KTtcbiAgICAgIFxuICAgICAgICAgIC8vUmVxdWlyZWQgcGVybWlzc2lvbnMgZm9yIExhbWJkYSBmdW5jdGlvbiB0byBpbnRlcmFjdCB3aXRoIFBlcnNvbiB0YWJsZVxuICAgICAgICAgIGNvbnN0IHBlcnNvblRhYmxlUGVybWlzc2lvblBvbGljeSA9IG5ldyBQb2xpY3lTdGF0ZW1lbnQoe1xuICAgICAgICAgICAgYWN0aW9uczogW1xuICAgICAgICAgICAgICBcImR5bmFtb2RiOkJhdGNoR2V0SXRlbVwiLFxuICAgICAgICAgICAgICBcImR5bmFtb2RiOkdldEl0ZW1cIixcbiAgICAgICAgICAgICAgXCJkeW5hbW9kYjpTY2FuXCIsXG4gICAgICAgICAgICAgIFwiZHluYW1vZGI6UXVlcnlcIixcbiAgICAgICAgICAgICAgXCJkeW5hbW9kYjpCYXRjaFdyaXRlSXRlbVwiLFxuICAgICAgICAgICAgICBcImR5bmFtb2RiOlB1dEl0ZW1cIixcbiAgICAgICAgICAgICAgXCJkeW5hbW9kYjpVcGRhdGVJdGVtXCIsXG4gICAgICAgICAgICAgIFwiZHluYW1vZGI6RGVsZXRlSXRlbVwiXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgcmVzb3VyY2VzOiBbdGhpcy5wZXJzb25UYWJsZS50YWJsZUFybl1cbiAgICAgICAgICB9KTtcbiAgICAgIFxuICAgICAgICAgIC8vQXR0YWNoaW5nIGFuIGlubGluZSBwb2xpY3kgdG8gdGhlIHJvbGVcbiAgICAgICAgICB0aGlzLnBlcnNvbkFwaUxhbWJkYS5yb2xlPy5hdHRhY2hJbmxpbmVQb2xpY3koXG4gICAgICAgICAgICBuZXcgUG9saWN5KHRoaXMsIGAke3RoaXMudGl0bGV9LVBlcnNvblRhYmxlUGVybWlzc2lvbnNgLCB7XG4gICAgICAgICAgICAgIHN0YXRlbWVudHM6IFtwZXJzb25UYWJsZVBlcm1pc3Npb25Qb2xpY3ldLFxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgXG4gICAgICAgIC8qXG4gICAgICAgICAgICBBUEkgR2F0ZXdheSBpbnRlZ3JhdGlvblxuICAgICAgICAgKi9cbiAgICAgICAgcHJpdmF0ZSBjcmVhdGVQZXJzb25BcGkgPSAoKSA9PiB7XG4gICAgICAgICAgdGhpcy5wZXJzb25BcGkgPSBuZXcgUmVzdEFwaSh0aGlzLCBgJHt0aGlzLnRpdGxlfS1QZXJzb25zLUFQSWAsIHtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnUGVyc29ucyBBUEknLFxuICAgICAgICAgICAgZGVwbG95T3B0aW9uczoge1xuICAgICAgICAgICAgICBzdGFnZU5hbWU6ICdkZXYnXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZGVmYXVsdENvcnNQcmVmbGlnaHRPcHRpb25zOiB7XG4gICAgICAgICAgICAgIGFsbG93SGVhZGVyczogW1xuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnLFxuICAgICAgICAgICAgICAgICdYLUFtei1EYXRlJyxcbiAgICAgICAgICAgICAgICAnQXV0aG9yaXphdGlvbicsXG4gICAgICAgICAgICAgICAgJ1gtQXBpLUtleScsXG4gICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgIGFsbG93TWV0aG9kczogWydPUFRJT05TJywgJ0dFVCcsICdQT1NUJywgJ1BVVCcsICdQQVRDSCcsICdERUxFVEUnXSxcbiAgICAgICAgICAgICAgYWxsb3dDcmVkZW50aWFsczogdHJ1ZSxcbiAgICAgICAgICAgICAgYWxsb3dPcmlnaW5zOiBbJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMCddLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBuZXcgQ2ZuT3V0cHV0KHRoaXMsICdhcGlVcmwnLCB7IHZhbHVlOiB0aGlzLnBlcnNvbkFwaS51cmwgfSk7XG4gICAgICBcbiAgICAgICAgICB0aGlzLmFkZFBlcnNvbkFwaVJlc291cmNlcygpO1xuICAgICAgICB9XG4gICAgICBcbiAgICAgICAgcHJpdmF0ZSBhZGRQZXJzb25BcGlSZXNvdXJjZXMgPSAoKSA9PiB7XG4gICAgICAgICAgY29uc3QgcGVyc29ucyA9IHRoaXMucGVyc29uQXBpLnJvb3QuYWRkUmVzb3VyY2UoJ3BlcnNvbnMnKTtcbiAgICAgICAgICBjb25zdCBwZXJzb24gPSBwZXJzb25zLmFkZFJlc291cmNlKCd7aWR9Jyk7XG4gICAgICBcbiAgICAgICAgICBwZXJzb25zLmFkZE1ldGhvZCgnR0VUJywgbmV3IExhbWJkYUludGVncmF0aW9uKHRoaXMucGVyc29uQXBpTGFtYmRhKSk7XG4gICAgICAgICAgcGVyc29ucy5hZGRNZXRob2QoJ1BPU1QnLCBuZXcgTGFtYmRhSW50ZWdyYXRpb24odGhpcy5wZXJzb25BcGlMYW1iZGEpKVxuICAgICAgXG4gICAgICAgICAgcGVyc29uLmFkZE1ldGhvZCgnR0VUJywgbmV3IExhbWJkYUludGVncmF0aW9uKHRoaXMucGVyc29uQXBpTGFtYmRhKSk7XG4gICAgICAgICAgcGVyc29uLmFkZE1ldGhvZCgnREVMRVRFJywgbmV3IExhbWJkYUludGVncmF0aW9uKHRoaXMucGVyc29uQXBpTGFtYmRhKSk7XG4gICAgICAgIH1cbn1cbiJdfQ==