import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, ActivityIndicator, Platform } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function DashboardScreen() {
  const [expoPushToken, setExpoPushToken] = useState<string>('');
  const [notification, setNotification] = useState<boolean>(false);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    // Register for push notifications
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        setExpoPushToken(token);
        // Store token in your backend
        storeTokenInBackend(token);
      }
    });

    // Handle received notifications
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(true);
    });

    // Handle notification responses (when user taps notification)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data as { stockId?: string };
      // Navigate to specific stock or section based on notification data
      if (data.stockId && webViewRef.current) {
        webViewRef.current.injectJavaScript(`
          window.location.href = '/stocks/${data.stockId}';
          true;
        `);
      }
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

  // Inject push token into web app
  const injectedJavaScript = `
    (function() {
      window.EXPO_PUSH_TOKEN = "${expoPushToken}";
      // Let the web app know this is running in a mobile context
      window.IS_MOBILE_APP = true;
      true;
    })();
  `;

  // Handle messages from web app
  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'REGISTER_STOCK_ALERT') {
        // Register the alert in your backend
        registerStockAlert(data.stockId, data.targetPrice, expoPushToken);
      }
    } catch (e) {
      console.error('Error handling message from WebView:', e);
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri: 'https://your-web-app.com/dashboard' }}
        injectedJavaScript={injectedJavaScript}
        onMessage={handleMessage}
        startInLoadingState
        renderLoading={() => (
          <ActivityIndicator style={styles.loader} size="large" color="#0a7ea4" />
        )}
      />
    </View>
  );
}

// Register for push notifications
async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  let token;
  
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Constants.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    
    token = (await Notifications.getExpoPushTokenAsync()).data;
  } else {
    alert('Must use physical device for Push Notifications');
  }

  return token;
}

// Store token in your backend
async function storeTokenInBackend(token: string): Promise<void> {
  try {
    const response = await fetch('https://your-api.com/store-push-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });
    const data = await response.json();
    console.log('Token stored in backend:', data);
  } catch (error) {
    console.error('Error storing token:', error);
  }
}

// Register stock alert in your backend
async function registerStockAlert(stockId: string, targetPrice: number, token: string): Promise<void> {
  try {
    const response = await fetch('https://your-api.com/register-stock-alert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ stockId, targetPrice, token }),
    });
    const data = await response.json();
    console.log('Alert registered:', data);
  } catch (error) {
    console.error('Error registering alert:', error);
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
});
