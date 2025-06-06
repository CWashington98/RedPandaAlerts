# 🚀 Complete RedPanda Alerts Migration Plan

## Overview
**Goal**: Migrate from Next.js + React Native mono-repo to single Expo Universal app with push notifications and iOS distribution strategy.

## 📋 Complete Migration Roadmap (3-4 Weeks)

### Pre-Migration Checklist
- [ ] Backup current project: `git tag backup-before-migration`
- [ ] Document current features and functionality
- [ ] Test current web app functionality
- [ ] List all dependencies and integrations

---

## Phase 1: Foundation Setup (Days 1-3)

### Day 1: Create New Expo Universal App

#### Step 1.1: Initialize Project
```bash
# Create new Expo app outside your current project
cd ..
npx create-expo-app@latest RedPandaAlertsUniversal --template tabs
cd RedPandaAlertsUniversal

# Install universal dependencies
npx expo install expo-router react-native-web react-dom
npx expo install expo-notifications expo-device expo-constants
npx expo install aws-amplify @aws-amplify/react-native
npx expo install @expo/html-elements
npx expo install @react-native-async-storage/async-storage
```

#### Step 1.2: Configure Universal Setup
**File:** `app.json`
```json
{
  "expo": {
    "name": "RedPanda Alerts",
    "slug": "redpanda-alerts",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "userInterfaceStyle": "automatic",
    "platforms": ["ios", "android", "web"],
    "splash": {
      "image": "./assets/images/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.uraeusoldings.redpandaalerts",
      "buildNumber": "1"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.uraeusoldings.redpandaalerts",
      "versionCode": 1,
      "permissions": ["NOTIFICATIONS", "WAKE_LOCK"]
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
          "defaultChannel": "default"
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true
    },
    "extra": {
      "router": {
        "origin": false
      },
      "eas": {
        "projectId": "your-project-id-here"
      }
    }
  }
}
```

### Day 2: Copy and Adapt Business Logic

#### Step 2.1: Copy Core Files
```bash
# From your current project root, copy essential files
cp -r packages/web/amplify ../RedPandaAlertsUniversal/
cp packages/web/amplify_outputs.json ../RedPandaAlertsUniversal/
cp -r packages/web/utils ../RedPandaAlertsUniversal/
cp -r packages/shared/utils ../RedPandaAlertsUniversal/utils/shared
```

#### Step 2.2: Setup AWS Amplify Configuration
**File:** `app/_layout.tsx`
```typescript
import { Amplify } from 'aws-amplify';
import amplifyconfig from '../amplify_outputs.json';
import { Stack } from 'expo-router';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef } from 'react';

// Configure Amplify
Amplify.configure(amplifyconfig, {
  ssr: Platform.OS === 'web',
});

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification tapped:', response);
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
```

### Day 3: Create Universal Component Library

#### Step 3.1: Shared Components
**File:** `components/shared/index.ts`
```typescript
export { Card } from './Card';
export { Input, Switch, Button } from './FormComponents';
export { Modal } from './Modal';
export { Header } from './Header';
```

**File:** `components/shared/Card.tsx`
```typescript
import React from 'react';
import { Platform, View, Text, StyleSheet, Pressable } from 'react-native';
import { Div, H3 } from '@expo/html-elements';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  onPress?: () => void;
  style?: any;
}

export function Card({ title, children, onPress, style }: CardProps) {
  const Container = Platform.OS === 'web' ? Div : View;
  const Title = Platform.OS === 'web' ? H3 : Text;
  const Wrapper = onPress ? Pressable : Container;
  
  return (
    <Wrapper style={[styles.card, style]} onPress={onPress}>
      {title && <Title style={styles.title}>{title}</Title>}
      <Container style={styles.content}>
        {children}
      </Container>
    </Wrapper>
  );
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
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1a1a1a',
  },
  content: {
    flex: 1,
  },
});
```

---

## Phase 2: Feature Migration (Days 4-10)

### Day 4-5: Port AddPriceAlertModal

