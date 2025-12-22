#!/bin/bash

# iOS Setup for react-native-vector-icons

echo "Setting up react-native-vector-icons for iOS..."

# Add fonts to Info.plist
echo "Adding fonts to Info.plist..."
cat >> ios/ziftapp/Info.plist << 'EOF'
	<key>UIAppFonts</key>
	<array>
		<string>AntDesign.ttf</string>
		<string>Entypo.ttf</string>
		<string>EvilIcons.ttf</string>
		<string>Feather.ttf</string>
		<string>FontAwesome.ttf</string>
		<string>Foundation.ttf</string>
		<string>Ionicons.ttf</string>
		<string>MaterialIcons.ttf</string>
		<string>MaterialCommunityIcons.ttf</string>
		<string>SimpleLineIcons.ttf</string>
		<string>Octicons.ttf</string>
		<string>Zocial.ttf</string>
	</array>
EOF

echo "iOS setup complete! Run 'cd ios && pod install' to finish setup."