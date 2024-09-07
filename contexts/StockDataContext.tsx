"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { generateClient } from "aws-amplify/api";
import { Schema } from "@/amplify/data/resource";
import { useAuthContext } from "@/contexts/AuthContext";

const client = generateClient<Schema>();

type StockPrice = Schema["StockPrice"]["type"];

interface StockDataContextType {
  stocks: StockPrice[];
  isLoading: boolean;
  fetchAllStocks: () => Promise<void>;
}

const StockDataContext = createContext<StockDataContextType | undefined>(
  undefined
);

export function useStockData() {
  const context = useContext(StockDataContext);
  if (context === undefined) {
    throw new Error("useStockData must be used within a StockDataProvider");
  }
  return context;
}

export function StockDataProvider({ children }: { children: ReactNode }) {
  const [stocks, setStocks] = useState<StockPrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { fetchedUser } = useAuthContext();

  const fetchAllStocks = async () => {
    if (!fetchedUser?.id) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      let allStocks: StockPrice[] = [];
      let nextToken: string | undefined = undefined;

      do {
        const { data: stockPrices, nextToken: nextTokenResponse } =
          await client.models.StockPrice.list({
            filter: { userId: { eq: fetchedUser.id } },
            limit: 100,
            nextToken: nextToken,
          });

        allStocks = [...allStocks, ...stockPrices];
        nextToken = nextTokenResponse || undefined;
      } while (nextToken);

      setStocks(allStocks);
    } catch (error) {
      console.error("Error fetching stocks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (fetchedUser?.id) {
      fetchAllStocks();
    } else {
      setIsLoading(false);
    }

    // Set up subscription for real-time updates
    const subscription = client.models.StockPrice.observeQuery({
      filter: { userId: { eq: fetchedUser?.id } },
    }).subscribe({
      next: ({ items }) => {
        setStocks(items);
      },
      error: (error) => console.error("Subscription error:", error),
    });

    return () => subscription.unsubscribe();
  }, [fetchedUser?.id]);

  return (
    <StockDataContext.Provider value={{ stocks, isLoading, fetchAllStocks }}>
      {children}
    </StockDataContext.Provider>
  );
}
