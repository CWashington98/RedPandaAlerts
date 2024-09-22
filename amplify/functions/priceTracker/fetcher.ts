import { Schema } from "../../data/resource";
import { generateClient } from "@aws-amplify/api";

const client = generateClient<Schema>({
  authMode: "iam",
});
export const fetchAllStockData = async () => {
  let allStockData: Schema["StockPrice"]["type"][] = [];
  let tokenToUse: string | undefined = undefined;

  // Refactored to use a while loop similar to getCountries for pagination
  while (tokenToUse !== null) {
    try {
      const response: Schema["StockPrice"]["type"][] | any =
        await client.models.StockPrice.list({
          // Filter out stocks that have already hit their prices
          filter: {
            or: [
              {
                quickEntryHit: {
                  eq: false,
                },
              },
              {
                swingTradeHit: {
                  eq: false,
                },
              },
              {
                loadTheBoatHit: {
                  eq: false,
                },
              },
            ],
          },
          authMode: "iam",
          nextToken: tokenToUse, // Pass the current nextToken for pagination
          limit: 1000, // Adjust the limit as needed
        });

      if (response?.data) {
        allStockData.push(...response.data);
        console.log(`Fetched ${response.data.length} items.`);
      }

      tokenToUse = response.nextToken || null;
      console.log(`Next Token: ${tokenToUse}`);
    } catch (error) {
      console.error("Error fetching stock data:", error);
      throw error; // Optionally handle the error as needed
    }
  }

  return allStockData;
};
