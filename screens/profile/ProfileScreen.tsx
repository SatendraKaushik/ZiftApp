import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Image, Switch, Alert, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LottieView from 'lottie-react-native';
import { pick } from '@react-native-documents/picker';
import ReactNativeBlobUtil from 'react-native-blob-util';
import Axios from '../../libs/Axios';

interface ProfileScreenProps {
  onNavigateToApplied: () => void;
  onNavigateToSettings: () => void;
  onNavigateToEditProfile: (user: any) => void;
  onNavigateToAnalytics: () => void;
}

export default function ProfileScreen({ onNavigateToApplied, onNavigateToSettings, onNavigateToEditProfile, onNavigateToAnalytics }: ProfileScreenProps) {
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updatingPublic, setUpdatingPublic] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [resumeData, setResumeData] = useState<any>(null);

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
    if (value && (!user.phoneNumber || !user.isResumeUploaded)) {
      Alert.alert(
        'Profile Incomplete',
        'Please add phone number and upload resume before making your profile public.',
        [{ text: 'OK' }]
      );
      return;
    }
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

  const handleResumeUpload = async () => {
    try {
      const [file] = await pick({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        allowMultiSelection: false,
      });

      const maxSize = 5 * 1024 * 1024;
      if (file.size && file.size > maxSize) {
        Alert.alert('Error', 'File size must be less than 5MB');
        return;
      }

      setUploadingResume(true);

      const parserResponse = await ReactNativeBlobUtil.fetch(
        'POST',
        'https://resumeparser.api.thezift.com/upload-resume/',
        { 'Content-Type': 'multipart/form-data' },
        [
          {
            name: 'file',
            filename: file.name || 'resume.pdf',
            type: file.type || 'application/pdf',
            data: ReactNativeBlobUtil.wrap(file.uri)
          }
        ]
      );

      const parsedData = JSON.parse(parserResponse.data);
      await Axios.post('/resume/save', parsedData);

      Alert.alert('Success', 'Resume uploaded successfully!');
      fetchUserProfile();
    } catch (error: any) {
      if (error?.message !== 'User canceled document picker') {
        console.error('Resume upload error:', error);
        Alert.alert('Error', 'Failed to upload resume.');
      }
    } finally {
      setUploadingResume(false);
    }
  };

  const handleViewResume = async () => {
    try {
      const response = await Axios.get('/resume/get');
      const data = response.data.data;
      
      if (!data || Object.keys(data).length === 0) {
        Alert.alert('No Data', 'Resume data is empty. Please re-upload your resume.');
        return;
      }
      
      setResumeData(data);
      setShowResumeModal(true);
    } catch (error) {
      console.error('Resume fetch error:', error);
      Alert.alert('Error', 'No resume found. Please upload your resume first.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#DC2626" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <LottieView
          source={require('../../assets/lottie/empty.lottie')}
          autoPlay
          loop
          style={styles.lottieAnimation}
        />
        <Text style={styles.errorText}>Unable to load profile</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={onNavigateToSettings} style={styles.settingsBtn}>
          <Icon name="settings" size={24} color="#DC2626" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom }}>
        <View style={styles.profileSection}>
          <View style={styles.profileRow}>
            <View style={styles.avatarContainer}>
              {user.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{user.name?.charAt(0) || 'U'}</Text>
                </View>
              )}
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user.name || 'User'}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              {user.phoneVerified && (
                <View style={styles.verifiedBadge}>
                  <Icon name="verified" size={14} color="#059669" />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="work-outline" size={20} color="#DC2626" />
            <Text style={styles.sectionTitle}>My Activity</Text>
          </View>
          
          <TouchableOpacity style={styles.activityCard} onPress={onNavigateToApplied}>
            <View style={styles.activityLeft}>
              <View style={styles.activityIcon}>
                <Icon name="description" size={24} color="#DC2626" />
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
            <Icon name="person-outline" size={20} color="#DC2626" />
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
                trackColor={{ false: '#D1D5DB', true: '#FCA5A5' }}
                thumbColor={user.makeprofilepublic ? '#DC2626' : '#F3F4F6'}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.editButton} onPress={() => onNavigateToEditProfile(user)}>
            <Icon name="edit" size={18} color="#DC2626" />
            <Text style={styles.editButtonText}>Edit Details</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="description" size={20} color="#DC2626" />
            <Text style={styles.sectionTitle}>Resume</Text>
          </View>

          {user.isResumeUploaded ? (
            <View style={styles.resumeUploadedCard}>
              <View style={styles.resumeHeader}>
                <View style={styles.resumeIconContainer}>
                  <Icon name="description" size={32} color="#DC2626" />
                </View>
                <View style={styles.resumeHeaderInfo}>
                  <Text style={styles.resumeTitle}>Resume Uploaded</Text>
                  <Text style={styles.resumeSubtitle}>Your resume is ready for recruiters</Text>
                </View>
                <View style={styles.resumeStatusBadge}>
                  <Icon name="check-circle" size={16} color="#059669" />
                </View>
              </View>
              
              <View style={styles.resumeActionsRow}>
                <TouchableOpacity style={styles.resumeActionButton} onPress={handleViewResume}>
                  <Icon name="visibility" size={18} color="#3B82F6" />
                  <Text style={styles.resumeActionText}>View</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.resumeActionButton, styles.resumeUpdateButton]} 
                  onPress={handleResumeUpload} 
                  disabled={uploadingResume}
                >
                  {uploadingResume ? (
                    <ActivityIndicator size="small" color="#DC2626" />
                  ) : (
                    <>
                      <Icon name="refresh" size={18} color="#DC2626" />
                      <Text style={[styles.resumeActionText, { color: '#DC2626' }]}>Update</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.noResumeCard}>
              <View style={styles.noResumeIconContainer}>
                <Icon name="cloud-upload" size={56} color="#DC2626" />
              </View>
              <Text style={styles.noResumeTitle}>Upload Your Resume</Text>
              <Text style={styles.noResumeText}>Stand out to recruiters by uploading your resume</Text>
              <TouchableOpacity style={styles.uploadButton} onPress={handleResumeUpload} disabled={uploadingResume}>
                {uploadingResume ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Icon name="upload-file" size={20} color="#FFFFFF" />
                    <Text style={styles.uploadButtonText}>Upload Resume</Text>
                  </>
                )}
              </TouchableOpacity>
              <Text style={styles.uploadHint}>Supports PDF, DOC, DOCX (Max 5MB)</Text>
            </View>
          )}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      <Modal visible={showResumeModal} animationType="slide" transparent onRequestClose={() => setShowResumeModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>📄 Resume Summary</Text>
              <TouchableOpacity onPress={() => setShowResumeModal(false)} style={styles.modalCloseBtn}>
                <Icon name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {resumeData?.Name && (
                <View style={styles.modalSection}>
                  <View style={styles.modalSectionHeader}>
                    <Icon name="person" size={20} color="#DC2626" />
                    <Text style={styles.modalSectionTitle}>Personal Info</Text>
                  </View>
                  <Text style={styles.modalText}>{resumeData.Name}</Text>
                  {resumeData.Email && <Text style={styles.modalText}>{resumeData.Email}</Text>}
                  {resumeData.Phone && <Text style={styles.modalText}>{resumeData.Phone}</Text>}
                </View>
              )}

              {resumeData?.Skills?.PrimarySkills?.length > 0 && (
                <View style={styles.modalSection}>
                  <View style={styles.modalSectionHeader}>
                    <Icon name="code" size={20} color="#DC2626" />
                    <Text style={styles.modalSectionTitle}>Primary Skills</Text>
                  </View>
                  <View style={styles.skillsGrid}>
                    {resumeData.Skills.PrimarySkills.map((skill: any, idx: number) => (
                      <View key={idx} style={styles.skillChip}>
                        <Text style={styles.skillChipText}>{skill.SkillName}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {resumeData?.Experience?.length > 0 && (
                <View style={styles.modalSection}>
                  <View style={styles.modalSectionHeader}>
                    <Icon name="work" size={20} color="#DC2626" />
                    <Text style={styles.modalSectionTitle}>Experience</Text>
                  </View>
                  {resumeData.Experience.map((exp: any, idx: number) => (
                    <View key={idx} style={styles.expCard}>
                      <Text style={styles.expPosition}>{exp.Position}</Text>
                      <Text style={styles.expCompany}>{exp.CompanyName}</Text>
                      <Text style={styles.expDate}>{exp.StartDate} - {exp.EndDate}</Text>
                      {exp.Description && <Text style={styles.expDesc}>{exp.Description}</Text>}
                    </View>
                  ))}
                </View>
              )}

              {resumeData?.Education?.length > 0 && (
                <View style={styles.modalSection}>
                  <View style={styles.modalSectionHeader}>
                    <Icon name="school" size={20} color="#DC2626" />
                    <Text style={styles.modalSectionTitle}>Education</Text>
                  </View>
                  {resumeData.Education.map((edu: any, idx: number) => (
                    <View key={idx} style={styles.expCard}>
                      <Text style={styles.expPosition}>{edu.Degree}</Text>
                      <Text style={styles.expCompany}>{edu.Institute}</Text>
                      <Text style={styles.expDate}>{edu.StartDate} - {edu.EndDate}</Text>
                      {edu.Grade && <Text style={styles.expDesc}>{edu.Grade}</Text>}
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  lottieAnimation: { width: 200, height: 200, marginBottom: -20 },
  errorText: { fontSize: 16, color: '#6B7280', marginTop: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#DC2626' },
  settingsBtn: { padding: 8 },
  content: { flex: 1 },
  profileSection: { backgroundColor: '#FFFFFF', paddingVertical: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatarContainer: {},
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FEF2F2', justifyContent: 'center', alignItems: 'center' },
  avatarImage: { width: 64, height: 64, borderRadius: 32 },
  avatarText: { fontSize: 24, fontWeight: 'bold', color: '#DC2626' },
  profileInfo: { flex: 1 },
  userName: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 2 },
  userEmail: { fontSize: 13, color: '#6B7280', marginBottom: 4 },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#D1FAE5', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, alignSelf: 'flex-start' },
  verifiedText: { fontSize: 11, color: '#059669', fontWeight: '600' },
  section: { backgroundColor: '#FFFFFF', padding: 20, marginTop: 8 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  activityCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#F9FAFB', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  activityLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  activityIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FEF2F2', justifyContent: 'center', alignItems: 'center' },
  activityTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 2 },
  activitySubtitle: { fontSize: 13, color: '#6B7280' },
  detailsCard: { gap: 16, marginBottom: 16 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  detailLabel: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  detailValue: { fontSize: 14, color: '#1F2937', fontWeight: '600' },
  editButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: '#FCA5A5', backgroundColor: '#FFFFFF' },
  editButtonText: { fontSize: 14, fontWeight: '600', color: '#DC2626' },
  resumeUploadedCard: { backgroundColor: '#F9FAFB', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  resumeHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  resumeIconContainer: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#FEF2F2', justifyContent: 'center', alignItems: 'center' },
  resumeHeaderInfo: { flex: 1 },
  resumeTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 2 },
  resumeSubtitle: { fontSize: 13, color: '#6B7280' },
  resumeStatusBadge: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#D1FAE5', justifyContent: 'center', alignItems: 'center' },
  resumeActionsRow: { flexDirection: 'row', gap: 12 },
  resumeActionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 8, backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE' },
  resumeUpdateButton: { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5' },
  resumeActionText: { fontSize: 14, fontWeight: '600', color: '#3B82F6' },
  noResumeCard: { alignItems: 'center', padding: 32, backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 2, borderColor: '#FCA5A5', borderStyle: 'dashed' },
  noResumeIconContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FEF2F2', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  noResumeTitle: { fontSize: 18, fontWeight: '600', color: '#1F2937', marginBottom: 8 },
  noResumeText: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 20 },
  uploadButton: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#DC2626', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, shadowColor: '#DC2626', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
  uploadButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  uploadHint: { fontSize: 12, color: '#9CA3AF', marginTop: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%', paddingBottom: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#1F2937' },
  modalCloseBtn: { padding: 4 },
  modalScroll: { padding: 20 },
  modalSection: { marginBottom: 24 },
  modalSectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  modalSectionTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  modalText: { fontSize: 14, color: '#4B5563', marginBottom: 4 },
  skillsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  skillChip: { backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: '#BFDBFE' },
  skillChipText: { fontSize: 13, color: '#1E40AF', fontWeight: '500' },
  expCard: { backgroundColor: '#F9FAFB', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  expPosition: { fontSize: 15, fontWeight: '600', color: '#1F2937', marginBottom: 4 },
  expCompany: { fontSize: 14, color: '#DC2626', marginBottom: 4 },
  expDate: { fontSize: 12, color: '#6B7280', marginBottom: 8 },
  expDesc: { fontSize: 13, color: '#4B5563', lineHeight: 20 },
});
