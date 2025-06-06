# 🚀 Web to Mobile App Conversion Guide - RedPanda Alerts

## Overview
This guide will help you convert your existing Next.js web app functionality into your React Native mobile app while maintaining your mono-repo structure. The goal is to enable **free push notifications** for real-time stock price alerts.

## 📁 Current Project Structure
```
RedPandaAlerts/
├── packages/
│   ├── shared/           # Shared utilities and types
│   ├── web/             # Next.js web app (AWS Amplify)
│   └── mobile/          # Expo React Native app
├── amplify/             # AWS Amplify backend
├── contexts/            # Shared React contexts
├── utils/               # Shared utilities
└── package.json         # Root mono-repo config
```

## 🎯 Goals
1. Port all web app functionality to mobile
2. Implement push notifications for real-time alerts
3. Maintain clean mono-repo architecture
4. Share code between web and mobile
5. Keep components under 300 lines with proper documentation

---

## 📋 Step-by-Step Implementation Plan

### Phase 1: Repository Architecture Setup (Days 1-2)

#### Step 1.1: Enhance Shared Package Structure
```bash
# Create better shared package structure
mkdir -p packages/shared/src/{components,hooks,types,utils,services}
mkdir -p packages/shared/src/components/{ui,forms,layout}
```

**What to move to shared:**
- Type definitions (Schema types, API types)
- Utility functions (preprocessStockData, etc.)
- Custom hooks (useAuthContext, useToast equivalent)
- Business logic services (stock data processing)
- Form validation schemas (Zod schemas)

#### Step 1.2: Update Shared Package Configuration
Create `packages/shared/package.json`:
```json
{
  "name": "@redpanda/shared",
  "version": "1.0.0",
  "main": "src/index.ts",
  "types": "src/index.ts",
  "dependencies": {
    "zod": "^3.23.8",
    "aws-amplify": "^6.4.0"
  },
  "peerDependencies": {
    "react": "^18.0.0",
    "react-native": "*"
  }
}
```

#### Step 1.3: Configure TypeScript Path Mapping
Update root `tsconfig.json` to include path mapping:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@shared/*": ["packages/shared/src/*"],
      "@web/*": ["packages/web/*"],
      "@mobile/*": ["packages/mobile/*"]
    }
  }
}
```

### Phase 2: Shared Code Extraction (Days 3-4)

#### Step 2.1: Extract Type Definitions
**File:** `packages/shared/src/types/index.ts`
```typescript
// Move all Schema types and custom types here
export type StockPrice = {
  stockName: string;
  tickerSymbol: string;
  isCrypto: boolean;
  quickEntryPrice: number;
  swingTradePrice: number;
  loadTheBoatPrice: number;
  // Add other fields from your Schema
};

export type ProcessedStockData = {
  // Define based on your current Schema
};

export type PriceAlert = {
  id: string;
  userId: string;
  stockId: string;
  alertType: 'quickEntry' | 'swingTrade' | 'loadTheBoat';
  targetPrice: number;
  isActive: boolean;
  createdAt: string;
};
```

#### Step 2.2: Extract Business Logic
**File:** `packages/shared/src/services/stockService.ts`
```typescript
/**
 * Stock Service - Handles all stock-related business logic
 * Provides unified API for both web and mobile apps
 */
import { generateClient } from 'aws-amplify/api';
import type { StockPrice, ProcessedStockData } from '../types';

export class StockService {
  private client = generateClient();

  /**
   * Process stock data from various input formats
   * @param input - Raw stock data input
   * @returns Processed stock data array
   */
  async processStockData(input: string): Promise<ProcessedStockData[]> {
    // Move your preprocessing logic here
  }

  /**
   * Add new stock price alert
   * @param stock - Stock data to add
   * @returns Created stock record
   */
  async addStock(stock: Partial<StockPrice>): Promise<StockPrice> {
    // Move your addNewStock logic here
  }

