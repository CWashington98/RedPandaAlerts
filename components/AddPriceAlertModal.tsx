import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import React, { useEffect, useRef, useState } from "react";
import {
  AlertDialogHeader,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Button } from "./ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { DialogHeader, DialogFooter } from "./ui/dialog";
import { Input } from "./ui/input";
import { Spinner } from "./ui/spinner";
import { Textarea } from "./ui/textarea";
import { toast, useToast } from "@/hooks/use-toast";
import { preprocessStockData } from "@/utils/preprocessStockData";
import { generateClient } from "aws-amplify/api";
import { Schema } from "@/amplify/data/resource";
import { useAuthContext } from "@/contexts/AuthContext";
const client = generateClient<Schema>();

type StockPrice = Schema["StockPrice"]["type"];
type ProcessedStockData = Schema["ProcessedStockData"]["type"];

type AddPriceAlertModalProps = {
  isOpen: boolean;
  onClose: () => void;
};
const AddPriceAlertModal = ({ isOpen, onClose }: AddPriceAlertModalProps) => {
  const { fetchedUser } = useAuthContext();
  const { toast } = useToast();
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
  const [editableProcessedData, setEditableProcessedData] = useState<
    ProcessedStockData[]
  >([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [isAddingStocks, setIsAddingStocks] = useState(false);
  const editedDataRef = useRef<ProcessedStockData[]>([]);

  useEffect(() => {
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString("default", {
      month: "long",
    });
    setSelectedMonth(currentMonth);
    setAvailableMonths(
      [
        new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
        currentDate,
        new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
      ].map((date) => date.toLocaleString("default", { month: "long" }))
    );
  }, []);

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Price Alerts</DialogTitle>
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
                  <Label htmlFor="loadTheBoatPrice">Load the Boat Price</Label>
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
                <Label htmlFor="textInput">Enter stock data</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Please include three price levels for which you want to be
                  alerted on price change. (e.g., Red Panda's QuickEntry,
                  SwingTrade, LoadTheBoat)
                </p>
                <Textarea
                  id="textInput"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="AAPL,AAPL,false,150,160,170&#10;Bitcoin,BTC,true,30000,35000,40000"
                  rows={5}
                />
                <Button
                  onClick={handleProcessStockData}
                  disabled={isProcessing}
                >
                  {isProcessing ? <Spinner size="sm" className="mr-2" /> : null}
                  {isProcessing ? "Processing..." : "Process Stock Data"}
                </Button>
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
      <Dialog open={isEditModalOpen} onOpenChange={handleCloseEditModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Review and Edit Stock Data</DialogTitle>
          </DialogHeader>
          <div className="mb-4">
            <Label>Month</Label>
            <Select value={selectedMonth} onValueChange={handleMonthChange}>
              <SelectTrigger>
                <SelectValue>{selectedMonth}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {availableMonths.map((month) => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto">
            {editableProcessedData.map((stock, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>
                    {stock.stockName} ({stock.tickerSymbol})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <Label>Quick Entry Price</Label>
                      <Input
                        type="number"
                        value={stock.quickEntryPrice}
                        onChange={(e) =>
                          handleEditProcessedData(
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
                        value={stock.swingTradePrice}
                        onChange={(e) =>
                          handleEditProcessedData(
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
                        value={stock.loadTheBoatPrice}
                        onChange={(e) =>
                          handleEditProcessedData(
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
          <DialogFooter>
            <Button onClick={handleFinalSubmit} disabled={isAddingStocks}>
              {isAddingStocks ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Adding Stocks...
                </>
              ) : (
                "Add Stocks to Dashboard"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to close without
              saving?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelClose}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmClose}>
              Close without saving
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    addNewStock(newStock);
  }

  async function handleProcessStockData() {
    setIsProcessing(true);
    try {
      const cleanedData = preprocessStockData(textInput);
      console.log("Cleaned data:", cleanedData);
      const response = await client.queries.processStockData({
        stockData: cleanedData,
        userId: fetchedUser?.id || "",
      });

      if (response.data?.statusCode === 200) {
        const parsedData = JSON.parse(response.data.body);
        setEditableProcessedData(parsedData.data);
        toast({
          title: "Success",
          description: "Stock data processed successfully",
        });
        setIsEditModalOpen(true);
      } else {
        throw new Error(
          JSON.parse(response.data?.body || "{}").error || "Unknown error"
        );
      }
    } catch (error) {
      console.error("Error processing stock data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to process stock data: ${error}`,
      });
    } finally {
      setIsProcessing(false);
      onClose();
    }
  }

  function handleMonthChange(newMonth: string) {
    setSelectedMonth(newMonth);
    setEditableProcessedData((prevData) =>
      prevData.map((stock) => ({ ...stock, month: newMonth }))
    );
  }

  function handleEditProcessedData(index: number, field: string, value: any) {
    setEditableProcessedData((prevData) => {
      const newData = [...prevData];
      newData[index] = { ...newData[index], [field]: value };
      return newData;
    });
    editedDataRef.current = editableProcessedData;
  }

  async function handleFinalSubmit() {
    setIsAddingStocks(true);
    try {
      if (!fetchedUser?.id) {
        throw new Error("User ID not found");
      }
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();

      for (const stock of editedDataRef.current) {
        await client.models.StockPrice.create({
          stockName: stock.stockName,
          tickerSymbol: stock.tickerSymbol,
          isCrypto: stock.isCrypto,
          quickEntryPrice: stock.quickEntryPrice,
          swingTradePrice: stock.swingTradePrice,
          loadTheBoatPrice: stock.loadTheBoatPrice,
          month: selectedMonth,
          year: currentYear,
          userId: fetchedUser?.id!,
        });
      }
      toast({
        title: "Success",
        description: "Stocks added successfully.",
      });
      setEditableProcessedData([]);
    } catch (error) {
      console.error("Error adding stocks:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add stocks. Please try again.",
      });
    } finally {
      setIsAddingStocks(false);
      setIsEditModalOpen(false);
    }
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
      onClose();
    } catch (error) {
      console.error("Error adding new stock:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add new stock price. Please try again.",
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

  function handleCloseEditModal() {
    if (editableProcessedData.length > 0) {
      setShowConfirmDialog(true);
    } else {
      setIsEditModalOpen(false);
    }
  }

  function handleConfirmClose() {
    setShowConfirmDialog(false);
    setIsEditModalOpen(false);
    setEditableProcessedData([]);
  }

  function handleCancelClose() {
    setShowConfirmDialog(false);
  }
};

export default AddPriceAlertModal;
