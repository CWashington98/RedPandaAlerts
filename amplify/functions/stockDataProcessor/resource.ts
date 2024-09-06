import { defineFunction } from '@aws-amplify/backend';

export const stockDataProcessor = defineFunction({
  name: 'stockDataProcessor',
  entry: './handler.ts',
  memoryMB: 512,  // Increased memory for API calls
  timeoutSeconds: 300,  // Increased timeout for potentially longer operations
  permissions: [
    {
      actions: [
        'bedrock:InvokeModel'
      ],
      resources: [
        'arn:aws:bedrock:*:*:model/anthropic.claude-3-sonnet-20240229-v1:0'
      ]
    }
  ],
  environment: {
    // Add any environment variables if needed
  },
});