  /**
   * Get user's stock alerts
   * @param userId - User ID
   * @returns User's stock alerts
   */
  async getUserStocks(userId: string): Promise<StockPrice[]> {
    // Implementation for fetching user stocks
  }
}
```

#### Step 2.3: Extract Custom Hooks
**File:** `packages/shared/src/hooks/useStockAlerts.ts`
```typescript
/**
 * Stock Alerts Hook - Manages stock alert state and operations
 * Provides consistent API across web and mobile platforms
 */
import { useState, useEffect } from 'react';
import { StockService } from '../services/stockService';
import type { StockPrice } from '../types';

export function useStockAlerts(userId?: string) {
  const [stocks, setStocks] = useState<StockPrice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stockService = new StockService();

  const addStock = async (stockData: Partial<StockPrice>) => {
    try {
      setLoading(true);
      const newStock = await stockService.addStock(stockData);
      setStocks(prev => [...prev, newStock]);
      return newStock;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshStocks = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const userStocks = await stockService.getUserStocks(userId);
      setStocks(userStocks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stocks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshStocks();
  }, [userId]);

  return {
    stocks,
    loading,
    error,
    addStock,
    refreshStocks,
  };
}
```

### Phase 3: Mobile App Core Setup (Days 5-6)

#### Step 3.1: Install Required Mobile Dependencies
```bash
cd packages/mobile
npx expo install expo-notifications expo-device expo-constants
npx expo install @react-native-async-storage/async-storage
npx expo install react-native-elements react-native-paper
# For AWS Amplify support
npm install aws-amplify @aws-amplify/react-native
```

#### Step 3.2: Configure Push Notifications
**File:** `packages/mobile/services/notificationService.ts`
```typescript
/**
 * Notification Service - Handles push notifications for price alerts
 * Manages registration, scheduling, and delivery of notifications
 */
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export class NotificationService {
  /**
   * Register device for push notifications
   * @returns Push token for the device
   */
  async registerForPushNotifications(): Promise<string | null> {
    let token = null;

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return null;
      }
      
      token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });
    } else {
      alert('Must use physical device for Push Notifications');
    }

    return token?.data || null;
  }

  /**
   * Schedule local notification for price alert
   * @param title - Notification title
   * @param body - Notification body
   * @param data - Additional notification data
   */
  async scheduleNotification(title: string, body: string, data?: any) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: 'default',
      },
      trigger: null, // Show immediately
    });
  }

  /**
   * Cancel specific notification
   * @param identifier - Notification identifier
   */
  async cancelNotification(identifier: string) {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  }

  /**
   * Clear all notifications
   */
  async clearAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
}
```

#### Step 3.3: Update Mobile App Configuration
**File:** `packages/mobile/app.json` (Update the existing file)
```json
{
  "expo": {
    "name": "RedPanda Alerts",
    "slug": "redpanda-alerts",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "redpanda-alerts",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/images/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.uraeusoldings.redpandaalerts"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.uraeusoldings.redpandaalerts",
      "permissions": [
        "NOTIFICATIONS",
        "WAKE_LOCK"
      ]
    },
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      "expo-router",
      [
        "expo-notifications",
        {
          "icon": "./assets/images/notification-icon.png",
          "color": "#ffffff",
          "sounds": ["./assets/sounds/notification.wav"]
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true
    },
    "extra": {
      "eas": {
        "projectId": "your-eas-project-id"
      }
    }
  }
}
```

### Phase 4: Core Mobile Components (Days 7-10)

#### Step 4.1: Create Mobile-Specific UI Components
**File:** `packages/mobile/components/ui/Card.tsx`
```typescript
/**
 * Card Component - Mobile-optimized card component
 * Replicates web card functionality with touch-friendly design
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: any;
}

export function Card({ children, onPress, style }: CardProps) {
  const Component = onPress ? TouchableOpacity : View;
  
  return (
    <Component style={[styles.card, style]} onPress={onPress}>
      {children}
    </Component>
  );
}

export function CardHeader({ children, style }: { children: React.ReactNode; style?: any }) {
  return <View style={[styles.header, style]}>{children}</View>;
}

export function CardContent({ children, style }: { children: React.ReactNode; style?: any }) {
  return <View style={[styles.content, style]}>{children}</View>;
}

export function CardTitle({ children, style }: { children: React.ReactNode; style?: any }) {
  return <Text style={[styles.title, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    marginBottom: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
});
```

#### Step 4.2: Create Stock Data Card Component
**File:** `packages/mobile/components/StockDataCard.tsx`
```typescript
/**
 * Stock Data Card - Mobile version of web StockDataCard
 * Displays stock information with touch-optimized interactions
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Card, CardHeader, CardContent, CardTitle } from './ui/Card';
import type { StockPrice } from '@shared/types';

interface StockDataCardProps {
  stock: StockPrice;
  onEdit?: (stock: StockPrice) => void;
  onDelete?: (stockId: string) => void;
}

export function StockDataCard({ stock, onEdit, onDelete }: StockDataCardProps) {
  const handleDelete = () => {
    Alert.alert(
      'Delete Stock Alert',
      `Are you sure you want to delete ${stock.stockName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => onDelete?.(stock.id)
        },
      ]
    );
  };

  return (
    <Card>
      <CardHeader>
        <View style={styles.headerRow}>
          <View>
            <CardTitle>{stock.stockName}</CardTitle>
            <Text style={styles.ticker}>{stock.tickerSymbol}</Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onEdit?.(stock)}
            >
              <Text style={styles.actionText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={handleDelete}
            >
              <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </CardHeader>
      
      <CardContent>
        <View style={styles.priceGrid}>
          <View style={styles.priceItem}>
            <Text style={styles.priceLabel}>Quick Entry</Text>
            <Text style={styles.priceValue}>${stock.quickEntryPrice.toFixed(2)}</Text>
          </View>
          <View style={styles.priceItem}>
            <Text style={styles.priceLabel}>Swing Trade</Text>
            <Text style={styles.priceValue}>${stock.swingTradePrice.toFixed(2)}</Text>
          </View>
          <View style={styles.priceItem}>
            <Text style={styles.priceLabel}>Load The Boat</Text>
            <Text style={styles.priceValue}>${stock.loadTheBoatPrice.toFixed(2)}</Text>
          </View>
        </View>
        
        {stock.isCrypto && (
          <View style={styles.cryptoBadge}>
            <Text style={styles.cryptoText}>CRYPTO</Text>
          </View>
        )}
      </CardContent>
    </Card>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  ticker: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
  },
  deleteButton: {
    backgroundColor: '#ffe6e6',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  deleteText: {
    color: '#d32f2f',
  },
  priceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  priceItem: {
    flex: 1,
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2e7d32',
  },
  cryptoBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff3e0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 8,
  },
  cryptoText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#f57c00',
  },
});
```

#### Step 4.3: Create Add Price Alert Modal (Mobile)
**File:** `packages/mobile/components/AddPriceAlertModal.tsx`
```typescript
/**
 * Add Price Alert Modal - Mobile version with native UI components
 * Provides multiple input methods: manual, text, and JSON
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { useStockAlerts } from '@shared/hooks/useStockAlerts';
import type { StockPrice } from '@shared/types';

interface AddPriceAlertModalProps {
  visible: boolean;
  onClose: () => void;
  userId?: string;
}

export function AddPriceAlertModal({ visible, onClose, userId }: AddPriceAlertModalProps) {
  const { addStock, loading } = useStockAlerts(userId);
  const [activeTab, setActiveTab] = useState<'manual' | 'text' | 'json'>('manual');
  const [newStock, setNewStock] = useState<Partial<StockPrice>>({
    stockName: '',
    tickerSymbol: '',
    isCrypto: false,
    quickEntryPrice: 0,
    swingTradePrice: 0,
    loadTheBoatPrice: 0,
  });

  const handleSubmit = async () => {
    try {
      await addStock(newStock);
      Alert.alert('Success', 'Stock alert added successfully!');
      onClose();
      resetForm();
    } catch (error) {
      Alert.alert('Error', 'Failed to add stock alert');
    }
  };

  const resetForm = () => {
    setNewStock({
      stockName: '',
      tickerSymbol: '',
      isCrypto: false,
      quickEntryPrice: 0,
      swingTradePrice: 0,
      loadTheBoatPrice: 0,
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Add New Price Alert</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>Done</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabContainer}>
          {(['manual', 'text', 'json'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView style={styles.content}>
          {activeTab === 'manual' && (
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Stock Name</Text>
                <TextInput
                  style={styles.input}
                  value={newStock.stockName}
                  onChangeText={(text) => setNewStock({ ...newStock, stockName: text })}
                  placeholder="Enter stock name"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Ticker Symbol</Text>
                <TextInput
                  style={styles.input}
                  value={newStock.tickerSymbol}
                  onChangeText={(text) => setNewStock({ ...newStock, tickerSymbol: text.toUpperCase() })}
                  placeholder="e.g., AAPL"
                  autoCapitalize="characters"
                />
              </View>

              <View style={styles.switchGroup}>
                <Text style={styles.label}>Cryptocurrency</Text>
                <Switch
                  value={newStock.isCrypto}
                  onValueChange={(value) => setNewStock({ ...newStock, isCrypto: value })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Quick Entry Price</Text>
                <TextInput
                  style={styles.input}
                  value={newStock.quickEntryPrice?.toString()}
                  onChangeText={(text) => setNewStock({ ...newStock, quickEntryPrice: parseFloat(text) || 0 })}
                  placeholder="0.00"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Swing Trade Price</Text>
                <TextInput
                  style={styles.input}
                  value={newStock.swingTradePrice?.toString()}
                  onChangeText={(text) => setNewStock({ ...newStock, swingTradePrice: parseFloat(text) || 0 })}
                  placeholder="0.00"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Load The Boat Price</Text>
                <TextInput
                  style={styles.input}
                  value={newStock.loadTheBoatPrice?.toString()}
                  onChangeText={(text) => setNewStock({ ...newStock, loadTheBoatPrice: parseFloat(text) || 0 })}
                  placeholder="0.00"
                  keyboardType="numeric"
                />
              </View>
            </View>
          )}

          {/* Add text and JSON tabs implementation here */}
        </ScrollView>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Adding...' : 'Add Stock Alert'}
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: 'white',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    margin: 16,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

