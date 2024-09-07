"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useStockData } from "@/contexts/StockDataContext";
import { StockDataCard } from "@/components/StockDataCard";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { generateClient } from "aws-amplify/api";
import { Schema } from "@/amplify/data/resource";
import AddPriceAlertModal from "@/components/AddPriceAlertModal";
import { useAuthContext } from "@/contexts/AuthContext";

const client = generateClient<Schema>();
export default function Dashboard() {
  const { fetchedUser } = useAuthContext();
  const { stocks, isLoading } = useStockData();
  const [immediateAlerts, setImmediateAlerts] = useState(true);
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [displayedStocks, setDisplayedStocks] = useState(stocks);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const stocksPerPage = 15;
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [selectedFilterMonth, setSelectedFilterMonth] = useState<string>("All");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const currentDate = new Date();
    const months = [
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 2, 1),
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
      currentDate,
    ].map((date) => date.toLocaleString("default", { month: "long" }));
    setAvailableMonths(["All", ...months]);
  }, []);

  useEffect(() => {
    const filteredStocks = stocks.filter((stock) => {
      const matchesSearch =
        stock.stockName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.tickerSymbol.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesMonth =
        selectedFilterMonth === "All" || stock.month === selectedFilterMonth;
      return matchesSearch && matchesMonth;
    });

    setTotalPages(Math.ceil(filteredStocks.length / stocksPerPage));
    const startIndex = (currentPage - 1) * stocksPerPage;
    const endIndex = startIndex + stocksPerPage;
    setDisplayedStocks(filteredStocks.slice(startIndex, endIndex));
  }, [stocks, searchTerm, selectedFilterMonth, currentPage]);

  function handleNextPage() {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  }

  function handlePrevPage() {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  }

  async function handleAlertPreferenceChange() {
    if (!fetchedUser?.id) return;
    await client.models.User.update({
      id: fetchedUser?.id,
      alertFrequency:
        fetchedUser?.alertFrequency === "daily" ? "immediate" : "daily",
    });
    setImmediateAlerts(!immediateAlerts);
    toast({
      title: "Alert Preference Updated",
      description: `You will now receive ${
        immediateAlerts ? "daily" : "immediate"
      } alerts.`,
    });
  }

  function handleCloseModal() {
    setIsModalOpen(false);
  }
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto p-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <Spinner size="lg" />
            <p className="mt-4 text-lg text-muted-foreground">
              Fetching your stocks...
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row mb-4 space-y-4 sm:space-y-0 sm:space-x-4 items-center">
              <div className="relative flex-grow">
                <Input
                  type="text"
                  placeholder="Search by stock name or ticker symbol"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
              </div>
              <Select
                value={selectedFilterMonth}
                onValueChange={setSelectedFilterMonth}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by month" />
                </SelectTrigger>
                <SelectContent>
                  {availableMonths.map((month) => (
                    <SelectItem key={month} value={month}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center space-x-2">
                <Switch
                  id="alert-mode"
                  checked={immediateAlerts}
                  onCheckedChange={handleAlertPreferenceChange}
                />
                <Label htmlFor="alert-mode">
                  {immediateAlerts ? "Immediate" : "Daily"} Alerts
                </Label>
              </div>
            </div>

            {displayedStocks.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {displayedStocks.map((stock) => (
                  <StockDataCard key={stock.id} stock={stock} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h2 className="text-xl font-semibold mb-4">No stocks found</h2>
                <Button onClick={() => setIsModalOpen(true)}>
                  Add Your First Stock Alert
                </Button>
              </div>
            )}

            {displayedStocks.length > 0 && (
              <div className="mt-4 flex justify-between items-center">
                <Button onClick={handlePrevPage} disabled={currentPage === 1}>
                  Previous Page
                </Button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  Next Page
                </Button>
              </div>
            )}
          </>
        )}
      </main>
      <AddPriceAlertModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  );
}
