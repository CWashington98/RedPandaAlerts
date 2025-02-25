import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { getAuthToken } from '@/utils/auth'; // Your method to get the auth token

export default function ExploreScreen({ navigation }) {
  const [authToken, setAuthToken] = useState<string | null>(null);

  useEffect(() => {
    // Fetch auth token from your auth system
    const token = getAuthToken();
    setAuthToken(token);
  }, []);

  const injectedJavaScript = `
    (function() {
      window.localStorage.setItem('authToken', '${authToken}');
    })();
    true;
  `;

  const handleMessage = (event) => {
    const data = event.nativeEvent.data;
    if (data === 'navigateToDashboard') {
      navigation.navigate('Dashboard');
    }
  };

  return (
    <View style={styles.container}>
      {authToken ? (
        <WebView
          source={{ uri: 'https://your-web-app.com/explore' }}
          injectedJavaScript={injectedJavaScript}
          onMessage={handleMessage}
          startInLoadingState
          renderLoading={() => (
            <ActivityIndicator style={styles.loader} size="large" color="#0a7ea4" />
          )}
        />
      ) : (
        <ActivityIndicator style={styles.loader} size="large" color="#0a7ea4" />
      )}
    </View>
  );
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
