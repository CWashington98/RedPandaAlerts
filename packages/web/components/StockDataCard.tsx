import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Schema } from "@/amplify/data/resource";
import { cn } from "@/lib/utils";

type StockPrice = Schema["StockPrice"]["type"];

interface StockDataCardProps {
  stock: StockPrice;
}

export function StockDataCard({ stock }: StockDataCardProps) {
  return (
    <Card key={stock.id}>
      <CardHeader>
        <CardTitle>
          {stock.stockName} ({stock.tickerSymbol})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <Label
              htmlFor={`quickEntry-${stock.id}`}
              className={cn(
                stock.quickEntryHit && "text-green-500 font-semibold"
              )}
            >
              Quick Entry Price {stock.quickEntryHit && "(Hit)"}
            </Label>
            <Input
              id={`quickEntry-${stock.id}`}
              value={stock.quickEntryPrice}
              readOnly
              className={cn(
                stock.quickEntryHit && "text-green-500 font-semibold"
              )}
            />
          </div>
          <div>
            <Label
              htmlFor={`swingTrade-${stock.id}`}
              className={cn(
                stock.swingTradeHit && "text-green-500 font-semibold"
              )}
            >
              Swing Trade Price {stock.swingTradeHit && "(Hit)"}
            </Label>
            <Input
              id={`swingTrade-${stock.id}`}
              value={stock.swingTradePrice}
              readOnly
              className={cn(
                stock.swingTradeHit && "text-green-500 font-semibold"
              )}
            />
          </div>
          <div>
            <Label
              htmlFor={`loadTheBoat-${stock.id}`}
              className={cn(
                stock.loadTheBoatHit && "text-green-500 font-semibold"
              )}
            >
              Load The Boat Price {stock.loadTheBoatHit && "(Hit)"}
            </Label>
            <Input
              id={`loadTheBoat-${stock.id}`}
              value={stock.loadTheBoatPrice}
              readOnly
              className={cn(
                stock.loadTheBoatHit && "text-green-500 font-semibold"
              )}
            />
          </div>
          <div>
            <Label htmlFor={`month-${stock.id}`}>Month</Label>
            <Input id={`month-${stock.id}`} value={stock.month} readOnly />
          </div>
          <div>
            <Label htmlFor={`year-${stock.id}`}>Year</Label>
            <Input id={`year-${stock.id}`} value={stock.year} readOnly />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
