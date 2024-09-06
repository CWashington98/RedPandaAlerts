import { Handler } from "aws-lambda";
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

const bedrockClient = new BedrockRuntimeClient({ region: "us-east-1" }); // Replace with your preferred region

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
    const { preprocessedData } = event;

    if (!preprocessedData || !Array.isArray(preprocessedData)) {
      throw new Error("Invalid input: preprocessedData must be an array");
    }

    const processedData = await processStockData(preprocessedData);

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
    modelId: "anthropic.claude-3-5-sonnet-20240620-v1:0",
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify({
      prompt: `Human: ${prompt}\n\nAssistant: Certainly! I'll process the stock data and provide the requested information in the specified JSON format. Here's the processed data:`,
      max_tokens: 4096,
      temperature: 0.7,
    }),
  };

  try {
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
