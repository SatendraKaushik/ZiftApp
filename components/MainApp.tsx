import React, { useState, useEffect } from 'react';
import { View, StyleSheet, BackHandler } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import JobDetailScreen from '../screens/JobDetailScreen';
import AppliedJobsScreen from '../screens/AppliedJobsScreen';
import ApplicationDetailScreen from '../screens/ApplicationDetailScreen';
import SavedJobsScreen from '../screens/SavedJobsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import AnalyticsScreen from '../screens/profile/AnalyticsScreen';
import BottomNav from '../components/BottomNav';
import LoginScreen from './auth/LoginScreen';

interface MainAppProps {
  user: any;
  onLogout: () => void;
}

export default function MainApp({ user, onLogout }: MainAppProps) {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (selectedJobId || selectedApplicationId || showSettings || editingUser || showAnalytics) {
        handleBackToHome();
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [selectedJobId, selectedApplicationId, showSettings, editingUser, showAnalytics]);

  const handleJobSelect = (jobId: string) => {
    setSelectedJobId(jobId);
    setSelectedApplicationId(null);
  };

  const handleApplicationSelect = (applicationId: string) => {
    setSelectedApplicationId(applicationId);
    setSelectedJobId(null);
  };

  const handleBackToHome = () => {
    setSelectedJobId(null);
    setSelectedApplicationId(null);
    setShowSettings(false);
    setEditingUser(null);
    setShowAnalytics(false);
  };

  const handleNavigateToApplied = () => {
    setActiveTab('applied');
  };

  const handleNavigateToProfile = () => {
    setActiveTab('profile');
  };

  const handleNavigateToSettings = () => {
    setShowSettings(true);
  };

  const handleNavigateToEditProfile = (userData: any) => {
    setEditingUser(userData);
  };

  const handleNavigateToAnalytics = () => {
    setShowAnalytics(true);
  };

  const handleProfileUpdate = () => {
    setActiveTab('profile');
  };

  const renderScreen = () => {
    if (selectedJobId) {
      return <JobDetailScreen jobId={selectedJobId} onBack={handleBackToHome} />;
    }

    if (selectedApplicationId) {
      return (
        <ApplicationDetailScreen
          applicationId={selectedApplicationId}
          onBack={handleBackToHome}
          onViewJob={handleJobSelect}
        />
      );
    }

    if (showSettings) {
      return <SettingsScreen onBack={handleBackToHome} onLogout={onLogout} />;
    }

    if (showAnalytics) {
      return <AnalyticsScreen onBack={handleBackToHome} />;
    }

    if (editingUser) {
      return (
        <EditProfileScreen
          user={editingUser}
          onBack={handleBackToHome}
          onUpdate={handleProfileUpdate}
        />
      );
    }

    switch (activeTab) {
      case 'home':
        return <HomeScreen onJobSelect={handleJobSelect} onNavigateToProfile={handleNavigateToProfile} />;
      case 'saved':
        return <SavedJobsScreen onJobSelect={handleJobSelect} />;
      case 'applied':
        return <AppliedJobsScreen onJobSelect={handleJobSelect} onApplicationSelect={handleApplicationSelect} />;
      case 'profile':
        return (
          <ProfileScreen
            onNavigateToApplied={handleNavigateToApplied}
            onNavigateToSettings={handleNavigateToSettings}
            onNavigateToEditProfile={handleNavigateToEditProfile}
            onNavigateToAnalytics={handleNavigateToAnalytics}
          />
        );
      default:
        return <HomeScreen onJobSelect={handleJobSelect} onNavigateToProfile={handleNavigateToProfile} />;
    }
  };

  return (
    <View style={styles.container}>
      {renderScreen()}
      {!selectedJobId && !selectedApplicationId && !showSettings && !editingUser && !showAnalytics && <BottomNav activeTab={activeTab} onTabPress={setActiveTab} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});