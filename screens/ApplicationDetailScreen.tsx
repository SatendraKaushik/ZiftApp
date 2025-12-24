import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Linking, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Axios from '../libs/Axios';

interface Application {
  _id: string;
  status: string;
  currentStage: string;
  isShortlisted: boolean;
  shortlistedAt?: string;
  isHired: boolean;
  isRejected: boolean;
  rejectionDetails?: {
    reason: string;
    rejectedAt: string;
  };
  profileLink?: string;
  createdAt: string;
  updatedAt: string;
}

interface Stage {
  stageType: string;
  stageName: string;
  stageOrder: number;
  interviewType: string;
  isRequired: boolean;
  stageStatus: string;
  isCurrentStage: boolean;
  isPastStage: boolean;
  interview?: {
    scheduledDateTime?: string;
    meetingLink?: string;
    location?: string;
    instructions?: string[];
    status?: string;
  };
  passedAt?: string;
  failedAt?: string;
}

interface Job {
  _id: string;
  title: string;
  role: string;
  location: string;
  salaryRange: string;
  jobType: string;
  description: string;
  skillsRequired: string[];
}

interface ApplicationDetailScreenProps {
  applicationId: string;
  onBack: () => void;
  onViewJob: (jobId: string) => void;
}

export default function ApplicationDetailScreen({ applicationId, onBack, onViewJob }: ApplicationDetailScreenProps) {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState<Application | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [job, setJob] = useState<Job | null>(null);

  useEffect(() => {
    fetchApplicationDetails();
  }, [applicationId]);

  const fetchApplicationDetails = async () => {
    try {
      setLoading(true);
      const response = await Axios.get(`/user/applications/${applicationId}`);
      const data = response.data.data;
      
      const cleanStages = data.stages.map((stage: any) => ({
        stageType: stage.stageType || stage._doc?.stageType,
        stageName: stage.stageName || stage._doc?.stageName,
        stageOrder: stage.stageOrder || stage._doc?.stageOrder,
        interviewType: stage.interviewType || stage._doc?.interviewType,
        isRequired: stage.isRequired || stage._doc?.isRequired,
        stageStatus: stage.stageStatus || 'PENDING',
        isCurrentStage: stage.isCurrentStage || false,
        isPastStage: stage.isPastStage || false,
        interview: stage.interview || null,
        passedAt: stage.passedAt || null,
        failedAt: stage.failedAt || null,
      }));
      
      setApplication(data.application);
      setStages(cleanStages);
      setJob(data.job);
    } catch (error) {
      console.error('Error fetching application details:', error);
      Alert.alert('Error', 'Failed to load application details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'APPLIED': '#DC2626',
      'IN_INTERVIEW': '#F59E0B',
      'SHORTLISTED': '#10B981',
      'HIRED': '#059669',
      'REJECTED': '#EF4444'
    };
    return colors[status] || '#6B7280';
  };

  const getStageStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'PASSED': '#10B981',
      'IN_PROGRESS': '#DC2626',
      'PENDING': '#6B7280',
      'REJECTED': '#EF4444'
    };
    return colors[status] || '#6B7280';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#DC2626" />
      </View>
    );
  }

  if (!application || !job) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Application not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Icon name="arrow-back" size={24} color="#DC2626" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Application Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom }}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="business" size={20} color="#DC2626" />
            <Text style={styles.sectionTitle}>Job Information</Text>
          </View>
          
          <Text style={styles.jobTitle}>{job.role}</Text>
          
          <View style={styles.jobDetails}>
            <View style={styles.detailRow}>
              <Icon name="location-on" size={18} color="#6B7280" />
              <Text style={styles.detailText}>{job.location}</Text>
            </View>
            <View style={styles.detailRow}>
              <Icon name="currency-rupee" size={18} color="#6B7280" />
              <Text style={styles.detailText}>₹{job.salaryRange.replace('-', ' - ₹')}</Text>
            </View>
            <View style={styles.detailRow}>
              <Icon name="work-outline" size={18} color="#6B7280" />
              <Text style={styles.detailText}>{job.jobType}</Text>
            </View>
            <View style={styles.detailRow}>
              <Icon name="calendar-today" size={18} color="#6B7280" />
              <Text style={styles.detailText}>Applied {formatDate(application.createdAt)}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.viewJobButton} onPress={() => onViewJob(job._id)}>
            <Icon name="open-in-new" size={18} color="#FFFFFF" />
            <Text style={styles.viewJobButtonText}>View Job Posting</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="description" size={20} color="#DC2626" />
            <Text style={styles.sectionTitle}>Application Status</Text>
          </View>

          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(application.status) + '20' }]}>
              <Text style={[styles.statusBadgeText, { color: getStatusColor(application.status) }]}>
                {application.status.replace(/_/g, ' ')}
              </Text>
            </View>
            {application.currentStage && (
              <View style={styles.currentStageBadge}>
                <Text style={styles.currentStageText}>
                  Current: {stages.find(s => s.stageType === application.currentStage)?.stageName || application.currentStage}
                </Text>
              </View>
            )}
          </View>

          {application.status === 'REJECTED' && application.rejectionDetails && (
            <View style={styles.rejectionCard}>
              <View style={styles.rejectionHeader}>
                <Icon name="cancel" size={20} color="#EF4444" />
                <Text style={styles.rejectionTitle}>Application Rejected</Text>
              </View>
              <Text style={styles.rejectionReason}>Reason: {application.rejectionDetails.reason}</Text>
              <Text style={styles.rejectionDate}>Rejected on: {formatDate(application.rejectionDetails.rejectedAt)}</Text>
            </View>
          )}

          <View style={styles.progressSection}>
            <Text style={styles.progressTitle}>Interview Progress</Text>
            
            {stages && stages.length > 0 ? (
              stages.map((stage, index) => (
                <View key={index} style={styles.stageCard}>
                  <View style={styles.stageLeft}>
                    <View style={[styles.stageIndicator, {
                      backgroundColor: application.status === 'REJECTED' && !stage.isPastStage ? '#EF4444' : stage.isCurrentStage ? '#DC2626' : stage.isPastStage ? '#10B981' : '#D1D5DB'
                    }]}>
                      {stage.isPastStage ? (
                        <Icon name="check" size={16} color="#FFFFFF" />
                      ) : application.status === 'REJECTED' && !stage.isPastStage ? (
                        <Icon name="close" size={16} color="#FFFFFF" />
                      ) : (
                        <Text style={styles.stageNumber}>{index + 1}</Text>
                      )}
                    </View>
                    {index < stages.length - 1 && (
                      <View style={[styles.stageLine, { backgroundColor: stage.isPastStage ? '#10B981' : '#E5E7EB' }]} />
                    )}
                  </View>

                  <View style={styles.stageContent}>
                    <View style={styles.stageHeader}>
                      <Text style={styles.stageName}>{stage.stageName}</Text>
                      <View style={[styles.stageStatusBadge, { backgroundColor: getStageStatusColor(stage.stageStatus) + '20' }]}>
                        <Text style={[styles.stageStatusText, { color: getStageStatusColor(stage.stageStatus) }]}>
                          {stage.stageStatus.replace(/_/g, ' ')}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.stageDetails}>
                      {stage.interview?.scheduledDateTime && (
                        <View style={styles.stageDetailRow}>
                          <Icon name="event" size={14} color="#6B7280" />
                          <Text style={styles.stageDetailText}>{formatDate(stage.interview.scheduledDateTime)}</Text>
                        </View>
                      )}
                      
                      {stage.interview?.status && (
                        <Text style={styles.stageDetailText}>Status: {stage.interview.status}</Text>
                      )}

                      {application.status === 'REJECTED' && !stage.isPastStage && (
                        <Text style={styles.cancelledText}>Cancelled due to rejection</Text>
                      )}

                      {stage.interview?.meetingLink && !stage.isPastStage && application.status !== 'REJECTED' && (
                        <TouchableOpacity style={styles.meetingLinkButton} onPress={() => Linking.openURL(stage.interview!.meetingLink!)}>
                          <Icon name="videocam" size={16} color="#DC2626" />
                          <Text style={styles.meetingLinkText}>Join Meeting</Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    <View style={styles.interviewTypeBadge}>
                      <Text style={styles.interviewTypeText}>{stage.interviewType}</Text>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.noStagesText}>No interview stages available</Text>
            )}
          </View>
        </View>

        {application.profileLink && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="link" size={20} color="#DC2626" />
              <Text style={styles.sectionTitle}>Profile Link</Text>
            </View>
            <Text style={styles.profileLinkDesc}>View your submitted profile for this application</Text>
            <TouchableOpacity style={styles.profileLinkButton} onPress={() => Linking.openURL(application.profileLink!)}>
              <Icon name="open-in-new" size={18} color="#1F2937" />
              <Text style={styles.profileLinkButtonText}>View Profile</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { fontSize: 16, color: '#6B7280', marginBottom: 16 },
  backButton: { backgroundColor: '#DC2626', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  backButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#DC2626' },
  content: { flex: 1 },
  section: { backgroundColor: '#FFFFFF', padding: 20, marginTop: 8 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  jobTitle: { fontSize: 20, fontWeight: '700', color: '#1F2937', marginBottom: 16 },
  jobDetails: { gap: 12, marginBottom: 16 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailText: { fontSize: 14, color: '#4B5563' },
  viewJobButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#DC2626', paddingVertical: 12, borderRadius: 8 },
  viewJobButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  statusContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusBadgeText: { fontSize: 13, fontWeight: '600' },
  currentStageBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: '#D1D5DB' },
  currentStageText: { fontSize: 12, color: '#374151', fontWeight: '500' },
  rejectionCard: { backgroundColor: '#FEF2F2', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#FEE2E2', marginBottom: 16 },
  rejectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  rejectionTitle: { fontSize: 14, fontWeight: '600', color: '#EF4444' },
  rejectionReason: { fontSize: 13, color: '#DC2626', marginBottom: 4 },
  rejectionDate: { fontSize: 12, color: '#EF4444' },
  progressSection: { marginTop: 8 },
  progressTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 16 },
  stageCard: { flexDirection: 'row', marginBottom: 16 },
  stageLeft: { alignItems: 'center', marginRight: 12 },
  stageIndicator: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  stageNumber: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  stageLine: { width: 2, flex: 1, marginVertical: 4 },
  stageContent: { flex: 1, backgroundColor: '#F9FAFB', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  stageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  stageName: { fontSize: 14, fontWeight: '600', color: '#1F2937', flex: 1 },
  stageStatusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  stageStatusText: { fontSize: 11, fontWeight: '600' },
  stageDetails: { gap: 6 },
  stageDetailRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stageDetailText: { fontSize: 12, color: '#6B7280' },
  cancelledText: { fontSize: 12, color: '#EF4444', fontWeight: '500' },
  meetingLinkButton: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  meetingLinkText: { fontSize: 12, color: '#DC2626', fontWeight: '500' },
  interviewTypeBadge: { marginTop: 8, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#D1D5DB' },
  interviewTypeText: { fontSize: 10, color: '#6B7280', fontWeight: '500' },
  profileLinkDesc: { fontSize: 14, color: '#6B7280', marginBottom: 12 },
  profileLinkButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: '#D1D5DB', backgroundColor: '#FFFFFF' },
  profileLinkButtonText: { color: '#1F2937', fontSize: 14, fontWeight: '600' },
  noStagesText: { fontSize: 14, color: '#6B7280', textAlign: 'center', paddingVertical: 20 },
});
