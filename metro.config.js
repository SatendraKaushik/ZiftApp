const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  resolver: {
    alias: {
      'react-native-vector-icons': 'react-native-vector-icons',
    },
    assetExts: ['lottie', ...require('@react-native/metro-config').getDefaultConfig(__dirname).resolver.assetExts],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);