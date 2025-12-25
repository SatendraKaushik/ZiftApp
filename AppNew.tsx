import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import AuthNavigator from './components/auth/AuthNavigator';
import MainApp from './components/MainApp';
import { TokenStorage } from './libs/TokenStorage';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await TokenStorage.getToken();
    
      if (token) {
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
    setUser(null);
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      {isAuthenticated ? (
        <MainApp user={user} onLogout={handleLogout} />
      ) : (
        <AuthNavigator onAuthSuccess={handleAuthSuccess} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});