### Phase 5: Main App Screens (Days 11-13)

#### Step 5.1: Create Main Dashboard Screen
**File:** `packages/mobile/app/(tabs)/index.tsx`
```typescript
/**
 * Dashboard Screen - Main screen showing user's stock alerts
 * Provides overview of all price alerts with real-time updates
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { StockDataCard } from '@mobile/components/StockDataCard';
import { AddPriceAlertModal } from '@mobile/components/AddPriceAlertModal';
import { useStockAlerts } from '@shared/hooks/useStockAlerts';
import { NotificationService } from '@mobile/services/notificationService';

export default function DashboardScreen() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { stocks, loading, refreshStocks } = useStockAlerts('current-user-id'); // Replace with actual user ID
  const notificationService = new NotificationService();

  useEffect(() => {
    // Register for push notifications on mount
    setupNotifications();
  }, []);

  const setupNotifications = async () => {
    try {
      const token = await notificationService.registerForPushNotifications();
      console.log('Push notification token:', token);
      // TODO: Send token to your backend to associate with user
    } catch (error) {
      console.error('Failed to setup notifications:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshStocks();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Stock Alerts</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {stocks.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No Stock Alerts</Text>
            <Text style={styles.emptyText}>
              Add your first stock alert to get started with real-time notifications.
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => setShowAddModal(true)}
            >
              <Text style={styles.emptyButtonText}>Add Your First Alert</Text>
            </TouchableOpacity>
          </View>
        ) : (
          stocks.map((stock) => (
            <StockDataCard
              key={stock.id}
              stock={stock}
              onEdit={(stock) => {
                // TODO: Implement edit functionality
                console.log('Edit stock:', stock);
              }}
              onDelete={(stockId) => {
                // TODO: Implement delete functionality
                console.log('Delete stock:', stockId);
              }}
            />
          ))
        )}
      </ScrollView>

      <AddPriceAlertModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        userId="current-user-id" // Replace with actual user ID
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    marginTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  emptyButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});
```

