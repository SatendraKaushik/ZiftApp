import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Image, Linking, Alert, Share } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Axios from '../libs/Axios';

interface Job {
  _id: string;
  role: string;
  title?: string;
  description: string;
  location: string;
  salaryRange: string;
  jobType: string;
  experienceLevel: number;
  skillsRequired: string[];
  workerMode: string;
  numberOfOpenings: number;
  benefits: string[];
  lastDateOfApplication: string;
  educationRequirements?: string;
  adminVerificationStatus?: string;
  status: string;
  tags?: string[];
  offlineInstructions?: string[];
  viewCount?: number;
  postedBy: {
    email: string;
    _id: string;
    company?: {
      _id: string;
      name: string;
      website?: string;
      logo?: string;
      about?: string;
      industry?: string;
      type?: string;
      size?: number;
      location?: string;
    };
  };
  createdAt: string;
  postedAt: string;
  interviewStages?: Array<{
    _id: string;
    stageName: string;
    stageOrder: number;
    interviewType: string;
    stageType: string;
    isRequired: boolean;
  }>;
  hasApplied: boolean;
  applicationStatus?: string | null;
}

interface JobDetailScreenProps {
  jobId: string;
  onBack: () => void;
}

export default function JobDetailScreen({ jobId, onBack }: JobDetailScreenProps) {
  const insets = useSafeAreaInsets();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    fetchJobDetails();
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const response = await Axios.get(`/user/jobs/${jobId}`);
      console.log('Job details:', response.data.data);
      setJob(response.data.data);
    } catch (error) {
      console.error('Error fetching job details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    try {
      setApplying(true);
      await Axios.post('/user/applications/apply', { jobId });
      await fetchJobDetails();
    } catch (error: any) {
      console.error('Error applying:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  const handleShare = async () => {
    try {
      const url = `https://thezift.com/jobs/${jobId}`;
      const message = `Check out this job opportunity!

${job?.role || job?.title}
${job?.postedBy.company?.name || 'Company'}
📍 ${job?.location}
💰 ₹${job?.salaryRange}

Apply now: ${url}`;
      
      await Share.share({ message, url });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#DC2626" />
      </View>
    );
  }

  if (!job) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Job not found</Text>
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
          <Icon name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Job Details</Text>
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
          <Icon name="share" size={22} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}>
        <View style={styles.jobHeader}>
          {job.postedBy.company?.logo ? (
            <Image source={{ uri: job.postedBy.company.logo }} style={styles.companyLogoImage} />
          ) : (
            <View style={styles.companyLogo}>
              <Text style={styles.logoText}>{job.postedBy.company?.name?.charAt(0) || 'C'}</Text>
            </View>
          )}
          <Text style={styles.jobTitle}>{job.role || job.title}</Text>
          <Text style={styles.companyName}>{job.postedBy.company?.name || 'Company'}</Text>
          {job.postedBy.company?.website && (
            <TouchableOpacity onPress={() => Linking.openURL(`https://${job.postedBy.company?.website}`)}>
              <Text style={styles.websiteLink}>{job.postedBy.company.website}</Text>
            </TouchableOpacity>
          )}
          
          <View style={styles.quickInfo}>
            <View style={styles.infoChip}>
              <Icon name="location-on" size={14} color="#4B5563" />
              <Text style={styles.infoChipText}>{job.location}</Text>
            </View>
            <View style={styles.infoChip}>
              <Icon name="work-outline" size={14} color="#4B5563" />
              <Text style={styles.infoChipText}>{job.experienceLevel}y exp</Text>
            </View>
            <View style={styles.infoChip}>
              <Icon name="schedule" size={14} color="#4B5563" />
              <Text style={styles.infoChipText}>{job.workerMode}</Text>
            </View>
          </View>
          
          {job.adminVerificationStatus && (
            <View style={styles.verificationBadge}>
              <Icon name="verified" size={16} color="#059669" />
              <Text style={styles.verificationText}>{job.adminVerificationStatus}</Text>
            </View>
          )}
          
          <View style={styles.salaryCard}>
            <Text style={styles.salaryLabel}>Salary Range</Text>
            <Text style={styles.salary}>₹{job.salaryRange.replace('-', ' - ₹')}</Text>
          </View>
        </View>

        {job.tags && job.tags.length > 0 && (
          <View style={styles.section}>
            <View style={styles.tagsContainer}>
              {job.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="description" size={20} color="#374151" />
            <Text style={styles.sectionTitle}>Job Description</Text>
          </View>
          <Text style={styles.description}>{job.description}</Text>
        </View>

        {job.skillsRequired.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="code" size={20} color="#374151" />
              <Text style={styles.sectionTitle}>Required Skills</Text>
            </View>
            <View style={styles.skillsContainer}>
              {job.skillsRequired.map((skill, index) => (
                <View key={index} style={styles.skillBadge}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {job.educationRequirements && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="school" size={20} color="#374151" />
              <Text style={styles.sectionTitle}>Education Requirements</Text>
            </View>
            <Text style={styles.description}>{job.educationRequirements}</Text>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="info-outline" size={20} color="#374151" />
            <Text style={styles.sectionTitle}>Job Information</Text>
          </View>
          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <Icon name="business-center" size={24} color="#6B7280" />
              <Text style={styles.infoCardLabel}>Job Type</Text>
              <Text style={styles.infoCardValue}>{job.jobType}</Text>
            </View>
            <View style={styles.infoCard}>
              <Icon name="people" size={24} color="#6B7280" />
              <Text style={styles.infoCardLabel}>Openings</Text>
              <Text style={styles.infoCardValue}>{job.numberOfOpenings || 1}</Text>
            </View>
            <View style={styles.infoCard}>
              <Icon name="event" size={24} color="#6B7280" />
              <Text style={styles.infoCardLabel}>Apply By</Text>
              <Text style={styles.infoCardValue}>{new Date(job.lastDateOfApplication).toLocaleDateString()}</Text>
            </View>
            {job.viewCount !== undefined && (
              <View style={styles.infoCard}>
                <Icon name="visibility" size={24} color="#6B7280" />
                <Text style={styles.infoCardLabel}>Views</Text>
                <Text style={styles.infoCardValue}>{job.viewCount}</Text>
              </View>
            )}
          </View>
        </View>

        {job.benefits.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="card-giftcard" size={20} color="#374151" />
              <Text style={styles.sectionTitle}>Benefits & Perks</Text>
            </View>
            {job.benefits.map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <Icon name="check-circle" size={18} color="#059669" />
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>
        )}

        {job.interviewStages && job.interviewStages.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="assignment" size={20} color="#374151" />
              <Text style={styles.sectionTitle}>Interview Process</Text>
            </View>
            {job.interviewStages.map((stage, index) => (
              <View key={stage._id} style={styles.stageItem}>
                <View style={styles.stageNumber}>
                  <Text style={styles.stageNumberText}>{stage.stageOrder}</Text>
                </View>
                <View style={styles.stageInfo}>
                  <Text style={styles.stageName}>{stage.stageName}</Text>
                  <Text style={styles.stageType}>{stage.interviewType}</Text>
                </View>
                {index < job.interviewStages!.length - 1 && <View style={styles.stageLine} />}
              </View>
            ))}
          </View>
        )}

        {job.offlineInstructions && job.offlineInstructions.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="info" size={20} color="#374151" />
              <Text style={styles.sectionTitle}>Additional Instructions</Text>
            </View>
            {job.offlineInstructions.map((instruction, index) => (
              <View key={index} style={styles.benefitItem}>
                <Icon name="arrow-right" size={18} color="#6B7280" />
                <Text style={styles.benefitText}>{instruction}</Text>
              </View>
            ))}
          </View>
        )}

        {job.postedBy.company && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="business" size={20} color="#374151" />
              <Text style={styles.sectionTitle}>About Company</Text>
            </View>
            {job.postedBy.company.about && (
              <Text style={styles.description}>{job.postedBy.company.about}</Text>
            )}
            <View style={styles.companyDetails}>
              {job.postedBy.company.industry && (
                <View style={styles.companyDetailRow}>
                  <Text style={styles.companyDetailLabel}>Industry:</Text>
                  <Text style={styles.companyDetailValue}>{job.postedBy.company.industry}</Text>
                </View>
              )}
              {job.postedBy.company.type && (
                <View style={styles.companyDetailRow}>
                  <Text style={styles.companyDetailLabel}>Company Type:</Text>
                  <Text style={styles.companyDetailValue}>{job.postedBy.company.type}</Text>
                </View>
              )}
              {job.postedBy.company.size && (
                <View style={styles.companyDetailRow}>
                  <Text style={styles.companyDetailLabel}>Company Size:</Text>
                  <Text style={styles.companyDetailValue}>{job.postedBy.company.size} employees</Text>
                </View>
              )}
              {job.postedBy.company.location && (
                <View style={styles.companyDetailRow}>
                  <Text style={styles.companyDetailLabel}>Location:</Text>
                  <Text style={styles.companyDetailValue}>{job.postedBy.company.location}</Text>
                </View>
              )}
            </View>
          </View>
        )}
        
        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: 16 + insets.bottom }]}>
        {job.hasApplied ? (
          <View style={styles.appliedContainer}>
            <Icon name="check-circle" size={24} color="#059669" />
            <Text style={styles.appliedText}>Application Submitted</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.applyButton} onPress={handleApply} disabled={applying}>
            {applying ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Icon name="send" size={20} color="#FFFFFF" />
                <Text style={styles.applyButtonText}>Apply Now</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#FFFFFF' },
  errorText: { fontSize: 16, color: '#6B7280', marginBottom: 16 },
  backButton: { backgroundColor: '#1F2937', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  backButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#1F2937' },
  shareBtn: { padding: 8 },
  content: { flex: 1 },
  jobHeader: { backgroundColor: '#FFFFFF', padding: 20, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  companyLogoImage: { width: 80, height: 80, borderRadius: 12, marginBottom: 16 },
  companyLogo: { width: 80, height: 80, borderRadius: 12, backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  logoText: { fontSize: 32, fontWeight: '700', color: '#6B7280' },
  jobTitle: { fontSize: 20, fontWeight: '700', color: '#1F2937', textAlign: 'center', marginBottom: 8 },
  companyName: { fontSize: 16, color: '#6B7280', marginBottom: 4 },
  websiteLink: { fontSize: 14, color: '#2563EB', textDecorationLine: 'underline', marginBottom: 12 },
  quickInfo: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 12 },
  infoChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, gap: 4 },
  infoChipText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  verificationBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#D1FAE5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, gap: 4, marginTop: 12 },
  verificationText: { fontSize: 13, color: '#059669', fontWeight: '600' },
  salaryCard: { backgroundColor: '#F9FAFB', padding: 16, borderRadius: 12, marginTop: 16, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  salaryLabel: { fontSize: 13, color: '#6B7280', marginBottom: 4 },
  salary: { fontSize: 20, fontWeight: '700', color: '#1F2937' },
  section: { backgroundColor: '#FFFFFF', padding: 20, marginTop: 8 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  description: { fontSize: 14, color: '#4B5563', lineHeight: 22 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { backgroundColor: '#F3F4F6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: '#D1D5DB' },
  tagText: { fontSize: 12, color: '#374151', fontWeight: '500' },
  skillsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  skillBadge: { backgroundColor: '#F3F4F6', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#D1D5DB' },
  skillText: { fontSize: 13, color: '#1F2937', fontWeight: '500' },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  infoCard: { flex: 1, minWidth: '45%', backgroundColor: '#F9FAFB', padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  infoCardLabel: { fontSize: 12, color: '#6B7280', marginTop: 8 },
  infoCardValue: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginTop: 4 },
  benefitItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 12 },
  benefitText: { flex: 1, fontSize: 14, color: '#4B5563', lineHeight: 20 },
  stageItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, position: 'relative' },
  stageNumber: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  stageNumberText: { fontSize: 14, fontWeight: '600', color: '#374151' },
  stageInfo: { flex: 1 },
  stageName: { fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 2 },
  stageType: { fontSize: 12, color: '#6B7280' },
  stageLine: { position: 'absolute', left: 15, top: 32, width: 2, height: 16, backgroundColor: '#E5E7EB' },
  companyDetails: { marginTop: 16, gap: 12 },
  companyDetailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  companyDetailLabel: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  companyDetailValue: { fontSize: 14, color: '#1F2937', fontWeight: '600' },
  footer: { backgroundColor: '#FFFFFF', padding: 16, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  appliedContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12 },
  appliedText: { fontSize: 16, fontWeight: '600', color: '#059669' },
  applyButton: { backgroundColor: '#1F2937', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12 },
  applyButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
});