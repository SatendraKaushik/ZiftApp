import React, { useRef, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Dimensions, Animated, TouchableOpacity, Linking, Image } from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width;

const showcaseItems = [
  { image: require('./assests/carouseleimage/devloper.png') },
  { image: require('./assests/carouseleimage/hiringjob.png') },
  { image: require('./assests/carouseleimage/jobimage.png') },
  { image: require('./assests/carouseleimage/practice.png') },
];

export default function ShowcaseCarousel() {
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const currentIndex = useRef(0);

  const handleCardPress = () => {
    Linking.openURL('https://thezift.com');
  };

  useEffect(() => {
    const interval = setInterval(() => {
      currentIndex.current = (currentIndex.current + 1) % showcaseItems.length;
      scrollViewRef.current?.scrollTo({
        x: currentIndex.current * CARD_WIDTH,
        animated: true,
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {showcaseItems.map((item, index) => (
          <TouchableOpacity key={index} style={styles.card} onPress={handleCardPress}>
            <Image source={item.image} style={styles.cardImage} resizeMode="cover" />
          </TouchableOpacity>
        ))}
      </Animated.ScrollView>
      
      <View style={styles.pagination}>
        {showcaseItems.map((_, index) => {
          const inputRange = [
            (index - 1) * CARD_WIDTH,
            index * CARD_WIDTH,
            (index + 1) * CARD_WIDTH,
          ];
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 20, 8],
            extrapolate: 'clamp',
          });
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });
          return (
            <Animated.View
              key={index}
              style={[styles.dot, { width: dotWidth, opacity }]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 12 },
  card: {
    width: width - 40,
    marginLeft: 20,
    marginRight: 20,
    borderRadius: 16,
    overflow: 'hidden',
    minHeight: 140,
  },
  cardImage: {
    width: '100%',
    height: 160,
    borderRadius: 16,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DC2626',
  },
});