#### Step 4.1: Universal Modal Component
**File:** `components/shared/Modal.tsx`
```typescript
import React from 'react';
import { Modal as RNModal, View, Text, StyleSheet, Platform, Pressable } from 'react-native';
import { Stack } from 'expo-router';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ visible, onClose, title, children }: ModalProps) {
  if (Platform.OS === 'web') {
    return (
      <RNModal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={styles.webOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
          <View style={styles.webModal}>
            <View style={styles.webHeader}>
              <Text style={styles.webTitle}>{title}</Text>
              <Pressable onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </Pressable>
            </View>
            <View style={styles.webContent}>
              {children}
            </View>
          </View>
        </View>
      </RNModal>
    );
  }

  return (
    <RNModal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.mobileContainer}>
        <View style={styles.mobileHeader}>
          <Text style={styles.mobileTitle}>{title}</Text>
          <Pressable onPress={onClose}>
            <Text style={styles.doneButton}>Done</Text>
          </Pressable>
        </View>
        <View style={styles.mobileContent}>
          {children}
        </View>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  // Web styles
  webOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  webModal: {
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
  },
  webHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  webTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  webContent: {
    flex: 1,
    padding: 16,
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
  },
  // Mobile styles
  mobileContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  mobileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  mobileTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  mobileContent: {
    flex: 1,
    padding: 16,
  },
  doneButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
});
```

#### Step 4.2: Adapt AddPriceAlertModal
**File:** `components/AddPriceAlertModal.tsx`
```typescript
import React, { useState } from 'react';
import { View, ScrollView, Alert, Platform } from 'react-native';
import { Modal, Input, Switch, Button } from './shared';

interface StockData {
  stockName: string;
  tickerSymbol: string;
  isCrypto: boolean;
  quickEntryPrice: number;
  swingTradePrice: number;
  loadTheBoatPrice: number;
}

interface AddPriceAlertModalProps {
  visible: boolean;
  onClose: () => void;
  onAddStock: (stock: StockData) => Promise<void>;
}

export function AddPriceAlertModal({ visible, onClose, onAddStock }: AddPriceAlertModalProps) {
  const [loading, setLoading] = useState(false);
  const [stockData, setStockData] = useState<StockData>({
    stockName: '',
    tickerSymbol: '',
    isCrypto: false,
    quickEntryPrice: 0,
    swingTradePrice: 0,
    loadTheBoatPrice: 0,
  });

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await onAddStock(stockData);
      
      if (Platform.OS === 'web') {
        alert('Stock alert added successfully!');
      } else {
        Alert.alert('Success', 'Stock alert added successfully!');
      }
      
      onClose();
      resetForm();
    } catch (error) {
      if (Platform.OS === 'web') {
        alert('Failed to add stock alert');
      } else {
        Alert.alert('Error', 'Failed to add stock alert');
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStockData({
      stockName: '',
      tickerSymbol: '',
      isCrypto: false,
      quickEntryPrice: 0,
      swingTradePrice: 0,
      loadTheBoatPrice: 0,
    });
  };

  return (
    <Modal visible={visible} onClose={onClose} title="Add New Price Alert">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ gap: 16 }}>
          <Input
            label="Stock Name"
            value={stockData.stockName}
            onChangeText={(text) => setStockData({ ...stockData, stockName: text })}
            placeholder="Enter stock name"
          />
          
          <Input
            label="Ticker Symbol"
            value={stockData.tickerSymbol}
            onChangeText={(text) => setStockData({ ...stockData, tickerSymbol: text.toUpperCase() })}
            placeholder="e.g., AAPL"
          />
          
          <Switch
            label="Is Cryptocurrency"
            value={stockData.isCrypto}
            onValueChange={(value) => setStockData({ ...stockData, isCrypto: value })}
          />
          
          <Input
            label="Quick Entry Price"
            value={stockData.quickEntryPrice.toString()}
            onChangeText={(text) => setStockData({ ...stockData, quickEntryPrice: parseFloat(text) || 0 })}
            placeholder="0.00"
            keyboardType="numeric"
          />
          
          <Input
            label="Swing Trade Price"
            value={stockData.swingTradePrice.toString()}
            onChangeText={(text) => setStockData({ ...stockData, swingTradePrice: parseFloat(text) || 0 })}
            placeholder="0.00"
            keyboardType="numeric"
          />
          
          <Input
            label="Load The Boat Price"
            value={stockData.loadTheBoatPrice.toString()}
            onChangeText={(text) => setStockData({ ...stockData, loadTheBoatPrice: parseFloat(text) || 0 })}
            placeholder="0.00"
            keyboardType="numeric"
          />
        </View>
      </ScrollView>
      
      <Button
        title={loading ? 'Adding...' : 'Add Stock Alert'}
        onPress={handleSubmit}
        disabled={loading}
        style={{ marginTop: 24 }}
      />
    </Modal>
  );
}
```

### Day 6-7: Port StockDataCard and Dashboard