### Phase 6: Push Notification Integration (Days 14-15)

#### Step 6.1: Create Real-time Price Monitoring Service
**File:** `packages/shared/src/services/priceMonitoringService.ts`
```typescript
/**
 * Price Monitoring Service - Monitors stock prices and triggers alerts
 * Works with both web and mobile platforms for consistent price tracking
 */
import { StockService } from './stockService';
import type { StockPrice, PriceAlert } from '../types';

export class PriceMonitoringService {
  private stockService = new StockService();
  private monitoringInterval: NodeJS.Timeout | null = null;

  /**
   * Start monitoring stock prices for alerts
   * @param userId - User ID to monitor stocks for
   * @param onAlert - Callback when price alert is triggered
   */
  async startMonitoring(userId: string, onAlert: (alert: PriceAlert, currentPrice: number) => void) {
    if (this.monitoringInterval) {
      this.stopMonitoring();
    }

    this.monitoringInterval = setInterval(async () => {
      try {
        const userStocks = await this.stockService.getUserStocks(userId);
        
        for (const stock of userStocks) {
          const currentPrice = await this.getCurrentPrice(stock.tickerSymbol);
          const alerts = this.checkPriceAlerts(stock, currentPrice);
          
          alerts.forEach(alert => onAlert(alert, currentPrice));
        }
      } catch (error) {
        console.error('Error monitoring prices:', error);
      }
    }, 30000); // Check every 30 seconds
  }

  /**
   * Stop monitoring stock prices
   */
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  /**
   * Get current price for a stock
   * @param tickerSymbol - Stock ticker symbol
   * @returns Current stock price
   */
  private async getCurrentPrice(tickerSymbol: string): Promise<number> {
    // TODO: Implement actual price fetching logic
    // This could use Yahoo Finance API, Alpha Vantage, etc.
    // For now, return a mock price
    return Math.random() * 100 + 50;
  }

  /**
   * Check if current price triggers any alerts
   * @param stock - Stock to check
   * @param currentPrice - Current stock price
   * @returns Array of triggered alerts
   */
  private checkPriceAlerts(stock: StockPrice, currentPrice: number): PriceAlert[] {
    const alerts: PriceAlert[] = [];

    // Check each price level
    if (currentPrice <= stock.quickEntryPrice) {
      alerts.push({
        id: `${stock.id}-quickEntry`,
        userId: stock.userId,
        stockId: stock.id,
        alertType: 'quickEntry',
        targetPrice: stock.quickEntryPrice,
        isActive: true,
        createdAt: new Date().toISOString(),
      });
    }

    if (currentPrice <= stock.swingTradePrice) {
      alerts.push({
        id: `${stock.id}-swingTrade`,
        userId: stock.userId,
        stockId: stock.id,
        alertType: 'swingTrade',
        targetPrice: stock.swingTradePrice,
        isActive: true,
        createdAt: new Date().toISOString(),
      });
    }

    if (currentPrice <= stock.loadTheBoatPrice) {
      alerts.push({
        id: `${stock.id}-loadTheBoat`,
        userId: stock.userId,
        stockId: stock.id,
        alertType: 'loadTheBoat',
        targetPrice: stock.loadTheBoatPrice,
        isActive: true,
        createdAt: new Date().toISOString(),
      });
    }

    return alerts;
  }
}
```

