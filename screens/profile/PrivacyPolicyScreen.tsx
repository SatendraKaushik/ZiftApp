import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface PrivacyPolicyScreenProps {
  onBack: () => void;
}

export default function PrivacyPolicyScreen({ onBack }: PrivacyPolicyScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Icon name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 20 + insets.bottom }}>
        <Text style={styles.title}>🛡️ Privacy Policy</Text>

        <Text style={styles.paragraph}>
          Welcome to TheZift ("we," "our," or "us"). Your privacy is important to us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website thezift.com and use our services, including the buying and selling of website components and complete websites (collectively, the "Platform").
        </Text>
        <Text style={styles.paragraph}>
          By accessing or using our Platform, you agree to the terms of this Privacy Policy.
        </Text>

        <Text style={styles.sectionTitle}>1. Information We Collect</Text>
        <Text style={styles.paragraph}>We collect the following types of information to provide you with a smooth and secure experience:</Text>

        <Text style={styles.subTitle}>a. Personal Information</Text>
        <Text style={styles.paragraph}>When you register, make a purchase, or sell a product, we may collect:</Text>
        <Text style={styles.listItem}>• Full Name</Text>
        <Text style={styles.listItem}>• Email Address</Text>
        <Text style={styles.listItem}>• Phone Number</Text>
        <Text style={styles.listItem}>• Billing and Shipping Address</Text>
        <Text style={styles.listItem}>• Bank Account / UPI details (for seller payouts)</Text>
        <Text style={styles.listItem}>• Tax Information (if applicable, e.g., GSTIN or PAN)</Text>
        <Text style={styles.listItem}>• Company Name (if applicable)</Text>

        <Text style={styles.subTitle}>b. Payment Information</Text>
        <Text style={styles.listItem}>• We use third-party payment gateways (such as Razorpay, Stripe, or Paytm) to process payments.</Text>
        <Text style={styles.listItem}>• We do not store your credit/debit card numbers, CVV, or passwords on our servers.</Text>
        <Text style={styles.listItem}>• Payment information is handled securely by the respective payment processors in compliance with PCI-DSS standards.</Text>

        <Text style={styles.subTitle}>c. Usage Data</Text>
        <Text style={styles.paragraph}>We may collect:</Text>
        <Text style={styles.listItem}>• IP Address</Text>
        <Text style={styles.listItem}>• Browser Type and Version</Text>
        <Text style={styles.listItem}>• Device Information</Text>
        <Text style={styles.listItem}>• Access Times and Pages Visited</Text>
        <Text style={styles.listItem}>• Referring/Exit Pages</Text>
        <Text style={styles.paragraph}>This helps us improve our service and detect fraud or misuse.</Text>

        <Text style={styles.subTitle}>d. Cookies and Tracking Technologies</Text>
        <Text style={styles.paragraph}>We use cookies and similar technologies to:</Text>
        <Text style={styles.listItem}>• Remember your login session</Text>
        <Text style={styles.listItem}>• Store preferences</Text>
        <Text style={styles.listItem}>• Analyze user traffic</Text>
        <Text style={styles.listItem}>• Improve performance and personalization</Text>
        <Text style={styles.paragraph}>You can disable cookies in your browser settings, but some features may not function properly.</Text>

        <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
        <Text style={styles.paragraph}>We use your data to:</Text>
        <Text style={styles.listItem}>• Register and manage your account</Text>
        <Text style={styles.listItem}>• Facilitate buying and selling of components and websites</Text>
        <Text style={styles.listItem}>• Process and confirm payments and refunds</Text>
        <Text style={styles.listItem}>• Communicate with you regarding orders, offers, and updates</Text>
        <Text style={styles.listItem}>• Improve Platform performance and user experience</Text>
        <Text style={styles.listItem}>• Comply with legal obligations and resolve disputes</Text>

        <Text style={styles.sectionTitle}>3. Sharing of Information</Text>
        <Text style={styles.paragraph}>We do not sell or rent your personal data. However, we may share your information with:</Text>
        <Text style={styles.listItem}>• <Text style={styles.bold}>Payment Gateways:</Text> To process secure transactions.</Text>
        <Text style={styles.listItem}>• <Text style={styles.bold}>Service Providers:</Text> For hosting, analytics, and customer support.</Text>
        <Text style={styles.listItem}>• <Text style={styles.bold}>Law Enforcement:</Text> If required by applicable law or legal request.</Text>
        <Text style={styles.listItem}>• <Text style={styles.bold}>Buyers and Sellers:</Text> Limited data (like name and email) may be shared for order fulfillment and support.</Text>

        <Text style={styles.sectionTitle}>4. Data Security</Text>
        <Text style={styles.paragraph}>We take appropriate technical and organizational measures to protect your information from:</Text>
        <Text style={styles.listItem}>• Unauthorized access</Text>
        <Text style={styles.listItem}>• Disclosure or alteration</Text>
        <Text style={styles.listItem}>• Accidental loss or destruction</Text>
        <Text style={styles.paragraph}>Your passwords are encrypted, and sensitive transactions are secured via SSL encryption.</Text>

        <Text style={styles.sectionTitle}>5. Data Retention</Text>
        <Text style={styles.paragraph}>We retain your personal data only as long as:</Text>
        <Text style={styles.listItem}>• You have an active account on our Platform, or</Text>
        <Text style={styles.listItem}>• It is necessary for legal, accounting, or reporting obligations.</Text>
        <Text style={styles.paragraph}>Once data is no longer needed, it will be securely deleted or anonymized.</Text>

        <Text style={styles.sectionTitle}>6. Your Rights</Text>
        <Text style={styles.paragraph}>You have the right to:</Text>
        <Text style={styles.listItem}>• Access and update your personal information</Text>
        <Text style={styles.listItem}>• Delete your account and associated data</Text>
        <Text style={styles.listItem}>• Withdraw consent for marketing communications</Text>
        <Text style={styles.listItem}>• Request a copy of your stored data</Text>
        <Text style={styles.paragraph}>You can exercise these rights by emailing us at support@thezift.com.</Text>

        <Text style={styles.sectionTitle}>7. Payment Gateway Compliance</Text>
        <Text style={styles.paragraph}>We comply with the policies of all major payment gateways, including:</Text>
        <Text style={styles.listItem}>• PCI-DSS (Payment Card Industry Data Security Standard)</Text>
        <Text style={styles.listItem}>• KYC (Know Your Customer) requirements for sellers</Text>
        <Text style={styles.listItem}>• Data minimization and confidentiality standards</Text>
        <Text style={styles.paragraph}>All transactions on our platform are processed through secure and verified gateways. We never store sensitive payment data on our servers.</Text>

        <Text style={styles.sectionTitle}>8. Links to Other Websites</Text>
        <Text style={styles.paragraph}>Our Platform may contain links to third-party websites or tools. We are not responsible for the privacy practices or content of these external sites.</Text>

        <Text style={styles.sectionTitle}>9. Changes to This Policy</Text>
        <Text style={styles.paragraph}>We may update this Privacy Policy from time to time. The revised version will be posted with an updated "Last Updated" date. We encourage you to review it periodically.</Text>

        <Text style={styles.sectionTitle}>10. Contact Us</Text>
        <Text style={styles.paragraph}>If you have any questions, concerns, or requests regarding this Privacy Policy, please contact us at:</Text>
        <Text style={styles.listItem}>📧 <Text style={styles.bold}>Email:</Text> zifttech@gmail.com</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#1F2937' },
  content: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: '700', color: '#1F2937', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1F2937', marginTop: 24, marginBottom: 12 },
  subTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginTop: 16, marginBottom: 8 },
  paragraph: { fontSize: 14, color: '#4B5563', lineHeight: 22, marginBottom: 12 },
  listItem: { fontSize: 14, color: '#4B5563', lineHeight: 22, marginBottom: 6, paddingLeft: 8 },
  bold: { fontWeight: '600', color: '#1F2937' },
});
