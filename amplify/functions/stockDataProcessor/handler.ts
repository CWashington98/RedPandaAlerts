import { Handler } from "aws-lambda";
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

type ProcessedStockData = {
  stockName: string;
  tickerSymbol: string;
  isCrypto: boolean;
  quickEntryPrice: number;
  swingTradePrice: number;
  loadTheBoatPrice: number;
  month: string;
  year: number;
};

type LambdaResponse = {
  statusCode: number;
  body: string;
};

export const handler: Handler = async (event: any): Promise<LambdaResponse> => {
  try {
    console.log("Event:", JSON.stringify(event, null, 2));
    const { stockData, userId } = event.arguments;
    console.log("Stock data:", stockData);
    console.log("User ID:", userId);

    if (!stockData || typeof stockData !== "string") {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Invalid input: stockData must be a string",
        }),
      };
    }

    const processedData = await processStockData(stockData);

    return {
      statusCode: 200,
      body: JSON.stringify({ data: processedData }),
    };
  } catch (error) {
    console.error("Error processing stock data:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Failed to process stock data: ${error}` }),
    };
  }
};

async function processStockData(
  stockData: string
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
        month: { type: "string" },
        year: { type: "integer" },
      },
      required: [
        "stockName",
        "tickerSymbol",
        "isCrypto",
        "quickEntryPrice",
        "swingTradePrice",
        "loadTheBoatPrice",
        "month",
        "year",
      ],
    },
  };

  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString("default", { month: "long" });
  const currentYear = currentDate.getFullYear();

  const params = {
    modelId: process.env.MODEL_ID,
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify({
      anthropic_version: "bedrock-2023-05-31",
      system: `You are an expert financial analyst specializing in stock market data. 
      Your task is to process and enrich stock information, providing accurate and detailed data for each stock. 
      You must return ONLY a JSON array that matches the specified schema, including the current month and year for each stock entry. 
      Do not include any additional text or explanations. 
      Please ensure that the JSON array is formatted correctly. 
      Prices should be listed with Load The Boat being the lowest numerical price and quick entry being the highest numerical price.`,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Process the following list of stocks and return a JSON array containing these fields for each stock:
1. Full company name (stockName)
2. Stock ticker symbol (tickerSymbol)
3. Whether it's a cryptocurrency (isCrypto)
4. Quick Entry Price (quickEntryPrice)
5. Swing Trade Price (swingTradePrice)
6. Load the Boat Price (loadTheBoatPrice)
7. Current month (month)
8. Current year (year)

Stock list:
${stockData}

Ensure that:
- The stockName is the full company name
- The tickerSymbol is accurate
- isCrypto is correctly set to true for cryptocurrencies and false for stocks
- All price fields are numbers (not strings)
- The month field is set to "${currentMonth}" for all entries
- The year field is set to ${currentYear} for all entries

Return ONLY the JSON array without any additional text. The response must strictly adhere to this JSON schema:

${JSON.stringify(jsonSchema, null, 2)}`,
            },
          ],
        },
      ],
      max_tokens: 4096,
      temperature: 0.1,
    }),
  };

  try {
    const bedrockClient = new BedrockRuntimeClient({ region: "us-east-1" });
    const command = new InvokeModelCommand(params);
    const response = await bedrockClient.send(command);
    console.log("Raw Bedrock response:", JSON.stringify(response, null, 2));

    const responseBody = Buffer.from(response.body).toString();
    console.log("Response body:", responseBody);

    const parsedResponse = JSON.parse(responseBody);
    const content = parsedResponse.content?.[0]?.text;

    if (!content) {
      throw new Error("No content in Bedrock response");
    }

    console.log("Extracted content:", content);

    const processedData = JSON.parse(content);

    if (!Array.isArray(processedData)) {
      throw new Error("Processed data is not an array");
    }

    return processedData;
  } catch (error) {
    console.error("Error processing stock data with Bedrock:", error);
    throw new Error(
      `Failed to process stock data with Bedrock: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