#### Step 6.2: Integrate Notifications with Main App
**File:** `packages/mobile/app/_layout.tsx`
```typescript
/**
 * Root Layout - Initializes app-wide services and navigation
 * Sets up notification handling and background price monitoring
 */
import React, { useEffect, useRef } from 'react';
import { Stack } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { NotificationService } from '@mobile/services/notificationService';
import { PriceMonitoringService } from '@shared/services/priceMonitoringService';

export default function RootLayout() {
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();
  const notificationService = new NotificationService();
  const priceMonitoringService = new PriceMonitoringService();

  useEffect(() => {
    // Setup notification listeners
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      // Handle notification tap - navigate to relevant screen
    });

    // Start price monitoring
    startPriceMonitoring();

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
      priceMonitoringService.stopMonitoring();
    };
  }, []);

  const startPriceMonitoring = async () => {
    await priceMonitoringService.startMonitoring('current-user-id', async (alert, currentPrice) => {
      const alertTypeLabels = {
        quickEntry: 'Quick Entry',
        swingTrade: 'Swing Trade',
        loadTheBoat: 'Load The Boat',
      };

      await notificationService.scheduleNotification(
        `${alert.alertType === 'loadTheBoat' ? '🚨' : '📊'} Price Alert!`,
        `${alert.stockId} hit your ${alertTypeLabels[alert.alertType]} price of $${alert.targetPrice}. Current price: $${currentPrice.toFixed(2)}`,
        { alertId: alert.id, stockId: alert.stockId }
      );
    });
  };

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
```

