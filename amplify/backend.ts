import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource.js';
import { data } from './data/resource.js';
import { priceAlert } from './functions/priceAlert/resource.js';
import { priceTracker } from './functions/priceTracker/resource.js';
import { MODEL_ID, stockDataProcessor } from './functions/stockDataProcessor/resource.js';
import { PolicyStatement, Effect } from 'aws-cdk-lib/aws-iam';
import { Stack } from 'aws-cdk-lib';


const backend = defineBackend({
  auth,
  data,
  priceAlert,
  priceTracker,
  stockDataProcessor,
});

// Add the policy to the stockDataProcessor Lambda function
backend.stockDataProcessor.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ["bedrock:InvokeModel"],
    resources: [
      `arn:aws:bedrock:${Stack.of(backend.data).region}::foundation-model/${MODEL_ID}`,
    ],
  })
);

// Add the policy to the priceAlert Lambda function for GraphQL access
backend.priceAlert.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: [
      "appsync:GraphQL",
      // Add any other necessary AppSync permissions
    ],
    resources: [
      `arn:aws:appsync:${Stack.of(backend.data).region}:${Stack.of(backend.data).account}:apis/${process.env.API_REDPANDALEVELS_GRAPHQLAPIIDOUTPUT}/types/Mutation/fields/sendPriceAlert`,
    ],
  })
);

export default backend;
