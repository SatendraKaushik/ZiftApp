import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, Linking, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Axios from '../../libs/Axios';

interface SettingsScreenProps {
  onBack: () => void;
  onLogout: () => void;
  onNavigateToPrivacy: () => void;
  onNavigateToTerms: () => void;
}

export default function SettingsScreen({ onBack, onLogout, onNavigateToPrivacy, onNavigateToTerms }: SettingsScreenProps) {
  const insets = useSafeAreaInsets();
  const [loggingOut, setLoggingOut] = useState(false);
  
  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive', 
          onPress: async () => {
            try {
              setLoggingOut(true);
              await Axios.post('/user/logout');
              onLogout();
            } catch (error) {
              console.error('Logout error:', error);
              onLogout();
            } finally {
              setLoggingOut(false);
            }
          }
        }
      ]
    );
  };

  const handleTermsPress = () => {
    // console.log('Terms pressed', typeof onNavigateToTerms);
    if (onNavigateToTerms) {
      onNavigateToTerms();
    } else {
      console.error('onNavigateToTerms is undefined');
    }
  };

  const handlePrivacyPress = () => {
    // console.log('Privacy pressed', typeof onNavigateToPrivacy);
    if (onNavigateToPrivacy) {
      onNavigateToPrivacy();
    } else {
      console.error('onNavigateToPrivacy is undefined');
    }
  };

  const handleHelpPress = () => {
    const email = 'zifttech@gmail.com';
    const subject = 'Help & Support Request';
    const body = 'Hi Zift Team,\n\nI need help with:\n\n';
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    Linking.openURL(mailtoUrl).catch(() => {
      Alert.alert('Error', 'Unable to open email client. Please email us at zifttech@gmail.com');
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Icon name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 20 + insets.bottom }}>
        <View style={styles.section}>
          <TouchableOpacity style={styles.settingItem} onPress={handleTermsPress}>
            <View style={styles.settingLeft}>
              <Icon name="description" size={24} color="#6B7280" />
              <Text style={styles.settingText}>Terms & Conditions</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handlePrivacyPress}>
            <View style={styles.settingLeft}>
              <Icon name="lock-outline" size={24} color="#6B7280" />
              <Text style={styles.settingText}>Privacy Policy</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handleHelpPress}>
            <View style={styles.settingLeft}>
              <Icon name="help-outline" size={24} color="#6B7280" />
              <Text style={styles.settingText}>Help & Support</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handleLogout} disabled={loggingOut}>
            <View style={styles.settingLeft}>
              <Icon name="logout" size={24} color="#EF4444" />
              <Text style={[styles.settingText, { color: '#EF4444' }]}>Logout</Text>
            </View>
            {loggingOut ? (
              <ActivityIndicator size="small" color="#EF4444" />
            ) : (
              <Icon name="chevron-right" size={24} color="#9CA3AF" />
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#1F2937' },
  content: { flex: 1, paddingTop: 8 },
  section: { backgroundColor: '#FFFFFF', marginBottom: 8 },
  settingItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  settingText: { fontSize: 16, color: '#1F2937', fontWeight: '500' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, paddingVertical: 16, marginHorizontal: 20, marginVertical: 12, borderRadius: 12, backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FEE2E2' },
  logoutText: { fontSize: 16, fontWeight: '600', color: '#EF4444' },
  version: { textAlign: 'center', fontSize: 12, color: '#9CA3AF', marginTop: 20 },
});
