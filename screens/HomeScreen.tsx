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
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LottieView from 'lottie-react-native';
import Axios from '../libs/Axios';
import ShowcaseCarousel from '../components/ShowcaseCarousel';

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
  onNavigateToProfile?: () => void;
}

export default function HomeScreen({ onJobSelect, onNavigateToProfile }: HomeScreenProps) {
  const insets = useSafeAreaInsets();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [userName, setUserName] = useState('User');
  const [userAvatar, setUserAvatar] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [bookmarkedJobs, setBookmarkedJobs] = useState<Set<string>>(new Set());
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showExperienceDropdown, setShowExperienceDropdown] = useState(false);
  const [showWorkModeDropdown, setShowWorkModeDropdown] = useState(false);
  const [filterOptions, setFilterOptions] = useState<{
    locations: string[];
    experienceLevels: string[];
    workerModes: string[];
  }>({ locations: [], experienceLevels: [], workerModes: [] });
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
    fetchFilterOptions();
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
      console.log('Loaded user:', user);
      if (user?.name) {
        setUserName(user.name.split(' ')[0]);
      }
      if (user?.avatar && user.avatar.trim() !== '') {
        setUserAvatar(user.avatar);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const response = await Axios.get('/user/jobs/filter-options');
      if (response.data.data) {
        setFilterOptions(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
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
      
      // Check bookmark status for all jobs
      const jobIds = response.data.data.jobs.map((job: Job) => job._id);
      const bookmarkChecks = await Promise.all(
        jobIds.map((id: string) => Axios.get(`/user/bookmarks/status/${id}`).catch(() => ({ data: { isBookmarked: false } })))
      );
      const bookmarked = new Set(jobIds.filter((_: string, idx: number) => bookmarkChecks[idx]?.data?.isBookmarked));
      setBookmarkedJobs(bookmarked);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadUserData();
    fetchJobs();
  };

  const handleBookmark = async (jobId: string) => {
    try {
      const response = await Axios.post(`/user/bookmarks/toggle/${jobId}`);
      if (response.data.isBookmarked) {
        setBookmarkedJobs(prev => new Set([...prev, jobId]));
      } else {
        setBookmarkedJobs(prev => {
          const newSet = new Set(prev);
          newSet.delete(jobId);
          return newSet;
        });
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
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
        <TouchableOpacity style={styles.bookmarkButton} onPress={() => handleBookmark(item._id)}>
          <Icon name={bookmarkedJobs.has(item._id) ? "bookmark" : "bookmark-border"} size={20} color={bookmarkedJobs.has(item._id) ? "#DC2626" : "#6B7280"} />
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
            <View>
              <Text style={styles.brandName}>TheZift</Text>
              <Text style={styles.brandSubscript}>Jobs</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.profileButton} onPress={onNavigateToProfile}>
            {userAvatar && userAvatar.trim() !== '' ? (
              <Image source={{ uri: userAvatar }} style={styles.profileImage} />
            ) : (
              <View style={styles.profilePlaceholder}>
                <Text style={styles.profileInitial}>{userName && userName.trim() !== '' ? userName.charAt(0).toUpperCase() : 'U'}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Icon name="search" size={20} color="#DC2626" />
            {!filters.keyword && (
              <View style={styles.placeholderContainer}>
                <Text style={styles.placeholderStatic}>Search by </Text>
                <Animated.Text style={[styles.placeholderAnimated, { transform: [{ translateY: slideAnim }] }]}>
                  {placeholderTexts[placeholderIndex]}
                </Animated.Text>
              </View>
            )}
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
        </View>
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={[loading ? styles.scrollContent : undefined, { paddingBottom: insets.bottom }]}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#DC2626']}
            tintColor="#DC2626"
          />
        }
      >
        <ShowcaseCarousel />

        <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersRow} contentContainerStyle={styles.filtersRowContent}>
          <TouchableOpacity
            style={[styles.filterDropdownBtn, filters.location && styles.filterDropdownBtnActive]}
            onPress={() => setShowLocationDropdown(!showLocationDropdown)}
          >
            <Icon name="location-on" size={14} color={filters.location ? "#FFFFFF" : "#6B7280"} />
            <Text style={[styles.filterBtnText, filters.location && styles.filterBtnTextActive]}>
              {filters.location || 'Location'}
            </Text>
            <Icon name={showLocationDropdown ? "expand-less" : "expand-more"} size={16} color={filters.location ? "#FFFFFF" : "#6B7280"} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterDropdownBtn, filters.experienceLevel && styles.filterDropdownBtnActive]}
            onPress={() => setShowExperienceDropdown(!showExperienceDropdown)}
          >
            <Icon name="work-outline" size={14} color={filters.experienceLevel ? "#FFFFFF" : "#6B7280"} />
            <Text style={[styles.filterBtnText, filters.experienceLevel && styles.filterBtnTextActive]}>
              {filters.experienceLevel ? `${filters.experienceLevel}y` : 'Experience'}
            </Text>
            <Icon name={showExperienceDropdown ? "expand-less" : "expand-more"} size={16} color={filters.experienceLevel ? "#FFFFFF" : "#6B7280"} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterDropdownBtn, filters.workerMode && styles.filterDropdownBtnActive]}
            onPress={() => setShowWorkModeDropdown(!showWorkModeDropdown)}
          >
            <Icon name="home-work" size={14} color={filters.workerMode ? "#FFFFFF" : "#6B7280"} />
            <Text style={[styles.filterBtnText, filters.workerMode && styles.filterBtnTextActive]}>
              {filters.workerMode || 'Work Mode'}
            </Text>
            <Icon name={showWorkModeDropdown ? "expand-less" : "expand-more"} size={16} color={filters.workerMode ? "#FFFFFF" : "#6B7280"} />
          </TouchableOpacity>

          {(filters.location || filters.experienceLevel || filters.workerMode) && (
            <TouchableOpacity
              style={styles.clearFilterChip}
              onPress={() => {
                setFilters({ keyword: '', page: 1, limit: 10, location: '', experienceLevel: '', workerMode: '' });
                setShowLocationDropdown(false);
                setShowExperienceDropdown(false);
                setShowWorkModeDropdown(false);
              }}
            >
              <Icon name="close" size={14} color="#DC2626" />
              <Text style={styles.clearFilterChipText}>Clear</Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        {showLocationDropdown && (
          <ScrollView style={styles.dropdown} nestedScrollEnabled>
            {filterOptions.locations.map((location) => (
              <TouchableOpacity
                key={location}
                style={[styles.dropdownItem, filters.location === location && styles.dropdownItemActive]}
                onPress={() => {
                  setFilters(prev => ({ ...prev, location: prev.location === location ? '' : location, page: 1 }));
                  setShowLocationDropdown(false);
                }}
              >
                <Text style={[styles.dropdownItemText, filters.location === location && styles.dropdownItemTextActive]}>{location}</Text>
                {filters.location === location && <Icon name="check" size={16} color="#DC2626" />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {showExperienceDropdown && (
          <ScrollView style={styles.dropdown} nestedScrollEnabled>
            {filterOptions.experienceLevels.map((level) => (
              <TouchableOpacity
                key={level}
                style={[styles.dropdownItem, filters.experienceLevel === level && styles.dropdownItemActive]}
                onPress={() => {
                  setFilters(prev => ({ ...prev, experienceLevel: prev.experienceLevel === level ? '' : level, page: 1 }));
                  setShowExperienceDropdown(false);
                }}
              >
                <Text style={[styles.dropdownItemText, filters.experienceLevel === level && styles.dropdownItemTextActive]}>{level} years</Text>
                {filters.experienceLevel === level && <Icon name="check" size={16} color="#DC2626" />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {showWorkModeDropdown && (
          <ScrollView style={styles.dropdown} nestedScrollEnabled>
            {filterOptions.workerModes.map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[styles.dropdownItem, filters.workerMode === mode && styles.dropdownItemActive]}
                onPress={() => {
                  setFilters(prev => ({ ...prev, workerMode: prev.workerMode === mode ? '' : mode, page: 1 }));
                  setShowWorkModeDropdown(false);
                }}
              >
                <Text style={[styles.dropdownItemText, filters.workerMode === mode && styles.dropdownItemTextActive]}>{mode}</Text>
                {filters.workerMode === mode && <Icon name="check" size={16} color="#DC2626" />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
        </View>

        {loading ? (
          <View style={styles.section}>
            {[1, 2, 3].map((i) => (
              <View key={i} style={styles.skeletonCard}>
                <View style={styles.skeletonHeader}>
                  <View style={styles.skeletonLogo} />
                  <View style={styles.skeletonInfo}>
                    <View style={styles.skeletonTitle} />
                    <View style={styles.skeletonSubtitle} />
                    <View style={styles.skeletonMeta} />
                  </View>
                </View>
                <View style={styles.skeletonTags}>
                  <View style={styles.skeletonTag} />
                  <View style={styles.skeletonTag} />
                  <View style={styles.skeletonTag} />
                </View>
                <View style={styles.skeletonFooter}>
                  <View style={styles.skeletonSalary} />
                  <View style={styles.skeletonDate} />
                </View>
              </View>
            ))}
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
            <FlatList 
              data={jobs} 
              renderItem={renderJobCard} 
              keyExtractor={(item) => item._id} 
              scrollEnabled={false}
              contentContainerStyle={styles.flatListContent}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { backgroundColor: '#FFFFFF', paddingTop: 50, paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  brandContainer: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  brandLogo: { width: 32, height: 32, marginTop: 2 },
  brandName: { fontSize: 20, fontWeight: 'bold', color: '#DC2626', marginTop: 2 },
  brandSubscript: { fontSize: 10, color: '#6B7280', marginTop: -4 },
  profileButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  profileImage: { width: 40, height: 40, borderRadius: 20 },
  profilePlaceholder: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#DC2626', alignItems: 'center', justifyContent: 'center' },
  profileInitial: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
  searchContainer: { flexDirection: 'row', gap: 10, marginTop: 8 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 1, borderWidth: 1.5, borderColor: '#E5E7EB', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  placeholderContainer: { flexDirection: 'row', position: 'absolute', left: 44, pointerEvents: 'none', overflow: 'hidden', height: 20 },
  placeholderStatic: { fontSize: 14, color: '#9CA3AF', fontWeight: '500' },
  placeholderAnimated: { fontSize: 14, color: '#9CA3AF', fontWeight: '500' },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 14, color: '#1F2937', fontWeight: '500' },
  filterContainer: { backgroundColor: '#F9FAFB', paddingTop: 12 },
  filtersRow: { marginBottom: 8, marginHorizontal: -20 },
  filtersRowContent: { paddingHorizontal: 20 },
  filterDropdownBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB', marginRight: 8 },
  filterDropdownBtnActive: { backgroundColor: '#DC2626', borderColor: '#DC2626' },
  filterBtnText: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  filterBtnTextActive: { color: '#FFFFFF', fontWeight: '600' },
  dropdown: { maxHeight: 200, backgroundColor: '#FFFFFF', borderRadius: 12, marginTop: 4, marginBottom: 8, borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  dropdownItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  dropdownItemActive: { backgroundColor: '#FEF2F2' },
  dropdownItemText: { fontSize: 13, color: '#1F2937', fontWeight: '500' },
  dropdownItemTextActive: { color: '#DC2626', fontWeight: '600' },
  clearFilterChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FCA5A5', marginRight: 8 },
  clearFilterChipText: { fontSize: 12, color: '#DC2626', fontWeight: '600' },
  content: { flex: 1 },
  scrollContent: { paddingTop: 20 },
  skeletonCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  skeletonHeader: { flexDirection: 'row', marginBottom: 12 },
  skeletonLogo: { width: 48, height: 48, borderRadius: 8, backgroundColor: '#E5E7EB', marginRight: 12 },
  skeletonInfo: { flex: 1, gap: 8 },
  skeletonTitle: { width: '70%', height: 16, backgroundColor: '#E5E7EB', borderRadius: 4 },
  skeletonSubtitle: { width: '50%', height: 14, backgroundColor: '#E5E7EB', borderRadius: 4 },
  skeletonMeta: { width: '40%', height: 12, backgroundColor: '#E5E7EB', borderRadius: 4 },
  skeletonTags: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  skeletonTag: { width: 60, height: 24, backgroundColor: '#E5E7EB', borderRadius: 12 },
  skeletonFooter: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  skeletonSalary: { width: 100, height: 16, backgroundColor: '#E5E7EB', borderRadius: 4 },
  skeletonDate: { width: 60, height: 12, backgroundColor: '#E5E7EB', borderRadius: 4 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 80, paddingHorizontal: 20 },
  lottieAnimation: { width: 200, height: 200 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginTop: -10, marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#6B7280', textAlign: 'center', paddingHorizontal: 40 },
  section: { marginVertical: 20, paddingHorizontal: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  seeAll: { fontSize: 14, color: '#DC2626', fontWeight: '500' },
  jobCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 12, marginHorizontal: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
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
  flatListContent: { paddingHorizontal: 0 },
});