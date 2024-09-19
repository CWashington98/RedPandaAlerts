import { defineFunction } from '@aws-amplify/backend';

export const priceAlert = defineFunction({
  name: 'priceAlert',
  entry: './handler.ts',
  memoryMB: 256,
  timeoutSeconds: 120,
  environment: {
    // Ensure all necessary environment variables are included
    GRAPHQL_ENDPOINT: process.env.API_REDPANDALEVELS_GRAPHQLAPIENDPOINTOUTPUT,
    AWS_REGION: process.env.AWS_REGION || "us-east-1",
  },
});