#### Step 6.1: Universal StockDataCard
**File:** `components/StockDataCard.tsx`
```typescript
import React from 'react';
import { View, Text, StyleSheet, Platform, Alert } from 'react-native';
import { Card, Button } from './shared';

interface StockPrice {
  id: string;
  stockName: string;
  tickerSymbol: string;
  isCrypto: boolean;
  quickEntryPrice: number;
  swingTradePrice: number;
  loadTheBoatPrice: number;
}

interface StockDataCardProps {
  stock: StockPrice;
  onEdit?: (stock: StockPrice) => void;
  onDelete?: (stockId: string) => void;
}

export function StockDataCard({ stock, onEdit, onDelete }: StockDataCardProps) {
  const handleDelete = () => {
    const confirmDelete = () => onDelete?.(stock.id);
    
    if (Platform.OS === 'web') {
      if (window.confirm(`Delete ${stock.stockName}?`)) {
        confirmDelete();
      }
    } else {
      Alert.alert(
        'Delete Stock Alert',
        `Are you sure you want to delete ${stock.stockName}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: confirmDelete },
        ]
      );
    }
  };

  return (
    <Card>
      <View style={styles.header}>
        <View>
          <Text style={styles.stockName}>{stock.stockName}</Text>
          <Text style={styles.ticker}>{stock.tickerSymbol}</Text>
        </View>
        <View style={styles.actions}>
          <Button title="Edit" onPress={() => onEdit?.(stock)} variant="secondary" size="small" />
          <Button title="Delete" onPress={handleDelete} variant="danger" size="small" />
        </View>
      </View>
      
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
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stockName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
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
    marginTop: 12,
  },
  cryptoText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#f57c00',
  },
});
```

### Day 8-10: Setup Navigation and Main Screens

#### Step 8.1: Universal Navigation Layout
**File:** `app/(tabs)/_layout.tsx`
```typescript
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function TabLayout() {
  return (
    <Tabs 
      screenOptions={{ 
        tabBarActiveTintColor: '#007AFF',
        tabBarStyle: Platform.OS === 'web' ? { display: 'none' } : undefined,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          headerShown: Platform.OS !== 'web',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          headerShown: Platform.OS !== 'web',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="cog" color={color} />,
        }}
      />
    </Tabs>
  );
}
```

#### Step 8.2: Dashboard Screen
**File:** `app/(tabs)/index.tsx`
```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Platform } from 'react-native';
import { StockDataCard } from '../../components/StockDataCard';
import { AddPriceAlertModal } from '../../components/AddPriceAlertModal';
import { Button, Header } from '../../components/shared';
import { generateClient } from 'aws-amplify/api';

// Your Amplify Schema types
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

export default function DashboardScreen() {
  const [stocks, setStocks] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStocks();
  }, []);

  const loadStocks = async () => {
    try {
      // Replace with your actual Amplify query
      const { data } = await client.models.StockPrice.list();
      setStocks(data);
    } catch (error) {
      console.error('Error loading stocks:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAddStock = async (stockData) => {
    try {
      // Replace with your actual Amplify mutation
      const { data } = await client.models.StockPrice.create(stockData);
      setStocks(prev => [...prev, data]);
    } catch (error) {
      console.error('Error adding stock:', error);
      throw error;
    }
  };

  const handleDeleteStock = async (stockId) => {
    try {
      await client.models.StockPrice.delete({ id: stockId });
      setStocks(prev => prev.filter(stock => stock.id !== stockId));
    } catch (error) {
      console.error('Error deleting stock:', error);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadStocks();
  };

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' && (
        <Header 
          title="Stock Alerts Dashboard"
          rightAction={
            <Button title="+ Add Alert" onPress={() => setShowAddModal(true)} />
          }
        />
      )}
      
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
            <Button
              title="Add Your First Alert"
              onPress={() => setShowAddModal(true)}
              style={styles.emptyButton}
            />
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
              onDelete={handleDeleteStock}
            />
          ))
        )}
      </ScrollView>

      {Platform.OS !== 'web' && (
        <View style={styles.floatingButton}>
          <Button
            title="+ Add Alert"
            onPress={() => setShowAddModal(true)}
          />
        </View>
      )}

      <AddPriceAlertModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddStock={handleAddStock}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
    marginTop: 16,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
  },
});
```

---

## Phase 3: Push Notifications Implementation (Days 11-14)

### Day 11-12: Notification Service Setup

#### Step 11.1: Notification Service
**File:** `services/NotificationService.ts`
```typescript
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class NotificationService {
  private static instance: NotificationService;
  private pushToken: string | null = null;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async registerForPushNotifications(): Promise<string | null> {
    if (!Device.isDevice) {
      console.log('Must use physical device for Push Notifications');
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }
    
    try {
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });
      
      this.pushToken = token.data;
      await AsyncStorage.setItem('pushToken', token.data);
      
      console.log('Push token:', token.data);
      return token.data;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  }

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

  async schedulePriceAlert(stockName: string, alertType: string, targetPrice: number, currentPrice: number) {
    const alertTypeLabels = {
      quickEntry: 'Quick Entry',
      swingTrade: 'Swing Trade',
      loadTheBoat: 'Load The Boat',
    };

    const emoji = alertType === 'loadTheBoat' ? '🚨' : '📊';
    
    await this.scheduleNotification(
      `${emoji} ${stockName} Price Alert!`,
      `${alertTypeLabels[alertType]} target hit! Target: $${targetPrice}, Current: $${currentPrice.toFixed(2)}`,
      {
        stockName,
        alertType,
        targetPrice,
        currentPrice,
      }
    );
  }

  async getPushToken(): Promise<string | null> {
    if (this.pushToken) return this.pushToken;
    
    try {
      const stored = await AsyncStorage.getItem('pushToken');
      this.pushToken = stored;
      return stored;
    } catch {
      return null;
    }
  }
}
```

### Day 13-14: Price Monitoring Service

#### Step 13.1: Price Monitoring Service
**File:** `services/PriceMonitoringService.ts`
```typescript
import { NotificationService } from './NotificationService';
import { generateClient } from 'aws-amplify/api';
import type { Schema } from '../amplify/data/resource';

