import { defineFunction } from '@aws-amplify/backend';

export const priceAlert = defineFunction({
  name: 'priceAlert',
  entry: './handler.ts',
  memoryMB: 256,
  timeoutSeconds: 120,
  environment: {
    // Add any necessary environment variables here
  },
});