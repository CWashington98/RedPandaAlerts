import { defineFunction } from '@aws-amplify/backend';

export const MODEL_ID = "anthropic.claude-3-haiku-20240307-v1:0";

export const stockDataProcessor = defineFunction({
  name: 'stockDataProcessor',
  entry: './handler.ts',
  memoryMB: 512,  // Increased memory for API calls
  timeoutSeconds: 300,  // Increased timeout for potentially longer operations
  environment: {
    MODEL_ID: MODEL_ID,
  },
});