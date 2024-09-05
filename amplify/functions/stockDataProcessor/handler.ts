import { Handler } from "aws-lambda";
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

async function processStockData(preprocessedData: any[]): Promise<ProcessedStockData[]> {
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
        loadTheBoatPrice: { type: "number" }
      },
      required: ["stockName", "tickerSymbol", "isCrypto", "quickEntryPrice", "swingTradePrice", "loadTheBoatPrice"]
    }
  };

  const prompt = `
    For each stock in the following list, provide the following information:
    1. Full company name (stockName)
    2. Stock ticker symbol (tickerSymbol)
    3. Whether it's a cryptocurrency (isCrypto)

    Here's the list of stocks with their price data:
    ${preprocessedData.map(stock => 
      `${stock.stockName}: Quick Entry: $${stock.quickEntryPrice}, Swing Trade: $${stock.swingTradePrice}, Load the Boat: $${stock.loadTheBoatPrice}`
    ).join('\n')}

    Please format the response as a JSON array of objects, with each object containing the above information for a single stock, along with the provided price data. The response should strictly adhere to the following JSON schema:

    ${JSON.stringify(jsonSchema, null, 2)}

    Ensure that the stockName is the full company name, the tickerSymbol is accurate, and isCrypto is correctly set to true for cryptocurrencies and false for stocks.
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error("No content in OpenAI response");
  }

  try {
    const processedData = JSON.parse(content);
    return processedData;
  } catch (error) {
    console.error("Error parsing OpenAI response:", error);
    throw new Error("Failed to parse OpenAI response");
  }
}