const client = generateClient<Schema>();

export class PriceMonitoringService {
  private static instance: PriceMonitoringService;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = NotificationService.getInstance();
  }

  static getInstance(): PriceMonitoringService {
    if (!PriceMonitoringService.instance) {
      PriceMonitoringService.instance = new PriceMonitoringService();
    }
    return PriceMonitoringService.instance;
  }

  async startMonitoring(userId: string) {
    if (this.monitoringInterval) {
      this.stopMonitoring();
    }

    console.log('Starting price monitoring for user:', userId);

    this.monitoringInterval = setInterval(async () => {
      try {
        await this.checkPriceAlerts(userId);
      } catch (error) {
        console.error('Error monitoring prices:', error);
      }
    }, 30000); // Check every 30 seconds
  }

  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('Stopped price monitoring');
    }
  }

  private async checkPriceAlerts(userId: string) {
    try {
      // Get user's stock alerts
      const { data: stocks } = await client.models.StockPrice.list({
        filter: { userId: { eq: userId } }
      });

      for (const stock of stocks) {
        const currentPrice = await this.getCurrentPrice(stock.tickerSymbol);
        
        // Check each alert type
        if (currentPrice <= stock.quickEntryPrice) {
          await this.notificationService.schedulePriceAlert(
            stock.stockName,
            'quickEntry',
            stock.quickEntryPrice,
            currentPrice
          );
        }
        
        if (currentPrice <= stock.swingTradePrice) {
          await this.notificationService.schedulePriceAlert(
            stock.stockName,
            'swingTrade',
            stock.swingTradePrice,
            currentPrice
          );
        }
        
        if (currentPrice <= stock.loadTheBoatPrice) {
          await this.notificationService.schedulePriceAlert(
            stock.stockName,
            'loadTheBoat',
            stock.loadTheBoatPrice,
            currentPrice
          );
        }
      }
    } catch (error) {
      console.error('Error checking price alerts:', error);
    }
  }

  private async getCurrentPrice(tickerSymbol: string): Promise<number> {
    try {
      // Replace with actual price API (Yahoo Finance, Alpha Vantage, etc.)
      // For demo purposes, return a random price
      const basePrice = Math.random() * 100 + 50;
      console.log(`Current price for ${tickerSymbol}: $${basePrice.toFixed(2)}`);
      return basePrice;
    } catch (error) {
      console.error(`Error fetching price for ${tickerSymbol}:`, error);
      return 0;
    }
  }
}
```

#### Step 13.2: Integrate Monitoring in Main App
**File:** `hooks/useNotifications.ts`
```typescript
import { useEffect, useState } from 'react';
import { NotificationService } from '../services/NotificationService';
import { PriceMonitoringService } from '../services/PriceMonitoringService';

