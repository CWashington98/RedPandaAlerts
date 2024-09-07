"use client";

import { useState, useEffect, useRef } from "react";
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
import { preprocessStockData } from "@/utils/preprocessStockData";
import { useAuthContext } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun } from "lucide-react";

const client = generateClient<Schema>();

type StockPrice = Schema["StockPrice"]["type"];
type ProcessedStockData = Schema["ProcessedStockData"]["type"];

export default function Dashboard() {
  const { fetchedUser } = useAuthContext();
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
  const { theme, toggleTheme } = useTheme();
  const [processedData, setProcessedData] = useState<ProcessedStockData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editedProcessedData, setEditedProcessedData] = useState<
    ProcessedStockData[]
  >([]);
  const editedDataRef = useRef<ProcessedStockData[]>([]);

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
    const currentMonth = currentDate.toLocaleString("default", {
      month: "long",
    });
    const currentYear = currentDate.getFullYear();

    try {
      await client.models.StockPrice.create({
        stockName: stock.stockName || "",
        tickerSymbol: stock.tickerSymbol || "",
        quickEntryPrice: stock.quickEntryPrice || 0,
        swingTradePrice: stock.swingTradePrice || 0,
        loadTheBoatPrice: stock.loadTheBoatPrice || 0,
        isCrypto: stock.isCrypto || false,
        month: currentMonth,
        year: currentYear,
        userId: "",
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

  async function handleTextSubmit() {
    setIsProcessing(true);
    console.log("handleTextSubmit, ", fetchedUser?.id);
    try {
      const preprocessedData = preprocessStockData(textInput);
      console.log("preprocessedData", preprocessedData);
      
      // Ensure preprocessedData is an array
      if (!Array.isArray(preprocessedData)) {
        throw new Error("Preprocessed data is not an array");
      }

      const response = await client.queries.processStockData({
        preprocessedData: preprocessedData.map((stock) => JSON.stringify(stock)),
        userId: fetchedUser?.id!,
      });
      console.log("response", response);
      const processedData = response.data as ProcessedStockData[];
      setProcessedData(processedData);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error processing stock data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process stock data. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  }

  function handleProcessedDataChange(
    index: number,
    field: keyof ProcessedStockData,
    value: string | number | boolean
  ) {
    const updatedData = [...editedProcessedData];
    updatedData[index] = {
      ...updatedData[index],
      [field]: value,
    };
    setEditedProcessedData(updatedData);
    editedDataRef.current = updatedData;
  }

  async function handleFinalSubmit() {
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.toLocaleString("default", {
        month: "long",
      });
      const currentYear = currentDate.getFullYear();

      const stocksToAdd = editedDataRef.current.map((stock) => ({
        ...stock,
        month: currentMonth,
        year: currentYear,
        userId: fetchedUser?.id!,
      }));

      const createdStocksResponses = await Promise.all(
        stocksToAdd.map((stock) => client.models.StockPrice.create(stock))
      );

      const createdStocks = createdStocksResponses
        .map((response) => response.data)
        .filter((stock): stock is StockPrice => stock !== null);

      setStocks((prevStocks) => [...prevStocks, ...createdStocks]);
      setProcessedData([]);
      setEditedProcessedData([]);

      toast({
        title: "Success",
        description: `${createdStocks.length} stocks added successfully.`,
      });
    } catch (error) {
      console.error("Error adding stocks:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add stocks. Please try again.",
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
    <div className="container mx-auto p-4 bg-background text-foreground min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Your Stock Dashboard</h1>
        <Button onClick={toggleTheme} variant="outline" size="icon">
          {theme === "light" ? (
            <Moon className="h-[1.2rem] w-[1.2rem]" />
          ) : (
            <Sun className="h-[1.2rem] w-[1.2rem]" />
          )}
        </Button>
      </div>
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
                        onChange={(e) =>
                          setNewStock({
                            ...newStock,
                            stockName: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="tickerSymbol">Ticker Symbol</Label>
                      <Input
                        id="tickerSymbol"
                        value={newStock.tickerSymbol}
                        onChange={(e) =>
                          setNewStock({
                            ...newStock,
                            tickerSymbol: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isCrypto"
                        checked={newStock.isCrypto}
                        onCheckedChange={(checked) =>
                          setNewStock({
                            ...newStock,
                            isCrypto: checked as boolean,
                          })
                        }
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
                  <CardTitle>
                    {stock.stockName} ({stock.tickerSymbol})
                  </CardTitle>
                  <div className="text-sm text-muted-foreground">
                    {stock.isCrypto ? "Cryptocurrency" : "Stock"}
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

      {processedData?.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Processed Stock Data</h2>
          <div className="space-y-4">
            {processedData.map((stock, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>
                    <Input
                      value={
                        editedProcessedData[index]?.stockName || stock.stockName
                      }
                      onChange={(e) =>
                        handleProcessedDataChange(
                          index,
                          "stockName",
                          e.target.value
                        )
                      }
                    />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <Label>Ticker Symbol</Label>
                      <Input
                        value={
                          editedProcessedData[index]?.tickerSymbol ||
                          stock.tickerSymbol
                        }
                        onChange={(e) =>
                          handleProcessedDataChange(
                            index,
                            "tickerSymbol",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="flex items-center">
                      <Label className="mr-2">Crypto:</Label>
                      <Checkbox
                        checked={
                          editedProcessedData[index]?.isCrypto || stock.isCrypto
                        }
                        onCheckedChange={(checked) =>
                          handleProcessedDataChange(
                            index,
                            "isCrypto",
                            checked as boolean
                          )
                        }
                      />
                    </div>
                    <div>
                      <Label>Quick Entry Price</Label>
                      <Input
                        type="number"
                        value={
                          editedProcessedData[index]?.quickEntryPrice ||
                          stock.quickEntryPrice
                        }
                        onChange={(e) =>
                          handleProcessedDataChange(
                            index,
                            "quickEntryPrice",
                            parseFloat(e.target.value)
                          )
                        }
                      />
                    </div>
                    <div>
                      <Label>Swing Trade Price</Label>
                      <Input
                        type="number"
                        value={
                          editedProcessedData[index]?.swingTradePrice ||
                          stock.swingTradePrice
                        }
                        onChange={(e) =>
                          handleProcessedDataChange(
                            index,
                            "swingTradePrice",
                            parseFloat(e.target.value)
                          )
                        }
                      />
                    </div>
                    <div>
                      <Label>Load the Boat Price</Label>
                      <Input
                        type="number"
                        value={
                          editedProcessedData[index]?.loadTheBoatPrice ||
                          stock.loadTheBoatPrice
                        }
                        onChange={(e) =>
                          handleProcessedDataChange(
                            index,
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
          <Button onClick={handleFinalSubmit} className="mt-4">
            Add Stocks to Dashboard
          </Button>
        </div>
      )}
    </div>
  );
}
