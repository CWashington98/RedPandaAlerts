import { Handler } from "aws-lambda";
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { MODEL_ID } from "./resource";
// import { Schema } from "../../data/resource";
// import { generateClient } from "aws-amplify/api";

// const client = generateClient<Schema>();

type ProcessedStockData = {
  stockName: string;
  tickerSymbol: string;
  isCrypto: boolean;
  quickEntryPrice: number;
  swingTradePrice: number;
  loadTheBoatPrice: number;
};

export const handler: Handler = async (event: any) => {
  try {
    console.log("event", event);
    const { preprocessedData, userId } = event.arguments;
    console.log("preprocessedData", preprocessedData);
    if (!preprocessedData || !Array.isArray(JSON.parse(preprocessedData))) {
      throw new Error("Invalid input: preprocessedData must be an array");
    }
    console.log("preprocessedData", JSON.parse(preprocessedData));
    const processedData = await processStockData(JSON.parse(preprocessedData));

    // Commenting out the database insertion
    // const createdStocks = await createStockPrices(processedData, userId);

    return {
      statusCode: 200,
      body: JSON.stringify(processedData),
    };
  } catch (error) {
    console.error("Error processing stock data:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to process stock data" }),
    };
  }
};

async function processStockData(
  preprocessedData: any[]
): Promise<ProcessedStockData[]> {
  const jsonSchema = {
    type: "array",
    items: {
      type: "object",
      properties: {
        stockName: { type: "string" },
        tickerSymbol: { type: "string" },
        isCrypto: { type: "boolean" },
        quickEntryPrice: { type: "number" },
        swingTradePrice: { type: "number" },
        loadTheBoatPrice: { type: "number" },
      },
      required: [
        "stockName",
        "tickerSymbol",
        "isCrypto",
        "quickEntryPrice",
        "swingTradePrice",
        "loadTheBoatPrice",
      ],
    },
  };

  const prompt = `
    For each stock in the following list, provide the following information:
    1. Full company name (stockName)
    2. Stock ticker symbol (tickerSymbol)
    3. Whether it's a cryptocurrency (isCrypto)

    Here's the list of stocks with their price data:
    ${preprocessedData
      .map(
        (stock) =>
          `${stock.stockName}: Quick Entry: $${stock.quickEntryPrice}, Swing Trade: $${stock.swingTradePrice}, Load the Boat: $${stock.loadTheBoatPrice}`
      )
      .join("\n")}

    Please format the response as a JSON array of objects, with each object containing the above information for a single stock, along with the provided price data. The response should strictly adhere to the following JSON schema:

    ${JSON.stringify(jsonSchema, null, 2)}

    Ensure that the stockName is the full company name, the tickerSymbol is accurate, and isCrypto is correctly set to true for cryptocurrencies and false for stocks.

    Here's an example of the expected JSON structure for a single stock:
    {
      "stockName": "Apple Inc.",
      "tickerSymbol": "AAPL",
      "isCrypto": false,
      "quickEntryPrice": 157.69,
      "swingTradePrice": 202.99,
      "loadTheBoatPrice": 212.26
    }

    Please provide the complete JSON array for all stocks in the list.
  `;

  const params = {
    modelId: MODEL_ID,
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify({
      prompt: `Human: ${prompt}\n`,
      max_tokens: 4096,
      temperature: 0.1,
    }),
  };

  try {
    const bedrockClient = new BedrockRuntimeClient({ region: "us-east-1" });
    const command = new InvokeModelCommand(params);
    const response = await bedrockClient.send(command);

    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    const content = responseBody.completion;

    if (!content) {
      throw new Error("No content in Bedrock response");
    }

    const processedData = JSON.parse(content);
    return processedData;
  } catch (error) {
    console.error("Error processing stock data with Bedrock:", error);
    throw new Error("Failed to process stock data with Bedrock");
  }
}

// Commenting out the createStockPrices function
/*
async function createStockPrices(stocks: ProcessedStockData[], userId: string): Promise<Schema["StockPrice"]["type"][] | null> {
  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString("default", { month: "long" });
  const currentYear = currentDate.getFullYear();

  const createdStocks: Schema["StockPrice"]["type"][] = [];

  for (const stock of stocks) {
    try {
      const createdStock = await client.models.StockPrice.create({
        ...stock,
        month: currentMonth,
        year: currentYear,
        userId: userId
      });
      if (!createdStock.data) {
        throw new Error(`Failed to create stock ${stock.stockName}\n Error: ${createdStock.errors}`);
      }
      createdStocks.push(createdStock.data);
    } catch (error) {
      console.error(`Error creating stock ${stock.stockName}:`, error);
    }
  }

  return null;
}
*/
