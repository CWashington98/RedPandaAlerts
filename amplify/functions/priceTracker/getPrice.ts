import yahooFinance from "yahoo-finance2";
import { Schema } from "../../data/resource";
import { generateClient } from "@aws-amplify/api";

// Define the return type for fetchStockQuote
interface StockQuote {
  regularMarketPrice: number;
  regularMarketDayLow: number;
}

export async function fetchStockQuote(
  tickerSymbol: string,
  assetName: string
): Promise<StockQuote | {}> {
  try {
    let adjustedTicker = tickerSymbol;
    if (tickerSymbol === "ETH" || tickerSymbol === "BTC") {
      adjustedTicker = `${tickerSymbol}-USD`;
      console.log("New ticker:", adjustedTicker);
    }

    let quote = await yahooFinance.quote(adjustedTicker);
    if (!quote) {
      quote = await yahooFinance.quote(assetName);
    }

    if (quote) {
      const { regularMarketPrice, regularMarketDayLow } = quote;
      console.log(
        "Ticker data:",
        adjustedTicker,
        regularMarketPrice,
        regularMarketDayLow
      );
      return { regularMarketPrice, regularMarketDayLow };
    } else {
      console.error(`No quote found for ${adjustedTicker} or ${assetName}`);
      return {};
    }
  } catch (error) {
    console.error(`Error fetching data for ${tickerSymbol}:`, error);
    return {};
  }
}

export async function checkAndUpdateStock(
  stockData: Schema["StockPrice"]["type"]
): Promise<void> {
  console.log(
    "checkAndUpdateStock:",
    stockData.tickerSymbol,
    stockData.stockName
  );
  const quote = await fetchStockQuote(
    stockData.tickerSymbol,
    stockData.stockName
  );

  if (!("regularMarketPrice" in quote) || !("regularMarketDayLow" in quote)) {
    console.error("Missing price data.");
    return;
  }

  const { regularMarketPrice, regularMarketDayLow } = quote;

  const updateRequired = [
    "loadTheBoatPrice",
    "swingTradePrice",
    "quickEntryPrice",
  ].some((entry) => {
    const entryPrice: number = stockData[
      entry as keyof typeof stockData
    ] as number;
    const marketPrice = regularMarketPrice;
    const dayLow = regularMarketDayLow;

    console.log(`${stockData.tickerSymbol}: ${entry} comparison:`, {
      entryPrice,
      marketPrice,
      dayLow,
      marketPriceCondition: marketPrice <= entryPrice,
      dayLowCondition: dayLow <= entryPrice,
    });

    if (marketPrice <= entryPrice || dayLow <= entryPrice) {
      console.log(
        `TRIGGER ${stockData.tickerSymbol} ${entry.toUpperCase()}:`,
        stockData.tickerSymbol
      );
      // Update the corresponding hit field
      switch (entry) {
        case "loadTheBoatPrice":
          stockData.loadTheBoatHit = true;
          break;
        case "swingTradePrice":
          stockData.swingTradeHit = true;
          break;
        case "quickEntryPrice":
          stockData.quickEntryHit = true;
          break;
      }
      return true;
    }
    return false;
  });

  if (updateRequired) {
    console.log("Update required for", stockData.tickerSymbol);
    const input: Schema["StockPrice"]["updateType"] = {
      id: stockData.id,
      loadTheBoatPrice: stockData.loadTheBoatPrice,
      loadTheBoatHit: stockData.loadTheBoatHit,
      swingTradePrice: stockData.swingTradePrice,
      swingTradeHit: stockData.swingTradeHit,
      quickEntryPrice: stockData.quickEntryPrice,
      quickEntryHit: stockData.quickEntryHit,
    };
    console.log("Update initiated:", input);
    // const result = await client.graphql({
    //   query: updateStockPrice,
    //   variables: { input },
    // });
    // console.log("Update result:", result);
    // if (result.errors) {
    //   console.error("GraphQL errors:", result.errors);
    // }
  }
}
