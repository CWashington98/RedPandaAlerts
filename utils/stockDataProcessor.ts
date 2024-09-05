type CleanedStockData = {
  stockName: string;
  tickerSymbol: string;
  isCrypto: boolean;
  quickEntryPrice: number;
  swingTradePrice: number;
  loadTheBoatPrice: number;
};

export function processStockData(input: string): CleanedStockData[] {
  const lines = input.split('\n').filter(line => line.trim() !== '');
  const cleanedData: CleanedStockData[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip lines that don't contain price data
    if (!line.includes('$') && !line.toLowerCase().includes('bitcoin') && !line.toLowerCase().includes('ethereum')) {
      continue;
    }

    const parts = line.split(/\s+/);
    if (parts.length < 4) continue;

    const stockName = parts[0];
    let tickerSymbol = parts[0].toUpperCase();
    const isCrypto = ['Bitcoin', 'Ethereum'].includes(stockName);

    // Extract prices, removing '$' and converting to numbers
    const prices = parts.slice(1).map(price => parseFloat(price.replace('$', '').replace(',', '')))
      .filter(price => !isNaN(price));

    if (prices.length < 3) continue;

    // Handle special cases
    switch (stockName.toLowerCase()) {
      case 'voo':
        tickerSymbol = 'VOO';
        break;
      case 'xom':
        tickerSymbol = 'XOM';
        break;
      case 'axp':
        tickerSymbol = 'AXP';
        break;
      case 'pulte homes':
        tickerSymbol = 'PHM';
        break;
      case 'novo':
        tickerSymbol = 'NVO';
        break;
      case 'tmus':
        tickerSymbol = 'TMUS';
        break;
      case 'xlv':
        tickerSymbol = 'XLV';
        break;
      case 'sny':
        tickerSymbol = 'SNY';
        break;
      case 'hd':
        tickerSymbol = 'HD';
        break;
      case 'oc':
        tickerSymbol = 'OC';
        break;
      case 'panw':
        tickerSymbol = 'PANW';
        break;
      case 'dg':
        tickerSymbol = 'DG';
        break;
      case 'jkhy':
        tickerSymbol = 'JKHY';
        break;
      case 'avgo':
        tickerSymbol = 'AVGO';
        break;
    }

    cleanedData.push({
      stockName,
      tickerSymbol,
      isCrypto,
      quickEntryPrice: prices[0],
      swingTradePrice: prices[1],
      loadTheBoatPrice: prices[2],
    });
  }

  return cleanedData;
}