import { Handler, APIGatewayProxyResult } from "aws-lambda";
import { fetchAllStockData } from "./fetcher";
// import { checkAndUpdateStock } from "./getPrice.ts";
import { Amplify } from "aws-amplify";
import { env } from "$amplify/env/priceTracker";
import { Schema } from "../../data/resource";

/**
 * @type {Handler}
 */
export const handler: Handler = async (
  event: any
): Promise<APIGatewayProxyResult> => {
  Amplify.configure(
    {
      API: {
        GraphQL: {
          endpoint: env.AMPLIFY_DATA_GRAPHQL_ENDPOINT,
          region: env.AWS_REGION,
          defaultAuthMode: "iam",
        },
      },
    },
    {
      Auth: {
        credentialsProvider: {
          getCredentialsAndIdentityId: async () => ({
            credentials: {
              accessKeyId: env.AWS_ACCESS_KEY_ID,
              secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
              sessionToken: env.AWS_SESSION_TOKEN,
            },
          }),
          clearCredentialsAndIdentityId: () => {
            /* noop */
          },
        },
      },
    }
  );

  console.log(`EVENT: ${JSON.stringify(event)}`);

  let statusCode = 200;
  let body: any = {};

  // try {
    // Fetch all stock data from the database
    const stockData: Schema["StockPrice"]["type"][] = await fetchAllStockData();

    console.log("Fetched stock data:", stockData);

    // Process each stock
    // const stockPromises = stockData.map((stock) => checkAndUpdateStock(stock));

  //   const results = await Promise.allSettled(stockPromises);
  //   console.log("Stock processing results:", results);

  //   // Optionally handle any rejections or summarize results
  //   const failedPromises = results.filter(
  //     (result) => result.status === "rejected"
  //   );
  //   if (failedPromises.length > 0) {
  //     statusCode = 207; // Multi-Status
  //     body.message = `${failedPromises.length} out of ${results.length} stock updates failed.`;
  //   } else {
  //     body.message = "All stock data processed successfully.";
  //   }
  // } catch (error) {
  //   console.error("Error processing stock data:", error);
  //   statusCode = 500;
  //   body = {
  //     error: "Internal Server Error",
  //     message: error instanceof Error ? error.message : String(error),
  //   };
  // }

  return {
    statusCode,
    body: JSON.stringify(body),
    // Uncomment below to enable CORS requests
    // headers: {
    //   "Access-Control-Allow-Origin": "*",
    //   "Access-Control-Allow-Headers": "*"
    // },
  };
};
