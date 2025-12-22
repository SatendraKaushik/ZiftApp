import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Axios from '../libs/Axios';

interface Job {
  _id: string;
  title: string;
  description: string;
  location: string;
  salaryRange: string;
  jobType: string;
  experienceLevel: string;
  skillsRequired: string[];
  workerMode: string;
  numberOfOpenings: number;
  benefits: string[];
  lastDateOfApplication: string;
  postedBy: {
    name: string;
    company?: {
      name: string;
      website?: string;
      logo?: string;
      about?: string;
    };
  };
  createdAt: string;
  interviewStages?: Array<{
    _id: string;
    stageName: string;
    stageOrder: number;
    interviewType: string;
  }>;
  hasApplied: boolean;
}

interface JobDetailScreenProps {
  jobId: string;
  onBack: () => void;
}

export default function JobDetailScreen({ jobId, onBack }: JobDetailScreenProps) {
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
      alert(error.response?.data?.message || 'Failed to apply');
    } finally {
      setApplying(false);
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
        <TouchableOpacity style={styles.shareBtn}>
          <Icon name="share" size={22} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.jobHeader}>
          <View style={styles.companyLogo}>
            <Text style={styles.logoText}>{job.postedBy.company?.name?.charAt(0) || 'C'}</Text>
          </View>
          <Text style={styles.jobTitle}>{job.title}</Text>
          <Text style={styles.companyName}>{job.postedBy.company?.name || job.postedBy.name}</Text>
          
          <View style={styles.quickInfo}>
            <View style={styles.infoChip}>
              <Icon name="location-on" size={14} color="#DC2626" />
              <Text style={styles.infoChipText}>{job.location}</Text>
            </View>
            <View style={styles.infoChip}>
              <Icon name="work-outline" size={14} color="#DC2626" />
              <Text style={styles.infoChipText}>{job.experienceLevel}y</Text>
            </View>
            <View style={styles.infoChip}>
              <Icon name="schedule" size={14} color="#DC2626" />
              <Text style={styles.infoChipText}>{job.workerMode}</Text>
            </View>
          </View>
          
          <View style={styles.salaryCard}>
            <Text style={styles.salaryLabel}>Salary Range</Text>
            <Text style={styles.salary}>₹{job.salaryRange}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="description" size={20} color="#DC2626" />
            <Text style={styles.sectionTitle}>Job Description</Text>
          </View>
          <Text style={styles.description}>{job.description}</Text>
        </View>

        {job.skillsRequired.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="code" size={20} color="#DC2626" />
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

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="info-outline" size={20} color="#DC2626" />
            <Text style={styles.sectionTitle}>Job Information</Text>
          </View>
          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <Icon name="business-center" size={24} color="#DC2626" />
              <Text style={styles.infoCardLabel}>Job Type</Text>
              <Text style={styles.infoCardValue}>{job.jobType}</Text>
            </View>
            <View style={styles.infoCard}>
              <Icon name="people" size={24} color="#DC2626" />
              <Text style={styles.infoCardLabel}>Openings</Text>
              <Text style={styles.infoCardValue}>{job.numberOfOpenings || 1}</Text>
            </View>
          </View>
        </View>

        {job.benefits.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="card-giftcard" size={20} color="#DC2626" />
              <Text style={styles.sectionTitle}>Benefits & Perks</Text>
            </View>
            {job.benefits.map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <Icon name="check-circle" size={18} color="#10B981" />
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>
        )}

        {job.interviewStages && job.interviewStages.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="assignment" size={20} color="#DC2626" />
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

        {job.postedBy.company?.about && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="business" size={20} color="#DC2626" />
              <Text style={styles.sectionTitle}>About Company</Text>
            </View>
            <Text style={styles.description}>{job.postedBy.company.about}</Text>
          </View>
        )}
        
        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
        {job.hasApplied ? (
          <View style={styles.appliedContainer}>
            <Icon name="check-circle" size={24} color="#10B981" />
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
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { fontSize: 16, color: '#DC2626', marginBottom: 20 },
  backButton: { backgroundColor: '#DC2626', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  backButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  header: { backgroundColor: '#FFFFFF', paddingTop: 50, paddingHorizontal: 20, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 3 },
  backBtn: { padding: 4 },
  shareBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  content: { flex: 1 },
  jobHeader: { backgroundColor: '#FFFFFF', padding: 24, alignItems: 'center', marginBottom: 12 },
  companyLogo: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 2, borderColor: '#DC2626' },
  logoText: { fontSize: 32, fontWeight: 'bold', color: '#DC2626' },
  jobTitle: { fontSize: 22, fontWeight: 'bold', color: '#1F2937', textAlign: 'center', marginBottom: 8 },
  companyName: { fontSize: 16, color: '#6B7280', marginBottom: 16 },
  quickInfo: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16, justifyContent: 'center' },
  infoChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FEF2F2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  infoChipText: { fontSize: 12, color: '#DC2626', fontWeight: '600' },
  salaryCard: { backgroundColor: '#FEF2F2', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#FEE2E2' },
  salaryLabel: { fontSize: 12, color: '#6B7280', marginBottom: 4, textAlign: 'center' },
  salary: { fontSize: 20, fontWeight: 'bold', color: '#DC2626', textAlign: 'center' },
  section: { backgroundColor: '#FFFFFF', padding: 20, marginBottom: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', color: '#1F2937' },
  description: { fontSize: 14, color: '#6B7280', lineHeight: 22 },
  infoGrid: { flexDirection: 'row', gap: 12 },
  infoCard: { flex: 1, backgroundColor: '#F9FAFB', padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  infoCardLabel: { fontSize: 12, color: '#6B7280', marginTop: 8, marginBottom: 4 },
  infoCardValue: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' },
  skillsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  skillBadge: { backgroundColor: '#DBEAFE', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#BFDBFE' },
  skillText: { fontSize: 13, color: '#1E40AF', fontWeight: '600' },
  benefitItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
  benefitText: { flex: 1, fontSize: 14, color: '#374151', lineHeight: 20 },
  stageItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 16, position: 'relative' },
  stageNumber: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#DC2626', alignItems: 'center', justifyContent: 'center' },
  stageNumberText: { fontSize: 14, fontWeight: 'bold', color: '#FFFFFF' },
  stageInfo: { flex: 1 },
  stageName: { fontSize: 15, fontWeight: '600', color: '#1F2937', marginBottom: 4 },
  stageType: { fontSize: 13, color: '#6B7280' },
  stageLine: { position: 'absolute', left: 15, top: 32, width: 2, height: 16, backgroundColor: '#E5E7EB' },
  footer: { backgroundColor: '#FFFFFF', padding: 20, borderTopWidth: 1, borderTopColor: '#E5E7EB', shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 5 },
  appliedContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#ECFDF5', paddingVertical: 16, borderRadius: 12, borderWidth: 1, borderColor: '#10B981' },
  appliedText: { fontSize: 16, fontWeight: '600', color: '#10B981' },
  applyButton: { backgroundColor: '#DC2626', paddingVertical: 16, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, shadowColor: '#DC2626', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  applyButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});
 