### Phase 7: Testing and Deployment (Days 16-18)

#### Step 7.1: Create Development Scripts
Add to root `package.json`:
```json
{
  "scripts": {
    "dev:web": "npm run dev --workspace=packages/web",
    "dev:mobile": "npm run start --workspace=packages/mobile",
    "dev": "concurrently \"npm run dev:web\" \"npm run dev:mobile\"",
    "build:web": "npm run build --workspace=packages/web",
    "build:mobile": "npm run build --workspace=packages/mobile",
    "test": "npm run test --workspaces",
    "lint": "npm run lint --workspaces"
  }
}
```

#### Step 7.2: EAS Build Configuration
**File:** `packages/mobile/eas.json`
```json
{
  "cli": {
    "version": ">= 2.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  },
  "submit": {
    "production": {}
  }
}
```

#### Step 7.3: Testing Checklist
- [ ] Manual input form validation
- [ ] Text processing functionality
- [ ] JSON input parsing
- [ ] Push notification registration
- [ ] Price alert triggers
- [ ] Background monitoring
- [ ] AWS Amplify integration
- [ ] Cross-platform code sharing

---

## 🚀 Getting Started

### Quick Start Commands
```bash
# Install dependencies
npm install

# Start both web and mobile in development
npm run dev

# Start only mobile app
npm run dev:mobile

# Build for production
npm run build:mobile
```

### Development Workflow
1. **Phase 1-2**: Set up shared architecture (2-4 days)
2. **Phase 3-4**: Build core mobile components (4-6 days)
3. **Phase 5**: Create main screens (2-3 days)
4. **Phase 6**: Implement push notifications (2 days)
5. **Phase 7**: Test and deploy (3 days)

### Key Benefits of This Architecture
- ✅ **Code Reuse**: Share business logic between web and mobile
- ✅ **Type Safety**: Full TypeScript support across platforms
- ✅ **Push Notifications**: Free expo notifications for real-time alerts
- ✅ **Maintainable**: Clean separation of concerns
- ✅ **Scalable**: Easy to add new features to both platforms

### Next Steps After Implementation
1. Set up EAS Build for app store deployment
2. Configure AWS Amplify for mobile (same backend as web)
3. Implement real-time price fetching API
4. Add user authentication flow
5. Test on physical devices
6. Submit to app stores

---

## 💡 Pro Tips for Junior Developers

1. **Start Small**: Implement one component at a time
2. **Test Early**: Test on real devices as soon as possible
3. **Share Code**: Move common logic to the shared package
4. **Document Everything**: Keep components well-documented
5. **Follow Patterns**: Use consistent naming and structure
6. **Monitor Performance**: Watch for memory leaks in price monitoring

This guide provides a complete roadmap for converting your web app to mobile while maintaining your mono-repo structure and enabling push notifications. Each component is designed to be under 300 lines and well-documented as per your requirements. 