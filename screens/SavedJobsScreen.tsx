import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LottieView from 'lottie-react-native';
import Axios from '../libs/Axios';

interface Job {
  _id: string;
  role: string;
  title: string;
  location: string;
  salaryRange: string;
  jobType: string;
  experienceLevel: string;
  skillsRequired: string[];
  workerMode: string;
  postedBy: {
    company: {
      name: string;
      logo: string;
    };
  };
  createdAt: string;
}

interface SavedJobsScreenProps {
  onJobSelect: (jobId: string) => void;
}

export default function SavedJobsScreen({ onJobSelect }: SavedJobsScreenProps) {
  const insets = useSafeAreaInsets();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      const response = await Axios.get('/user/bookmarks');
      setJobs(response.data.jobs || []);
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchSavedJobs();
  };

  const formatSalary = (salary: string) => {
    const parts = salary.split('-');
    if (parts.length === 2) {
      const min = Number.parseInt(parts[0]);
      const max = Number.parseInt(parts[1]);
      const formatNum = (num: number) => {
        if (num >= 10000000) return `${(num / 10000000).toFixed(1)}Cr`;
        if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
        if (num >= 1000) return `${(num / 1000).toFixed(0)}k`;
        return num.toString();
      };
      return `₹${formatNum(min)} - ${formatNum(max)}`;
    }
    return `₹${salary}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1F2937" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saved Jobs</Text>
        <Text style={styles.headerSubtitle}>{jobs.length} jobs</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[jobs.length === 0 ? styles.emptyScrollContent : { paddingBottom: insets.bottom }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {jobs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <LottieView
              source={require('../assets/lottie/empty.lottie')}
              autoPlay
              loop
              style={styles.lottieAnimation}
            />
            <Text style={styles.emptyTitle}>No Saved Jobs</Text>
            <Text style={styles.emptyText}>Jobs you bookmark will appear here</Text>
          </View>
        ) : (
          <View style={styles.jobsContainer}>
            {jobs.map((job) => (
              <TouchableOpacity
                key={job._id}
                style={styles.jobCard}
                onPress={() => onJobSelect(job._id)}
              >
                <View style={styles.jobHeader}>
                  {job.postedBy.company?.logo ? (
                    <Image source={{ uri: job.postedBy.company.logo }} style={styles.companyLogoImage} />
                  ) : (
                    <View style={styles.companyLogo}>
                      <Text style={styles.logoText}>{job.postedBy.company?.name?.charAt(0) || 'C'}</Text>
                    </View>
                  )}
                  <View style={styles.jobInfo}>
                    <Text style={styles.jobTitle} numberOfLines={1}>{job.role || job.title}</Text>
                    <Text style={styles.companyName}>{job.postedBy.company?.name}</Text>
                    <View style={styles.metaRow}>
                      <View style={styles.metaItem}>
                        <Icon name="work-outline" size={12} color="#6B7280" />
                        <Text style={styles.metaText}>{job.experienceLevel}y</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Icon name="location-on" size={12} color="#6B7280" />
                        <Text style={styles.metaText}>{job.location}</Text>
                      </View>
                    </View>
                  </View>
                  <Icon name="bookmark" size={20} color="#DC2626" />
                </View>

                <View style={styles.tagsContainer}>
                  {job.skillsRequired.slice(0, 3).map((skill, idx) => (
                    <View key={idx} style={styles.tag}>
                      <Text style={styles.tagText}>{skill}</Text>
                    </View>
                  ))}
                  {job.skillsRequired.length > 3 && (
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>+{job.skillsRequired.length - 3}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.jobFooter}>
                  <Text style={styles.salary}>{formatSalary(job.salaryRange)}</Text>
                  <View style={styles.jobTypeChip}>
                    <Text style={styles.jobTypeText}>{job.workerMode}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1F2937' },
  headerSubtitle: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  content: { flex: 1 },
  emptyScrollContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
  lottieAnimation: { width: 200, height: 200 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginTop: -10, marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#6B7280' },
  jobsContainer: { padding: 16, gap: 12 },
  jobCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  jobHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  companyLogo: { width: 48, height: 48, borderRadius: 8, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  companyLogoImage: { width: 48, height: 48, borderRadius: 8, marginRight: 12, backgroundColor: '#F3F4F6' },
  logoText: { fontSize: 18, fontWeight: 'bold', color: '#6B7280' },
  jobInfo: { flex: 1 },
  jobTitle: { fontSize: 15, fontWeight: 'bold', color: '#1F2937', marginBottom: 4 },
  companyName: { fontSize: 13, color: '#6B7280', marginBottom: 6 },
  metaRow: { flexDirection: 'row', gap: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11, color: '#6B7280' },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  tag: { backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  tagText: { fontSize: 11, color: '#4B5563', fontWeight: '500' },
  jobFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  salary: { fontSize: 16, fontWeight: 'bold', color: '#DC2626' },
  jobTypeChip: { backgroundColor: '#DBEAFE', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  jobTypeText: { fontSize: 10, color: '#1E40AF', fontWeight: '600' },
});
