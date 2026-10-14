import React, { useRef, useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  ActivityIndicator,
  BackHandler,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { WebView } from 'react-native-webview';

// URL target: bisa localhost saat dev atau URL Vercel produksi
// Note: di Android emulator gunakan 10.0.2.2, di HP fisik gunakan IP LAN (contoh: 192.168.1.x)
const DEV_URL = Platform.select({
  android: 'http://10.0.2.2:5173',
  default: 'http://localhost:5173',
});

// Ganti dengan URL Vercel Anda saat siap production
const PROD_URL = 'https://zayytune.vercel.app';

export default function App() {
  const webViewRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);

  // Handle hardware back button di Android
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const onBackPress = () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress
    );

    return () => backHandler.remove();
  }, [canGoBack]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" backgroundColor="#08090e" />
      <View style={styles.container}>
        <WebView
          ref={webViewRef}
          source={{ uri: __DEV__ ? DEV_URL : PROD_URL }}
          style={styles.webView}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          onNavigationStateChange={(navState) => {
            setCanGoBack(navState.canGoBack);
          }}
          onLoadEnd={() => setIsLoading(false)}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn('WebView error: ', nativeEvent);
            // Fallback ke PROD jika DEV gagal dijangkau di HP fisik
            if (__DEV__ && nativeEvent.url !== PROD_URL) {
              webViewRef.current?.injectJavaScript(
                `window.location.href = "${PROD_URL}";`
              );
            }
          }}
        />

        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#6366f1" />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#08090e',
  },
  container: {
    flex: 1,
    backgroundColor: '#08090e',
  },
  webView: {
    flex: 1,
    backgroundColor: '#08090e',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#08090e',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
