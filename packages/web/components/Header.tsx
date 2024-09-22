"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@web/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun, Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import AddPriceAlertModal from "@web/components/AddPriceAlertModal";

export function Header() {
  const { toggleTheme } = useTheme();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  function onAddNewPriceAlerts() {
    setIsAddModalOpen(true);
  }

  function handleCloseModal() {
    setIsAddModalOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-bold text-lg">Stock Price Alerts</span>
            </Link>
            <nav className="hidden md:ml-6 md:flex md:space-x-8">
              <Link
                href="#"
                className="text-sm font-medium text-foreground/60 hover:text-foreground/80 transition-colors"
              >
                How it Works
              </Link>
              <Link
                href="#"
                className="text-sm font-medium text-foreground/60 hover:text-foreground/80 transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="#"
                className="text-sm font-medium text-foreground/60 hover:text-foreground/80 transition-colors"
              >
                Contact
              </Link>
            </nav>
          </div>
          <div className="flex items-center">
            <Button
              className="hidden md:inline-flex mr-4"
              onClick={onAddNewPriceAlerts}
            >
              Add New Price Alerts
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onAddNewPriceAlerts}>
                  Add New Price Alerts
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="#">How it Works</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="#">Pricing</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="#">Contact</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle theme"
              onClick={toggleTheme}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
          </div>
        </div>
      </div>
      <AddPriceAlertModal isOpen={isAddModalOpen} onClose={handleCloseModal} />
    </header>
  );
}
