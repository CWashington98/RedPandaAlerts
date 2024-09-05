import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource.js';
import { data } from './data/resource.js';
import { priceAlert } from './functions/priceAlert/resource.js';
import { priceTracker } from './functions/priceTracker/resource.js';
import { stockDataProcessor } from './functions/stockDataProcessor/resource.js';

defineBackend({
  auth,
  data,
  priceAlert,
  priceTracker,
  stockDataProcessor,
});
