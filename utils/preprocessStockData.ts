type PreprocessedStockData = {
  stockName: string;
  quickEntryPrice: number;
  swingTradePrice: number;
  loadTheBoatPrice: number;
};

export function preprocessStockData(input: string): PreprocessedStockData[] {
  const lines = input.split('\n').filter(line => line.trim() !== '');
  const preprocessedData: PreprocessedStockData[] = [];
  let currentStock: Partial<PreprocessedStockData> = {};

  for (let line of lines) {
    line = line.trim();
    if (line === '') continue;

    const priceMatch = line.match(/\$?(\d+(\.\d+)?)/);
    if (priceMatch) {
      const price = parseFloat(priceMatch[1]);
      if (!currentStock.quickEntryPrice) {
        currentStock.quickEntryPrice = price;
      } else if (!currentStock.swingTradePrice) {
        currentStock.swingTradePrice = price;
      } else if (!currentStock.loadTheBoatPrice) {
        currentStock.loadTheBoatPrice = price;
        preprocessedData.push(currentStock as PreprocessedStockData);
        currentStock = {};
      }
    } else if (!currentStock.stockName) {
      currentStock.stockName = line;
    }
  }

  return preprocessedData;
}