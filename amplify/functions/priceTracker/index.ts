/* Amplify Params - DO NOT EDIT
	API_REDPANDALEVELS_GRAPHQLAPIENDPOINTOUTPUT
	API_REDPANDALEVELS_GRAPHQLAPIIDOUTPUT
	API_REDPANDALEVELS_GRAPHQLAPIKEYOUTPUT
	ENV
	REGION
Amplify Params - DO NOT EDIT */

import crypto from "@aws-crypto/sha256-js";
import { defaultProvider } from "@aws-sdk/credential-provider-node";
import { SignatureV4 } from "@aws-sdk/signature-v4";
import { fetchAllStockData } from "./fetcher.js";
import { checkAndUpdateStock } from "./getPrice.js";

const GRAPHQL_ENDPOINT =
  process.env.API_REDPANDALEVELS_GRAPHQLAPIENDPOINTOUTPUT;
const AWS_REGION = process.env.AWS_REGION || "us-east-1";
const { Sha256 } = crypto;

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */

export const handler = async (event) => {
  console.log(`EVENT: ${JSON.stringify(event)}`);

  const endpoint = new URL(GRAPHQL_ENDPOINT);

  const signer = new SignatureV4({
    credentials: defaultProvider(),
    region: AWS_REGION,
    service: "appsync",
    sha256: Sha256,
  });

  let statusCode = 200;
  let body;
  let response;

  //  pull stockData
  const stockData = await fetchAllStockData(signer, endpoint);
  const stockPromises = [];
  let results;
  console.log("tickers: ", stockData.body);

  for (const stock of stockData.body) {
    stockPromises.push(checkAndUpdateStock(stock, signer, endpoint));
  }
  results = await Promise.allSettled(stockPromises);

  console.log("results: ", results);
  // if (body.errors) statusCode = 400;

  return {
    statusCode,
    //  Uncomment below to enable CORS requests
    // headers: {
    //   "Access-Control-Allow-Origin": "*",
    //   "Access-Control-Allow-Headers": "*"
    // },
    body: JSON.stringify(body),
  };
};
