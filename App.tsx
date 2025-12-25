import React, { useState, useEffect } from 'react';
import { StatusBar, StyleSheet, useColorScheme, View, Appearance } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AuthNavigator from './components/auth/AuthNavigator';
import MainApp from './components/MainApp';
import { TokenStorage } from './libs/TokenStorage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    Appearance.setColorScheme('light');
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await TokenStorage.getToken();
      const userData = await TokenStorage.getUser();
      console.log('Token:', token);
      console.log('User Data:', userData);
      if (token && userData) {
        setUser(userData);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSuccess = (userData: any) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    await TokenStorage.removeToken();
    await TokenStorage.removeUser();
    setUser(null);
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <SafeAreaProvider>
        <View style={styles.container}>
          <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar 
          barStyle="dark-content"
          backgroundColor="#FFFFFF"
        />
        {isAuthenticated ? (
          <MainApp user={user} onLogout={handleLogout} />
        ) : (
          <AuthNavigator onAuthSuccess={handleAuthSuccess} />
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});

export default App;
