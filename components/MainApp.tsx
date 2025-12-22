import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import JobDetailScreen from '../screens/JobDetailScreen';
import BottomNav from '../components/BottomNav';
import LoginScreen from './auth/LoginScreen';

interface MainAppProps {
  user: any;
  onLogout: () => void;
}

export default function MainApp({ user, onLogout }: MainAppProps) {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const handleJobSelect = (jobId: string) => {
    setSelectedJobId(jobId);
  };

  const handleBackToHome = () => {
    setSelectedJobId(null);
  };

  const renderScreen = () => {
    if (selectedJobId) {
      return <JobDetailScreen jobId={selectedJobId} onBack={handleBackToHome} />;
    }

    switch (activeTab) {
      case 'home':
        return <HomeScreen onJobSelect={handleJobSelect} />;
      case 'search':
        return <LoginScreen />;
      case 'saved':
        return <HomeScreen onJobSelect={handleJobSelect} />;
      case 'profile':
        return <HomeScreen onJobSelect={handleJobSelect} />;
      default:
        return <HomeScreen onJobSelect={handleJobSelect} />;
    }
  };

  return (
    <View style={styles.container}>
      {renderScreen()}
      {!selectedJobId && <BottomNav activeTab={activeTab} onTabPress={setActiveTab} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});