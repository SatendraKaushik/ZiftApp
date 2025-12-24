import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Image, Switch, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import ReactNativeBlobUtil from 'react-native-blob-util';
import Axios from '../../libs/Axios';

interface ProfileScreenProps {
  onNavigateToApplied: () => void;
  onNavigateToSettings: () => void;
  onNavigateToEditProfile: (user: any) => void;
  onNavigateToAnalytics: () => void;
}

export default function ProfileScreen({ onNavigateToApplied, onNavigateToSettings, onNavigateToEditProfile, onNavigateToAnalytics }: ProfileScreenProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updatingPublic, setUpdatingPublic] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await Axios.get('/user/get-user-profile-data');
      if (response.data.authenticated) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublicProfile = async (value: boolean) => {
    try {
      setUpdatingPublic(true);
      await Axios.put('/user/profile', {
        makeprofilepublic: value,
      });
      setUser({ ...user, makeprofilepublic: value });
    } catch (error) {
      console.error('Error updating public profile:', error);
    } finally {
      setUpdatingPublic(false);
    }
  };

  const handleResumeUpload = () => {
    const options = {
      mediaType: 'mixed',
      includeBase64: false,
      selectionLimit: 1,
    };

    launchImageLibrary(options, async (response) => {
      if (response.didCancel) {
        console.log('User cancelled');
        return;
      }
      
      if (response.errorMessage) {
        Alert.alert('Error', response.errorMessage);
        return;
      }

      if (!response.assets || response.assets.length === 0) {
        return;
      }

      const file = response.assets[0];
      const maxSize = 5 * 1024 * 1024;

      if (file.fileSize && file.fileSize > maxSize) {
        Alert.alert('Error', 'File size must be less than 5MB');
        return;
      }

      try {
        setUploadingResume(true);

        const parserResponse = await ReactNativeBlobUtil.fetch(
          'POST',
          'https://resumeparser.api.thezift.com/upload-resume/',
          { 'Content-Type': 'multipart/form-data' },
          [
            {
              name: 'file',
              filename: file.fileName || 'resume.pdf',
              type: file.type || 'application/pdf',
              data: ReactNativeBlobUtil.wrap(file.uri)
            }
          ]
        );

        const parsedData = JSON.parse(parserResponse.data);
        await Axios.post('/resume/save', parsedData);

        Alert.alert('Success', 'Resume uploaded successfully!');
        fetchUserProfile();
      } catch (error) {
        console.error('Resume upload error:', error);
        Alert.alert('Error', 'Failed to upload resume.');
      } finally {
        setUploadingResume(false);
      }
    });
  };

  const handleViewResume = async () => {
    try {
      const response = await Axios.get('/resume/get');
     
      Alert.alert('Resume Data', JSON.stringify(response.data.data, null, 2));
    } catch (error) {
      Alert.alert('Error', 'No resume found. Please upload your resume first.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1F2937" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Unable to load profile</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={onNavigateToSettings} style={styles.settingsBtn}>
          <Icon name="settings" size={24} color="#1F2937" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {user.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{user.name?.charAt(0) || 'U'}</Text>
              </View>
            )}
          </View>
          <Text style={styles.userName}>{user.name || 'User'}</Text>
          {user.phoneVerified && (
            <View style={styles.verifiedBadge}>
              <Icon name="verified" size={16} color="#059669" />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="work-outline" size={20} color="#374151" />
            <Text style={styles.sectionTitle}>My Activity</Text>
          </View>
          
          <TouchableOpacity style={styles.activityCard} onPress={onNavigateToApplied}>
            <View style={styles.activityLeft}>
              <View style={styles.activityIcon}>
                <Icon name="description" size={24} color="#3B82F6" />
              </View>
              <View>
                <Text style={styles.activityTitle}>My Applications</Text>
                <Text style={styles.activitySubtitle}>View all your job applications</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={24} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.activityCard, { marginTop: 12 }]} onPress={onNavigateToAnalytics}>
            <View style={styles.activityLeft}>
              <View style={[styles.activityIcon, { backgroundColor: '#FEF3C7' }]}>
                <Icon name="bar-chart" size={24} color="#F59E0B" />
              </View>
              <View>
                <Text style={styles.activityTitle}>Analytics</Text>
                <Text style={styles.activitySubtitle}>View your coding statistics</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={24} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="person-outline" size={20} color="#374151" />
            <Text style={styles.sectionTitle}>Basic Details</Text>
          </View>

          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <View style={styles.detailLeft}>
                <Icon name="email" size={20} color="#6B7280" />
                <Text style={styles.detailLabel}>Email</Text>
              </View>
              <Text style={styles.detailValue}>{user.email || 'N/A'}</Text>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailLeft}>
                <Icon name="phone" size={20} color="#6B7280" />
                <Text style={styles.detailLabel}>Phone</Text>
              </View>
              <Text style={styles.detailValue}>{user.phoneNumber || 'Not provided'}</Text>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailLeft}>
                <Icon name="public" size={20} color="#6B7280" />
                <Text style={styles.detailLabel}>Public Profile</Text>
              </View>
              <Switch
                value={user.makeprofilepublic}
                onValueChange={handleTogglePublicProfile}
                disabled={updatingPublic}
                trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                thumbColor={user.makeprofilepublic ? '#3B82F6' : '#F3F4F6'}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.editButton} onPress={() => onNavigateToEditProfile(user)}>
            <Icon name="edit" size={18} color="#1F2937" />
            <Text style={styles.editButtonText}>Edit Details</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="description" size={20} color="#374151" />
            <Text style={styles.sectionTitle}>Resume</Text>
          </View>

          {user.isResumeUploaded ? (
            <View style={styles.resumeCard}>
              <View style={styles.resumeInfo}>
                <Icon name="insert-drive-file" size={40} color="#3B82F6" />
                <View style={styles.resumeDetails}>
                  <Text style={styles.resumeName}>Resume.pdf</Text>
                  <Text style={styles.resumeSize}>Uploaded</Text>
                </View>
              </View>
              <View style={styles.resumeActions}>
                <TouchableOpacity style={styles.resumeActionBtn} onPress={handleViewResume}>
                  <Icon name="visibility" size={20} color="#6B7280" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.resumeActionBtn} onPress={handleResumeUpload} disabled={uploadingResume}>
                  {uploadingResume ? (
                    <ActivityIndicator size="small" color="#3B82F6" />
                  ) : (
                    <Icon name="refresh" size={20} color="#3B82F6" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.noResumeCard}>
              <Icon name="cloud-upload" size={48} color="#9CA3AF" />
              <Text style={styles.noResumeText}>No resume uploaded</Text>
              <TouchableOpacity style={styles.uploadButton} onPress={handleResumeUpload} disabled={uploadingResume}>
                {uploadingResume ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Icon name="add" size={20} color="#FFFFFF" />
                    <Text style={styles.uploadButtonText}>Upload Resume</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: '#6B7280' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#1F2937' },
  settingsBtn: { padding: 8 },
  content: { flex: 1 },
  profileSection: { backgroundColor: '#FFFFFF', paddingVertical: 32, paddingHorizontal: 20, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  avatarContainer: { marginBottom: 16 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center' },
  avatarImage: { width: 100, height: 100, borderRadius: 50 },
  avatarText: { fontSize: 40, fontWeight: '700', color: '#6B7280' },
  userName: { fontSize: 24, fontWeight: '700', color: '#1F2937', marginBottom: 8 },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#D1FAE5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  verifiedText: { fontSize: 13, color: '#059669', fontWeight: '600' },
  section: { backgroundColor: '#FFFFFF', padding: 20, marginTop: 8 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  activityCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#F9FAFB', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  activityLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  activityIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' },
  activityTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 2 },
  activitySubtitle: { fontSize: 13, color: '#6B7280' },
  detailsCard: { gap: 16, marginBottom: 16 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  detailLabel: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  detailValue: { fontSize: 14, color: '#1F2937', fontWeight: '600' },
  editButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: '#D1D5DB', backgroundColor: '#FFFFFF' },
  editButtonText: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
  resumeCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#F9FAFB', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  resumeInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  resumeDetails: { flex: 1 },
  resumeName: { fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 2 },
  resumeSize: { fontSize: 12, color: '#6B7280' },
  resumeActions: { flexDirection: 'row', gap: 8 },
  resumeActionBtn: { padding: 8 },
  noResumeCard: { alignItems: 'center', padding: 32, backgroundColor: '#F9FAFB', borderRadius: 12, borderWidth: 2, borderColor: '#E5E7EB', borderStyle: 'dashed' },
  noResumeText: { fontSize: 14, color: '#6B7280', marginTop: 12, marginBottom: 16 },
  uploadButton: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#1F2937', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  uploadButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
});
