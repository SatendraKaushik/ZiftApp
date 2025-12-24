import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface BottomNavProps {
  activeTab: string;
  onTabPress: (tab: string) => void;
}

export default function BottomNav({ activeTab, onTabPress }: BottomNavProps) {
  const insets = useSafeAreaInsets();
  const tabs = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'saved', label: 'Saved', icon: 'bookmark' },
    { id: 'applied', label: 'Applied', icon: 'work' },
    { id: 'profile', label: 'Profile', icon: 'person' },
  ];

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={styles.tab}
          onPress={() => onTabPress(tab.id)}
        >
          <Icon
            name={tab.icon}
            size={24}
            color={activeTab === tab.id ? '#1F2937' : '#6B7280'}
          />
          <Text style={[
            styles.tabLabel,
            { color: activeTab === tab.id ? '#1F2937' : '#6B7280' }
          ]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
});