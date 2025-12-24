import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Axios from '../../libs/Axios';

interface ZiftStats {
  solvedProblems: number;
  totalProblems: number;
  totalDesigns: number;
}

interface UserStats {
  totalProblemsAttempted: number;
  totalProblemsCorrect: number;
  totalProblemsWrong: number;
  totalCompetitionsJoined: number;
  totalCompetitionProblemsAttempted: number;
  totalCompetitionProblemsCorrect: number;
  totalCompetitionProblemsWrong: number;
  frameworkStats: FrameworkStat[];
  recentSolutions: RecentSolution[];
}

interface FrameworkStat {
  framework: string;
  totalAttempts: number;
  correctSolutions: number;
  wrongSolutions: number;
  averageScore: number;
  lastUsed: string;
}

interface RecentSolution {
  problemId: { name: string; difficulty: string };
  competitionId?: { title: string };
  framework: string;
  score: number;
  isCorrect: boolean;
  timeTaken: number;
  solvedAt: string;
}

interface ZiftDifficultyStats {
  name: string;
  value: number;
  color: string;
}

export default function AnalyticsScreen({ onBack }: { onBack: () => void }) {
  const [loading, setLoading] = useState(true);
  const [ziftStats, setZiftStats] = useState<ZiftStats | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [difficultyStats, setDifficultyStats] = useState<ZiftDifficultyStats[]>([]);

  useEffect(() => {
    fetchAllAnalytics();
  }, []);

  const fetchAllAnalytics = async () => {
    try {
      const [dashboardRes, statsRes, difficultyRes] = await Promise.all([
        Axios.get('/user/dashboard-stats'),
        Axios.get('/user/stats'),
        Axios.get('/user/difficulty-stats')
      ]);

      if (dashboardRes?.data?.success && dashboardRes?.data?.data?.userStats) {
        setZiftStats(dashboardRes.data.data.userStats);
      }

      if (statsRes?.data?.success && statsRes?.data?.stats) {
        setUserStats(statsRes.data.stats);
      }

      if (difficultyRes?.data?.success && difficultyRes?.data?.data?.difficultyStats) {
        setDifficultyStats(difficultyRes.data.data.difficultyStats);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1F2937" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Icon name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Icon name="bar-chart" size={32} color="#1F2937" />
        <Text style={styles.headerTitle}>Analytics</Text>
      </View>

      {/* Zift Stats with Circular Progress */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Zift Progress</Text>
        <View style={styles.circularProgressContainer}>
          <View style={styles.circularCard}>
            <View style={styles.circularProgress}>
              <View style={[styles.circularProgressBar, { 
                transform: [{ rotate: `${((ziftStats?.solvedProblems || 0) / (ziftStats?.totalProblems || 1)) * 360}deg` }],
                borderColor: '#EF4444'
              }]} />
              <View style={styles.circularInner}>
                <Text style={styles.circularValue}>{ziftStats?.solvedProblems || 0}</Text>
                <Text style={styles.circularTotal}>/ {ziftStats?.totalProblems || 0}</Text>
              </View>
            </View>
            <Text style={styles.circularLabel}>Problems Solved</Text>
          </View>
          
          <View style={styles.circularCard}>
            <View style={styles.componentIconContainer}>
              <Icon name="design-services" size={48} color="#A855F7" />
              <Text style={styles.componentValue}>{ziftStats?.totalDesigns || 0}</Text>
            </View>
            <Text style={styles.circularLabel}>Components</Text>
          </View>
        </View>
      </View>

      {/* User Stats with Progress Bars */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performance Overview</Text>
        <View style={styles.progressBarCard}>
          <View style={styles.progressItem}>
            <View style={styles.progressHeader}>
              <View style={styles.progressLabelContainer}>
                <Icon name="code" size={20} color="#3B82F6" />
                <Text style={styles.progressLabel}>Attempted</Text>
              </View>
              <Text style={styles.progressValue}>{userStats?.totalProblemsAttempted || 0}</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${Math.min(((userStats?.totalProblemsAttempted || 0) / 100) * 100, 100)}%`, backgroundColor: '#3B82F6' }]} />
            </View>
          </View>

          <View style={styles.progressItem}>
            <View style={styles.progressHeader}>
              <View style={styles.progressLabelContainer}>
                <Icon name="check-circle" size={20} color="#10B981" />
                <Text style={styles.progressLabel}>Correct</Text>
              </View>
              <Text style={styles.progressValue}>{userStats?.totalProblemsCorrect || 0}</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${((userStats?.totalProblemsCorrect || 0) / (userStats?.totalProblemsAttempted || 1)) * 100}%`, backgroundColor: '#10B981' }]} />
            </View>
          </View>

          <View style={styles.progressItem}>
            <View style={styles.progressHeader}>
              <View style={styles.progressLabelContainer}>
                <Icon name="cancel" size={20} color="#EF4444" />
                <Text style={styles.progressLabel}>Wrong</Text>
              </View>
              <Text style={styles.progressValue}>{userStats?.totalProblemsWrong || 0}</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${((userStats?.totalProblemsWrong || 0) / (userStats?.totalProblemsAttempted || 1)) * 100}%`, backgroundColor: '#EF4444' }]} />
            </View>
          </View>

          <View style={styles.progressItem}>
            <View style={styles.progressHeader}>
              <View style={styles.progressLabelContainer}>
                <Icon name="emoji-events" size={20} color="#F59E0B" />
                <Text style={styles.progressLabel}>Competitions</Text>
              </View>
              <Text style={styles.progressValue}>{userStats?.totalCompetitionsJoined || 0}</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${Math.min(((userStats?.totalCompetitionsJoined || 0) / 20) * 100, 100)}%`, backgroundColor: '#F59E0B' }]} />
            </View>
          </View>
        </View>
      </View>

      {/* Difficulty Stats with Bar Chart */}
      {difficultyStats && difficultyStats?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Difficulty Distribution</Text>
          <View style={styles.barChartContainer}>
            {difficultyStats.filter(item => item && item.name).map((item, index) => {
              const maxValue = Math.max(...difficultyStats.map(d => d?.value || 0));
              const heightPercent = ((item?.value || 0) / maxValue) * 100;
              return (
                <View key={index} style={styles.barChartItem}>
                  <View style={styles.barContainer}>
                    <View style={[styles.bar, { height: `${heightPercent}%`, backgroundColor: item?.color || '#6B7280' }]}>
                      <Text style={styles.barValue}>{item?.value || 0}</Text>
                    </View>
                  </View>
                  <Text style={styles.barLabel}>{item?.name || 'Unknown'}</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Competition Stats */}
      {userStats && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Competition Performance</Text>
          <View style={styles.competitionCard}>
            <View style={styles.competitionRow}>
              <Text style={styles.competitionLabel}>Problems Attempted</Text>
              <Text style={styles.competitionValue}>{userStats?.totalCompetitionProblemsAttempted || 0}</Text>
            </View>
            <View style={styles.competitionRow}>
              <Text style={styles.competitionLabel}>Correct</Text>
              <Text style={[styles.competitionValue, { color: '#10B981' }]}>{userStats?.totalCompetitionProblemsCorrect || 0}</Text>
            </View>
            <View style={styles.competitionRow}>
              <Text style={styles.competitionLabel}>Wrong</Text>
              <Text style={[styles.competitionValue, { color: '#EF4444' }]}>{userStats?.totalCompetitionProblemsWrong || 0}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Framework Performance with Visual Bars */}
      {userStats?.frameworkStats && userStats?.frameworkStats?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Framework Performance</Text>
          {userStats.frameworkStats.filter(framework => framework && framework.framework).map((framework, index) => {
            const successRate = Math.round(((framework?.correctSolutions || 0) / (framework?.totalAttempts || 1)) * 100) || 0;
            return (
              <View key={index} style={styles.frameworkCard}>
                <View style={styles.frameworkHeader}>
                  <Text style={styles.frameworkName}>{framework?.framework || 'Unknown'}</Text>
                  <Text style={[styles.frameworkSuccess, { color: successRate >= 70 ? '#10B981' : successRate >= 40 ? '#F59E0B' : '#EF4444' }]}>
                    {successRate}%
                  </Text>
                </View>
                <View style={styles.successBarBg}>
                  <View style={[styles.successBarFill, { width: `${successRate}%`, backgroundColor: successRate >= 70 ? '#10B981' : successRate >= 40 ? '#F59E0B' : '#EF4444' }]} />
                </View>
                <View style={styles.frameworkStats}>
                  <View style={styles.frameworkStat}>
                    <Text style={styles.frameworkStatLabel}>Attempts</Text>
                    <Text style={styles.frameworkStatValue}>{framework?.totalAttempts || 0}</Text>
                  </View>
                  <View style={styles.frameworkStat}>
                    <Text style={styles.frameworkStatLabel}>Correct</Text>
                    <Text style={[styles.frameworkStatValue, { color: '#10B981' }]}>{framework?.correctSolutions || 0}</Text>
                  </View>
                  <View style={styles.frameworkStat}>
                    <Text style={styles.frameworkStatLabel}>Wrong</Text>
                    <Text style={[styles.frameworkStatValue, { color: '#EF4444' }]}>{framework?.wrongSolutions || 0}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Recent Solutions */}
      {userStats?.recentSolutions && userStats?.recentSolutions?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Solutions</Text>
          {userStats.recentSolutions.filter(solution => solution && solution.problemId && solution.problemId.name).slice(0, 5).map((solution, index) => (
            <View key={index} style={styles.solutionCard}>
              <View style={styles.solutionHeader}>
                <Text style={styles.solutionName}>{solution?.problemId?.name || 'Unknown'}</Text>
                <View style={[styles.solutionBadge, { backgroundColor: solution?.isCorrect ? '#D1FAE5' : '#FEE2E2' }]}>
                  <Text style={[styles.solutionBadgeText, { color: solution?.isCorrect ? '#059669' : '#DC2626' }]}>
                    {solution?.isCorrect ? 'Correct' : 'Wrong'}
                  </Text>
                </View>
              </View>
              <View style={styles.solutionDetails}>
                <Text style={styles.solutionDetail}>Framework: {solution?.framework || 'N/A'}</Text>
                <Text style={styles.solutionDetail}>Time: {Math.round((solution?.timeTaken || 0) / 1000)}s</Text>
                <Text style={styles.solutionDetail}>
                  {solution?.solvedAt ? new Date(solution.solvedAt).toLocaleDateString() : 'N/A'}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 20, paddingTop: 50, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#1F2937' },
  section: { padding: 16, backgroundColor: '#FFFFFF', marginTop: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1F2937', marginBottom: 16 },
  circularProgressContainer: { flexDirection: 'row', gap: 16, justifyContent: 'space-around' },
  circularCard: { alignItems: 'center', flex: 1 },
  circularProgress: { width: 120, height: 120, borderRadius: 60, borderWidth: 10, borderColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  circularProgressBar: { position: 'absolute', width: 120, height: 120, borderRadius: 60, borderWidth: 10, borderTopColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: 'transparent' },
  circularInner: { alignItems: 'center' },
  circularValue: { fontSize: 24, fontWeight: '700', color: '#1F2937' },
  circularTotal: { fontSize: 14, color: '#6B7280' },
  circularLabel: { fontSize: 12, color: '#6B7280', marginTop: 8, textAlign: 'center' },
  componentIconContainer: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#F3E8FF', justifyContent: 'center', alignItems: 'center' },
  componentValue: { fontSize: 24, fontWeight: '700', color: '#A855F7', marginTop: 4 },
  progressBarCard: { gap: 16 },
  progressItem: { gap: 8 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressLabelContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressLabel: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
  progressValue: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  progressBarBg: { height: 12, backgroundColor: '#F3F4F6', borderRadius: 6, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 6 },
  barChartContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 200, paddingTop: 20 },
  barChartItem: { flex: 1, alignItems: 'center', gap: 8 },
  barContainer: { width: '80%', height: 150, justifyContent: 'flex-end' },
  bar: { width: '100%', borderTopLeftRadius: 8, borderTopRightRadius: 8, justifyContent: 'flex-start', alignItems: 'center', paddingTop: 8 },
  barValue: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  barLabel: { fontSize: 12, color: '#6B7280', textAlign: 'center' },
  frameworkCard: { backgroundColor: '#F9FAFB', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  frameworkHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  frameworkName: { fontSize: 16, fontWeight: '600', color: '#1F2937', textTransform: 'capitalize' },
  frameworkSuccess: { fontSize: 16, fontWeight: '700' },
  successBarBg: { height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, overflow: 'hidden', marginBottom: 12 },
  successBarFill: { height: '100%', borderRadius: 4 },
  frameworkStats: { flexDirection: 'row', justifyContent: 'space-around' },
  frameworkStat: { alignItems: 'center' },
  frameworkStatLabel: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  frameworkStatValue: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  competitionCard: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', gap: 12 },
  competitionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  competitionLabel: { fontSize: 14, color: '#6B7280' },
  competitionValue: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  solutionCard: { backgroundColor: '#F9FAFB', padding: 12, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  solutionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  solutionName: { fontSize: 14, fontWeight: '600', color: '#1F2937', flex: 1 },
  solutionBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  solutionBadgeText: { fontSize: 10, fontWeight: '600' },
  solutionDetails: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  solutionDetail: { fontSize: 12, color: '#6B7280' },
});