export function useNotifications(userId?: string) {
  const [isSetup, setIsSetup] = useState(false);
  const [pushToken, setPushToken] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const setupNotifications = async () => {
      try {
        const notificationService = NotificationService.getInstance();
        const monitoringService = PriceMonitoringService.getInstance();
        
        // Register for push notifications
        const token = await notificationService.registerForPushNotifications();
        setPushToken(token);
        
        // Start price monitoring
        await monitoringService.startMonitoring(userId);
        
        setIsSetup(true);
        console.log('Notifications setup complete');
      } catch (error) {
        console.error('Error setting up notifications:', error);
      }
    };

    setupNotifications();

    return () => {
      const monitoringService = PriceMonitoringService.getInstance();
      monitoringService.stopMonitoring();
    };
  }, [userId]);

  return { isSetup, pushToken };
}
```

---

## Phase 4: iOS Distribution Strategy (Days 15-18)

### Day 15-16: EAS Build Configuration

#### Step 15.1: Setup EAS Account
```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Login to Expo account
eas login

# Initialize EAS in your project
eas build:configure
```

#### Step 15.2: EAS Configuration
**File:** `eas.json`
```json
{
  "cli": {
    "version": ">= 2.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "resourceClass": "m1-medium"
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "production": {
      "ios": {
        "resourceClass": "m1-medium"
      }
    },
    "internal": {
      "distribution": "internal",
      "ios": {
        "provisioning": "adhoc"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

### Day 17-18: Distribution Options

#### Option 1: TestFlight (Recommended for External Testing)
```bash
# Build for TestFlight
eas build --platform ios --profile production

# Submit to TestFlight (requires Apple Developer account)
eas submit --platform ios
```

**TestFlight Benefits:**
- Free with Apple Developer account ($99/year)
- Up to 10,000 external testers
- 90-day testing periods
- Crash reporting and feedback

#### Option 2: Ad Hoc Distribution (Internal Testing)
```bash
# Build for internal distribution
eas build --platform ios --profile internal
```

**Ad Hoc Benefits:**
- No App Store review required
- Up to 100 devices per year
- Install via direct download link
- Immediate distribution

#### Option 3: Enterprise Distribution (Large Organizations)
```bash
# Enterprise build (requires Enterprise Apple Developer account)
eas build --platform ios --profile enterprise
```

**Enterprise Benefits:**
- Unlimited internal distribution
- No device limit
- $299/year Enterprise account required
- Bypass App Store entirely

#### Option 4: Expo Go Development
```bash
# For development and quick testing
npx expo start
```

**Expo Go Benefits:**
- Free for development
- Instant updates
- No build required
- Limited to Expo SDK features

### Day 18: Distribution Setup

#### Step 18.1: Apple Developer Account Setup
1. **Purchase Apple Developer Account** ($99/year)
2. **Create App Identifier**:
   - Bundle ID: `com.uraeusoldings.redpandaalerts`
   - Enable Push Notifications capability
3. **Create Provisioning Profiles**:
   - Development profile for testing
   - Ad Hoc profile for beta distribution
   - App Store profile for production

#### Step 18.2: Push Notification Certificates
```bash
# Generate push notification keys
eas credentials

# Configure push notifications
eas build:configure
```

#### Step 18.3: Build and Distribute
```bash
# Build for internal testing
eas build --platform ios --profile internal

# Get shareable link
eas build:list
```

---

## Testing and Deployment Checklist

### Pre-Launch Testing
- [ ] Test on iOS simulator
- [ ] Test on physical iOS device
- [ ] Test on Android emulator
- [ ] Test on physical Android device
- [ ] Test web version on desktop
- [ ] Test web version on mobile browser
- [ ] Test push notifications on device
- [ ] Test all AWS Amplify functionality
- [ ] Test offline functionality
- [ ] Performance testing

### Distribution Checklist
- [ ] Apple Developer account active
- [ ] App icons and splash screens ready
- [ ] Privacy policy and terms of service
- [ ] Push notification permissions working
- [ ] TestFlight metadata configured
- [ ] Beta tester list prepared
- [ ] Crash reporting setup
- [ ] Analytics configured

## 🚀 Launch Commands

```bash
# Development
npx expo start                    # All platforms
npx expo start --web             # Web only
npx expo start --ios             # iOS only

# Building
eas build --platform ios         # iOS build
eas build --platform android     # Android build
npx expo export --platform web   # Web build

# Distribution
eas submit --platform ios        # Submit to App Store/TestFlight
```

## 📈 Success Metrics

### Technical Metrics
- Build success rate: >95%
- App startup time: <3 seconds
- Push notification delivery rate: >90%
- Cross-platform feature parity: 100%

### User Metrics
- Beta tester engagement rate
- Crash-free session rate: >99%
- User feedback scores
- Feature adoption rates

This complete migration plan takes you from your current Next.js + React Native setup to a fully universal Expo app with push notifications and iOS distribution strategy! 