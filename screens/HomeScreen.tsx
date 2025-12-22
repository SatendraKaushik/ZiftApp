import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  FlatList,
  ActivityIndicator,
  Image,
  Modal,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LottieView from 'lottie-react-native';
import Axios from '../libs/Axios';

interface Job {
  _id: string;
  title: string;
  bannerImage: string;
  description: string;
  location: string;
  salaryRange: string;
  jobType: string;
  experienceLevel: string;
  skillsRequired: string[];
  role: string;
  workerMode: string;
  numberOfOpenings: number;
  benefits: string[];
  lastDateOfApplication: string;
  postedBy: {
    name: string;
    email: string;
    company: {
      name: string;
      website: string;
      logo: string;
    };
  };
  createdAt: string;
  tags: string[];
}

interface HomeScreenProps {
  onJobSelect?: (jobId: string) => void;
}

export default function HomeScreen({ onJobSelect }: HomeScreenProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [userName, setUserName] = useState('User');
  const [userAvatar, setUserAvatar] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [filters, setFilters] = useState({
    keyword: '',
    page: 1,
    limit: 10,
    location: '',
    experienceLevel: '',
    workerMode: '',
  });
  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  const placeholderTexts = ['role', 'skills', 'company'];
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => {
        Animated.sequence([
          Animated.timing(slideAnim, {
            toValue: -20,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 20,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
        return (prev + 1) % placeholderTexts.length;
      });
    }, 2500);
    return () => clearInterval(interval);
  }, [slideAnim, placeholderTexts.length]);

  const loadUserData = async () => {
    try {
      const { TokenStorage } = await import('../libs/TokenStorage');
      const user = await TokenStorage.getUser();
      if (user?.name) {
        setUserName(user.name.split(' ')[0]);
      }
      if (user?.avatar) {
        setUserAvatar(user.avatar);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      let endpoint = '/user/jobs';

      if (debouncedFilters.keyword.trim()) {
        endpoint = '/user/jobs/search';
        Object.entries(debouncedFilters).forEach(([key, value]) => {
          if (value && value !== '0') params.append(key, value.toString());
        });
      } else if (debouncedFilters.location || debouncedFilters.experienceLevel || debouncedFilters.workerMode) {
        endpoint = '/user/jobs/filters';
        Object.entries(debouncedFilters).forEach(([key, value]) => {
          if (value) params.append(key, value.toString());
        });
      } else {
        params.append('page', debouncedFilters.page.toString());
        params.append('limit', debouncedFilters.limit.toString());
      }

      const response = await Axios.get(`${endpoint}?${params.toString()}`);
      setJobs(response.data.data.jobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 800);
    return () => clearTimeout(timer);
  }, [filters]);

  useEffect(() => {
    fetchJobs();
  }, [debouncedFilters]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
    const num = Number.parseInt(salary);
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(0)}k`;
    return `₹${salary}`;
  };

  const renderJobCard = ({ item }: { item: Job }) => (
    <TouchableOpacity style={styles.jobCard} onPress={() => onJobSelect?.(item._id)}>
      <View style={styles.jobHeader}>
        {item.postedBy.company?.logo ? (
          <Image source={{ uri: item.postedBy.company.logo }} style={styles.companyLogoImage} />
        ) : (
          <View style={styles.companyLogo}>
            <Text style={styles.logoText}>{item.postedBy.company?.name?.charAt(0) || 'C'}</Text>
          </View>
        )}
        <View style={styles.jobInfo}>
          <Text style={styles.jobTitle} numberOfLines={1}>{item.role || item.title}</Text>
          <Text style={styles.companyName}>{item.postedBy.company?.name}</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Icon name="work-outline" size={12} color="#6B7280" />
              <Text style={styles.metaText}>{item.experienceLevel}y</Text>
            </View>
            <View style={styles.metaItem}>
              <Icon name="location-on" size={12} color="#6B7280" />
              <Text style={styles.metaText}>{item.location}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.bookmarkButton}>
          <Icon name="bookmark-border" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.tagsContainer}>
        {item.skillsRequired.slice(0, 3).map((skill, idx) => (
          <View key={idx} style={styles.tag}>
            <Text style={styles.tagText}>{skill}</Text>
          </View>
        ))}
        {item.skillsRequired.length > 3 && (
          <View style={styles.tag}>
            <Text style={styles.tagText}>+{item.skillsRequired.length - 3}</Text>
          </View>
        )}
      </View>

      <View style={styles.jobFooter}>
        <View style={styles.salaryContainer}>
          <Text style={styles.salary}>{formatSalary(item.salaryRange)}</Text>
          <View style={styles.jobTypeChip}>
            <Text style={styles.jobTypeText}>{item.workerMode}</Text>
          </View>
        </View>
        <Text style={styles.posted}>{formatDate(item.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.brandContainer}>
            <Image source={require('../components/assests/zift/ziftlogo.png')} style={styles.brandLogo} />
            <Text style={styles.brandName}>TheZift</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            {userAvatar ? (
              <Image source={{ uri: userAvatar }} style={styles.profileImage} />
            ) : (
              <Icon name="person" size={24} color="#DC2626" />
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Icon name="search" size={20} color="#DC2626" />
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholderStatic}>Search by </Text>
              <Animated.Text style={[styles.placeholderAnimated, { transform: [{ translateY: slideAnim }] }]}>
                {placeholderTexts[placeholderIndex]}
              </Animated.Text>
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder=""
              value={filters.keyword}
              onChangeText={(text) => setFilters(prev => ({ ...prev, keyword: text, page: 1 }))}
              placeholderTextColor="#9CA3AF"
            />
            {filters.keyword.length > 0 && (
              <TouchableOpacity onPress={() => setFilters(prev => ({ ...prev, keyword: '', page: 1 }))}>
                <Icon name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity 
            style={[styles.filterButton, { zIndex: 999 }]} 
            activeOpacity={0.7}
            onPress={() => {
              console.log('Filter button pressed, current state:', showFilterModal);
              setShowFilterModal(!showFilterModal);
            }}
          >
            <Icon name="tune" size={22} color="#FFFFFF" />
            {(filters.location || filters.experienceLevel || filters.workerMode) && (
              <View style={styles.filterBadge} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={loading ? styles.scrollContent : undefined}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <LottieView
              source={require('../assets/lottie/loading.lottie')}
              autoPlay
              loop
              style={styles.loadingAnimation}
            />
          </View>
        ) : jobs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <LottieView
              source={require('../assets/lottie/empty.lottie')}
              autoPlay
              loop
              style={styles.lottieAnimation}
            />
            <Text style={styles.emptyTitle}>No Jobs Found</Text>
            <Text style={styles.emptyText}>We couldn't find any jobs at the moment. Check back later!</Text>
          </View>
        ) : (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Available Jobs</Text>
              <TouchableOpacity><Text style={styles.seeAll}>See All</Text></TouchableOpacity>
            </View>
            <FlatList data={jobs} renderItem={renderJobCard} keyExtractor={(item) => item._id} scrollEnabled={false} />
          </View>
        )}
      </ScrollView>

      <Modal visible={showFilterModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Icon name="close" size={24} color="#1F2937" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filterScroll}>
              <Text style={styles.filterLabel}>Location</Text>
              <TextInput
                style={styles.filterInput}
                placeholder="Enter location"
                value={filters.location}
                onChangeText={(text) => setFilters(prev => ({ ...prev, location: text, page: 1 }))}
                placeholderTextColor="#9CA3AF"
              />

              <Text style={styles.filterLabel}>Experience Level</Text>
              <TextInput
                style={styles.filterInput}
                placeholder="e.g., 0-2, 2-5"
                value={filters.experienceLevel}
                onChangeText={(text) => setFilters(prev => ({ ...prev, experienceLevel: text, page: 1 }))}
                placeholderTextColor="#9CA3AF"
              />

              <Text style={styles.filterLabel}>Work Mode</Text>
              <View style={styles.chipContainer}>
                {['Remote', 'Hybrid', 'On-site'].map((mode) => (
                  <TouchableOpacity
                    key={mode}
                    style={[styles.chip, filters.workerMode === mode && styles.chipActive]}
                    onPress={() => setFilters(prev => ({ ...prev, workerMode: prev.workerMode === mode ? '' : mode, page: 1 }))}
                  >
                    <Text style={[styles.chipText, filters.workerMode === mode && styles.chipTextActive]}>{mode}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setFilters({ keyword: '', page: 1, limit: 10, location: '', experienceLevel: '', workerMode: '' })}
              >
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyButton} onPress={() => setShowFilterModal(false)}>
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { backgroundColor: '#FFFFFF', paddingTop: 50, paddingHorizontal: 20, paddingBottom: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  brandContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandLogo: { width: 32, height: 32 },
  brandName: { fontSize: 20, fontWeight: 'bold', color: '#DC2626' },
  profileButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  profileImage: { width: 40, height: 40, borderRadius: 20 },
  searchContainer: { flexDirection: 'row', gap: 10, marginTop: 8 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 1, borderWidth: 1.5, borderColor: '#E5E7EB', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  placeholderContainer: { flexDirection: 'row', position: 'absolute', left: 44, pointerEvents: 'none', overflow: 'hidden', height: 20 },
  placeholderStatic: { fontSize: 14, color: '#9CA3AF', fontWeight: '500' },
  placeholderAnimated: { fontSize: 14, color: '#9CA3AF', fontWeight: '500' },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 14, color: '#1F2937', fontWeight: '500' },
  filterButton: { width: 48, height: 48, backgroundColor: '#DC2626', borderRadius: 12, alignItems: 'center', justifyContent: 'center', shadowColor: '#DC2626', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 },
  filterBadge: { position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FBBF24' },
  content: { flex: 1, paddingHorizontal: 20 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center' },
  loadingContainer: { justifyContent: 'center', alignItems: 'center' },
  loadingAnimation: { width: 100, height: 100 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 80 },
  lottieAnimation: { width: 200, height: 200 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginTop: -10, marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#6B7280', textAlign: 'center', paddingHorizontal: 40 },
  section: { marginVertical: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  seeAll: { fontSize: 14, color: '#DC2626', fontWeight: '500' },
  jobCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
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
  bookmarkButton: { padding: 4 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  tag: { backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  tagText: { fontSize: 11, color: '#4B5563', fontWeight: '500' },
  jobFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  salaryContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  salary: { fontSize: 16, fontWeight: 'bold', color: '#DC2626' },
  jobTypeChip: { backgroundColor: '#DBEAFE', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  jobTypeText: { fontSize: 10, color: '#1E40AF', fontWeight: '600' },
  posted: { fontSize: 11, color: '#9CA3AF' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937' },
  filterScroll: { padding: 20 },
  filterLabel: { fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 8, marginTop: 12 },
  filterInput: { backgroundColor: '#F3F4F6', borderRadius: 8, padding: 12, fontSize: 16, color: '#1F2937', marginBottom: 8 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
  chipActive: { backgroundColor: '#DC2626', borderColor: '#DC2626' },
  chipText: { fontSize: 14, color: '#6B7280' },
  chipTextActive: { color: '#FFFFFF', fontWeight: '600' },
  modalFooter: { flexDirection: 'row', padding: 20, gap: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  clearButton: { flex: 1, padding: 14, borderRadius: 8, backgroundColor: '#F3F4F6', alignItems: 'center' },
  clearButtonText: { fontSize: 16, fontWeight: '600', color: '#6B7280' },
  applyButton: { flex: 1, padding: 14, borderRadius: 8, backgroundColor: '#DC2626', alignItems: 'center' },
  applyButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
});