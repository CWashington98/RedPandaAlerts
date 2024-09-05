import { defineFunction } from '@aws-amplify/backend';

export const stockDataProcessor = defineFunction({
  name: 'stockDataProcessor',
  entry: './handler.ts',
  memoryMB: 512,  // Increased memory for API calls
  timeoutSeconds: 300,  // Increased timeout for potentially longer operations
  environment: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',  // Make sure to set this in your environment
  },
});