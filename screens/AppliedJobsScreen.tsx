import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LottieView from 'lottie-react-native';
import Axios from '../libs/Axios';

interface Application {
  _id: string;
  jobId: {
    _id: string;
    role: string;
    location: string;
    salaryRange: string;
    jobType: string;
  };
  status: string;
  progress: string;
  interviewCount: number;
  createdAt: string;
}

interface ApplicationStats {
  totalApplications: number;
  applied: number;
  inReview: number;
  interviewed: number;
  offered: number;
  hired: number;
  rejected: number;
  withdrawn: number;
}

interface AppliedJobsScreenProps {
  onJobSelect: (jobId: string) => void;
  onApplicationSelect: (applicationId: string) => void;
}

export default function AppliedJobsScreen({ onJobSelect, onApplicationSelect }: AppliedJobsScreenProps) {
  const insets = useSafeAreaInsets();
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<ApplicationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [appsResponse, statsResponse] = await Promise.all([
        Axios.get('/user/applications?page=1&limit=50'),
        Axios.get('/user/applications/stats')
      ]);
      

      setApplications(appsResponse.data.data.applications || []);
      setStats(statsResponse.data.data || null);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setApplications([]);
      setStats(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const getProgressColor = (progress: string) => {
    if (!progress) return '#6B7280';
    const colors: Record<string, string> = {
      'APPLIED': '#DC2626',
      'UNDER_REVIEW': '#F59E0B',
      'INTERVIEW_SCHEDULED': '#DC2626',
      'INTERVIEW_COMPLETED': '#DC2626',
      'SELECTED': '#10B981',
      'REJECTED': '#EF4444',
      'WITHDRAWN': '#6B7280'
    };
    return colors[progress] || '#6B7280';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#DC2626" />
      </View>
    );
  }

  const statsCards = [
    { title: 'Total', value: stats?.totalApplications || 0, color: '#DC2626', bgColor: '#FEF2F2' },
    { title: 'Review', value: stats?.inReview || 0, color: '#F59E0B', bgColor: '#FEF3C7' },
    { title: 'Interview', value: stats?.interviewed || 0, color: '#8B5CF6', bgColor: '#F3E8FF' },
    { title: 'Offered', value: stats?.offered || 0, color: '#10B981', bgColor: '#D1FAE5' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Applications</Text>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.statsContainer}>
          {statsCards.map((stat, index) => (
            <View key={index} style={[styles.statCard, { backgroundColor: stat.bgColor }]}>
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.title}</Text>
            </View>
          ))}
        </View>

        {applications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <LottieView
              source={require('../assets/lottie/empty.lottie')}
              autoPlay
              loop
              style={styles.lottieAnimation}
            />
            <Text style={styles.emptyTitle}>No Applications Yet</Text>
            <Text style={styles.emptyText}>Start applying to jobs and track your progress here</Text>
          </View>
        ) : (
          <View style={styles.applicationsContainer}>
            {applications.map((application) => (
              <TouchableOpacity
                key={application._id}
                style={styles.applicationCard}
                onPress={() => onApplicationSelect(application._id)}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.jobRole} numberOfLines={2}>
                    {application.jobId?.role || 'Job Role'}
                  </Text>
                  <View style={[styles.progressBadge, { backgroundColor: getProgressColor(application.progress) + '20' }]}>
                    <Text style={[styles.progressText, { color: getProgressColor(application.progress) }]}>
                      {application.progress ? application.progress.replace(/_/g, ' ') : 'N/A'}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardDetails}>
                  <View style={styles.detailRow}>
                    <Icon name="location-on" size={16} color="#6B7280" />
                    <Text style={styles.detailText}>{application.jobId?.location || 'N/A'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Icon name="currency-rupee" size={16} color="#6B7280" />
                    <Text style={styles.detailText}>{application.jobId?.salaryRange || 'N/A'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Icon name="work-outline" size={16} color="#6B7280" />
                    <Text style={styles.detailText}>{application.jobId?.jobType || 'N/A'}</Text>
                  </View>
                </View>

                <View style={styles.cardFooter}>
                  <View style={styles.dateContainer}>
                    <Icon name="calendar-today" size={14} color="#9CA3AF" />
                    <Text style={styles.dateText}>Applied {formatDate(application.createdAt)}</Text>
                  </View>
                  {application.interviewCount > 0 && (
                    <View style={styles.interviewBadge}>
                      <Icon name="event" size={14} color="#6366F1" />
                      <Text style={styles.interviewText}>
                        {application.interviewCount} Interview{application.interviewCount > 1 ? 's' : ''}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{application.status}</Text>
                </View>
              </TouchableOpacity>
            ))}
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
  header: { backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#DC2626' },
  content: { flex: 1 },
  statsContainer: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12, gap: 8 },
  statCard: { flex: 1, paddingVertical: 14, paddingHorizontal: 8, borderRadius: 12, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: 'bold', marginBottom: 2 },
  statLabel: { fontSize: 9, color: '#6B7280', fontWeight: '600' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60, paddingHorizontal: 20 },
  lottieAnimation: { width: 200, height: 200, marginBottom: -20 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#1F2937', marginTop: 16, marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#6B7280' },
  applicationsContainer: { padding: 16, gap: 12 },
  applicationCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  cardHeader: { marginBottom: 12 },
  jobRole: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 8 },
  progressBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  progressText: { fontSize: 11, fontWeight: '600' },
  cardDetails: { gap: 8, marginBottom: 12 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { fontSize: 13, color: '#4B5563' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  dateContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dateText: { fontSize: 12, color: '#9CA3AF' },
  interviewBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FEF2F2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  interviewText: { fontSize: 11, color: '#DC2626', fontWeight: '500' },
  statusBadge: { position: 'absolute', top: 16, right: 16, backgroundColor: '#FEF2F2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 10, color: '#374151', fontWeight: '600' },
});
