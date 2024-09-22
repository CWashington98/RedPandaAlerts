import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./app.css";
import "./globals.css";
import { Header } from "@/packages/web/components/Header";
import { Footer } from "@/packages/web/components/Footer";
import { ThemeProvider } from "@/contexts/ThemeContext";
import AuthContextProvider from "@/contexts/AuthContext";
import { StockDataProvider } from "@/contexts/StockDataContext";
import { Toaster } from "@/packages/web/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Stock Price Alerts",
  description: "Track and receive alerts for your favorite stocks",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" >
      <body>
        <AuthContextProvider>
          <StockDataProvider>
            <ThemeProvider>
              <div className="flex flex-col min-h-screen bg-background text-foreground">
                <Header />
                <main className="flex-grow">{children}</main>
                <Toaster />
                <Footer />
              </div>
            </ThemeProvider>
          </StockDataProvider>
        </AuthContextProvider>
      </body>
    </html>
  );
}
