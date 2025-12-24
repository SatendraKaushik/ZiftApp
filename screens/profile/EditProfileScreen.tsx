import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Switch, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Axios from '../../libs/Axios';

interface EditProfileScreenProps {
  user: any;
  onBack: () => void;
  onUpdate: () => void;
}

export default function EditProfileScreen({ user, onBack, onUpdate }: EditProfileScreenProps) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState(user.name || '');
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || '');
  const [makeprofilepublic, setMakeProfilePublic] = useState(user.makeprofilepublic || false);
  const [saving, setSaving] = useState(false);

  const handleTogglePublicProfile = (value: boolean) => {
    if (value && (!phoneNumber || !user.isResumeUploaded)) {
      Alert.alert(
        'Profile Incomplete',
        'Please add phone number and upload resume before making your profile public.',
        [{ text: 'OK' }]
      );
      return;
    }
    setMakeProfilePublic(value);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await Axios.put('/user/profile', {
        name,
        phoneNumber,
        makeprofilepublic,
      });
      Alert.alert('Success', 'Profile updated successfully');
      onUpdate();
      onBack();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Icon name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom }}>
        <View style={styles.section}>
          <Text style={styles.label}>Full Name</Text>
          <View style={styles.inputContainer}>
            <Icon name="person" size={20} color="#6B7280" />
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Email</Text>
          <View style={[styles.inputContainer, styles.disabledInput]}>
            <Icon name="email" size={20} color="#9CA3AF" />
            <Text style={styles.disabledText}>{user.email}</Text>
          </View>
          <Text style={styles.helperText}>Email cannot be changed</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Phone Number</Text>
          <View style={styles.inputContainer}>
            <Icon name="phone" size={20} color="#6B7280" />
            <TextInput
              style={styles.input}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Enter phone number"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.switchRow}>
            <View style={styles.switchLeft}>
              <Icon name="public" size={24} color="#6B7280" />
              <View style={styles.switchTextContainer}>
                <Text style={styles.switchLabel}>Public Profile</Text>
                <Text style={styles.switchSubtext}>Make your profile visible to recruiters</Text>
              </View>
            </View>
            <Switch
              value={makeprofilepublic}
              onValueChange={handleTogglePublicProfile}
              trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
              thumbColor={makeprofilepublic ? '#3B82F6' : '#F3F4F6'}
            />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onBack}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Icon name="check" size={20} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#1F2937' },
  content: { flex: 1 },
  section: { backgroundColor: '#FFFFFF', padding: 20, marginTop: 8 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#F9FAFB', borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  input: { flex: 1, fontSize: 14, color: '#1F2937' },
  disabledInput: { backgroundColor: '#F3F4F6' },
  disabledText: { flex: 1, fontSize: 14, color: '#9CA3AF' },
  helperText: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  switchLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  switchTextContainer: { flex: 1 },
  switchLabel: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 2 },
  switchSubtext: { fontSize: 13, color: '#6B7280' },
  buttonContainer: { flexDirection: 'row', gap: 12, padding: 20 },
  cancelButton: { flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: '#D1D5DB', backgroundColor: '#FFFFFF', alignItems: 'center' },
  cancelButtonText: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
  saveButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 8, backgroundColor: '#1F2937' },
  saveButtonText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
});
