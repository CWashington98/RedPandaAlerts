"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { generateClient } from "aws-amplify/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Schema } from "@/amplify/data/resource";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { processStockData } from "@/utils/stockDataProcessor";

const client = generateClient<Schema>();

type StockPrice = Schema["StockPrice"]["type"];

export default function Dashboard() {
  const [stocks, setStocks] = useState<StockPrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [immediateAlerts, setImmediateAlerts] = useState(true);
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [prevTokens, setPrevTokens] = useState<string[]>([]);
  const router = useRouter();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStock, setNewStock] = useState({
    stockName: "",
    tickerSymbol: "",
    isCrypto: false,
    quickEntryPrice: 0,
    swingTradePrice: 0,
    loadTheBoatPrice: 0,
  });
  const [textInput, setTextInput] = useState("");
  const [jsonInput, setJsonInput] = useState("");

  useEffect(() => {
    fetchStocks();
  }, []);

  async function fetchStocks(token?: string | null) {
    setIsLoading(true);
    try {
      const response = await client.models.StockPrice.list({
        limit: 10,
        nextToken: token,
      });
      setStocks(response.data);
      setNextToken(response.nextToken ?? null);
      if (token) {
        setPrevTokens((prev) => [...prev, token]);
      }
    } catch (error) {
      console.error("Error fetching stocks:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch stocks. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  function handleNextPage() {
    if (nextToken) {
      fetchStocks(nextToken);
    }
  }

  function handlePrevPage() {
    if (prevTokens.length > 0) {
      const newPrevTokens = [...prevTokens];
      const prevToken = newPrevTokens.pop();
      setPrevTokens(newPrevTokens);
      fetchStocks(prevToken || null);
    }
  }

  async function updateStock(id: string, field: string, value: number) {
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString("default", {
      month: "long",
    });
    const currentYear = currentDate.getFullYear();

    const stockToUpdate = stocks.find((stock) => stock.id === id);
    if (
      !stockToUpdate ||
      stockToUpdate.month !== currentMonth ||
      stockToUpdate.year !== currentYear
    ) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You can only edit prices for the current month.",
      });
      return;
    }

    try {
      await client.models.StockPrice.update({
        id,
        [field]: value,
      });
      toast({
        title: "Success",
        description: "Stock price updated successfully.",
      });
      fetchStocks();
    } catch (error) {
      console.error("Error updating stock:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update stock price. Please try again.",
      });
    }
  }

  function handleAlertPreferenceChange() {
    setImmediateAlerts(!immediateAlerts);
    toast({
      title: "Alert Preference Updated",
      description: `You will now receive ${
        immediateAlerts ? "daily" : "immediate"
      } alerts.`,
    });
  }

  async function addNewStock(stock: Partial<StockPrice>) {
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
    const currentYear = currentDate.getFullYear();

    try {
      await client.models.StockPrice.create({
        ...stock,
        month: currentMonth,
        year: currentYear,
        id: crypto.randomUUID(),
      });
      toast({
        title: "Success",
        description: "New stock price added successfully.",
      });
      fetchStocks();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding new stock:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add new stock price. Please try again.",
      });
    }
  }

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    addNewStock(newStock);
  }

  function handleTextSubmit() {
    const processedData = processStockData(textInput);
    
    if (processedData.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No valid stock data found. Please check your input and try again.",
      });
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    processedData.forEach(async (stock) => {
      try {
        await addNewStock(stock);
        successCount++;
      } catch (error) {
        console.error(`Error adding stock ${stock.stockName}:`, error);
        errorCount++;
      }
    });

    if (successCount > 0) {
      toast({
        title: "Stocks Added",
        description: `Successfully added ${successCount} stock${successCount > 1 ? 's' : ''}.`,
      });
    }

    if (errorCount > 0) {
      toast({
        variant: "destructive",
        title: "Some Stocks Not Added",
        description: `Failed to add ${errorCount} stock${errorCount > 1 ? 's' : ''}. Please check the console for details.`,
      });
    }

    if (successCount > 0 || errorCount > 0) {
      fetchStocks(); // Refresh the stocks list
      setIsModalOpen(false);
    }

    // If some lines were skipped during processing
    if (processedData.length < textInput.split('\n').filter(line => line.trim() !== '').length) {
      toast({
        variant: "warning",
        title: "Some Lines Skipped",
        description: "Some lines in your input were skipped due to invalid format. Please check your input.",
      });
    }
  }

  function handleJsonSubmit() {
    try {
      const stocks = JSON.parse(jsonInput);
      stocks.forEach((stock: Partial<StockPrice>) => addNewStock(stock));
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid JSON format. Please check your input.",
      });
    }
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Your Stock Dashboard</h1>
      <div className="mb-4">
        <Switch
          checked={immediateAlerts}
          onCheckedChange={handleAlertPreferenceChange}
        />
        <span className="ml-2">
          {immediateAlerts ? "Immediate Alerts" : "Daily Alerts"}
        </span>
      </div>
      {stocks.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-4">No stocks added yet</h2>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="transition-all duration-2000 ease-in-out transform hover:scale-105 animate-breathe">
                Add Your First Stock Alert
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Stock Alerts</DialogTitle>
              </DialogHeader>
              <Tabs defaultValue="manual">
                <TabsList>
                  <TabsTrigger value="manual">Manual Input</TabsTrigger>
                  <TabsTrigger value="text">Text Input</TabsTrigger>
                  <TabsTrigger value="json">JSON Input</TabsTrigger>
                </TabsList>
                <TabsContent value="manual">
                  <form onSubmit={handleManualSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="stockName">Stock Name</Label>
                      <Input
                        id="stockName"
                        value={newStock.stockName}
                        onChange={(e) => setNewStock({...newStock, stockName: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="tickerSymbol">Ticker Symbol</Label>
                      <Input
                        id="tickerSymbol"
                        value={newStock.tickerSymbol}
                        onChange={(e) => setNewStock({...newStock, tickerSymbol: e.target.value})}
                        required
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isCrypto"
                        checked={newStock.isCrypto}
                        onCheckedChange={(checked) => setNewStock({...newStock, isCrypto: checked as boolean})}
                      />
                      <Label htmlFor="isCrypto">Is Cryptocurrency</Label>
                    </div>
                    <div>
                      <Label htmlFor="quickEntryPrice">Quick Entry Price</Label>
                      <Input
                        id="quickEntryPrice"
                        type="number"
                        value={newStock.quickEntryPrice}
                        onChange={(e) =>
                          setNewStock({
                            ...newStock,
                            quickEntryPrice: parseFloat(e.target.value),
                          })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="swingTradePrice">Swing Trade Price</Label>
                      <Input
                        id="swingTradePrice"
                        type="number"
                        value={newStock.swingTradePrice}
                        onChange={(e) =>
                          setNewStock({
                            ...newStock,
                            swingTradePrice: parseFloat(e.target.value),
                          })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="loadTheBoatPrice">
                        Load the Boat Price
                      </Label>
                      <Input
                        id="loadTheBoatPrice"
                        type="number"
                        value={newStock.loadTheBoatPrice}
                        onChange={(e) =>
                          setNewStock({
                            ...newStock,
                            loadTheBoatPrice: parseFloat(e.target.value),
                          })
                        }
                        required
                      />
                    </div>
                    <Button type="submit">Add Stock</Button>
                  </form>
                </TabsContent>
                <TabsContent value="text">
                  <div className="space-y-4">
                    <Label htmlFor="textInput">
                      Enter stock data (one per line, format:
                      Name,TickerSymbol,IsCrypto,QuickEntry,SwingTrade,LoadTheBoat)
                    </Label>
                    <Textarea
                      id="textInput"
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="AAPL,AAPL,false,150,160,170&#10;Bitcoin,BTC,true,30000,35000,40000"
                      rows={5}
                    />
                    <Button onClick={handleTextSubmit}>Add Stocks</Button>
                  </div>
                </TabsContent>
                <TabsContent value="json">
                  <div className="space-y-4">
                    <Label htmlFor="jsonInput">Enter JSON data</Label>
                    <Textarea
                      id="jsonInput"
                      value={jsonInput}
                      onChange={(e) => setJsonInput(e.target.value)}
                      placeholder='[{"stockName":"AAPL","tickerSymbol":"AAPL","isCrypto":false,"quickEntryPrice":150,"swingTradePrice":160,"loadTheBoatPrice":170}]'
                      rows={5}
                    />
                    <Button onClick={handleJsonSubmit}>Add Stocks</Button>
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stocks.map((stock) => (
              <Card key={stock.id}>
                <CardHeader>
                  <CardTitle>{stock.stockName} ({stock.tickerSymbol})</CardTitle>
                  <div className="text-sm text-muted-foreground">
                    {stock.isCrypto ? 'Cryptocurrency' : 'Stock'}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm font-medium">
                        Quick Entry
                      </label>
                      <Input
                        type="number"
                        value={stock.quickEntryPrice}
                        onChange={(e) =>
                          updateStock(
                            stock.id,
                            "quickEntryPrice",
                            parseFloat(e.target.value)
                          )
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">
                        Swing Trade
                      </label>
                      <Input
                        type="number"
                        value={stock.swingTradePrice}
                        onChange={(e) =>
                          updateStock(
                            stock.id,
                            "swingTradePrice",
                            parseFloat(e.target.value)
                          )
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">
                        Load the Boat
                      </label>
                      <Input
                        type="number"
                        value={stock.loadTheBoatPrice}
                        onChange={(e) =>
                          updateStock(
                            stock.id,
                            "loadTheBoatPrice",
                            parseFloat(e.target.value)
                          )
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-4 flex justify-between">
            <Button onClick={handlePrevPage} disabled={prevTokens.length === 0}>
              Previous Page
            </Button>
            <Button onClick={handleNextPage} disabled={!nextToken}>
              Next Page
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
