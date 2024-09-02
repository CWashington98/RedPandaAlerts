import { defineFunction } from '@aws-amplify/backend';

export const priceAlert = defineFunction({
  // optionally specify a name for the Function (defaults to directory name)
  name: 'priceAlert',
  // optionally specify a path to your handler (defaults to "./handler.ts")
  entry: './handler.ts',
  memoryMB: 256,
  timeoutSeconds: 120, // Increase the closer the Lambda gets to prod (1 min each increase)
});