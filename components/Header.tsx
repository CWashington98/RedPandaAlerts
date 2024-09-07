"use client";

import Link from "next/link";
import useTheme from '@/contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import { Button } from "@/components/ui/button";

export function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="px-4 lg:px-6 h-14 flex items-center border-b bg-background text-foreground">
      <Link
        href="/"
        className="flex items-center justify-center"
        prefetch={false}
      >
        <span className="font-bold text-lg">Stock Price Alerts</span>
      </Link>
      <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
        <Link
          href="#"
          className="text-sm font-medium hover:underline underline-offset-4"
          prefetch={false}
        >
          How it Works
        </Link>
        <Link
          href="#"
          className="text-sm font-medium hover:underline underline-offset-4"
          prefetch={false}
        >
          Pricing
        </Link>
        <Link
          href="#"
          className="text-sm font-medium hover:underline underline-offset-4"
          prefetch={false}
        >
          Contact
        </Link>
        <Link
          href="/sign-up"
          className="text-sm font-medium hover:underline underline-offset-4"
          prefetch={false}
        >
          Sign Up
        </Link>
        <Link
          href="/login"
          className="text-sm font-medium hover:underline underline-offset-4"
          prefetch={false}
        >
          Login
        </Link>
        <Button onClick={toggleTheme} variant="outline" size="icon">
          {theme === 'light' ? <Moon className="h-[1.2rem] w-[1.2rem]" /> : <Sun className="h-[1.2rem] w-[1.2rem]" />}
        </Button>
      </nav>
    </header>
  );
}