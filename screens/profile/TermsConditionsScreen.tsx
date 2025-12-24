import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface TermsConditionsScreenProps {
  onBack: () => void;
}

export default function TermsConditionsScreen({ onBack }: TermsConditionsScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Icon name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 20 + insets.bottom }}>
        <Text style={styles.title}>📜 Terms and Conditions</Text>

        <Text style={styles.paragraph}>
          Welcome to TheZift ("we," "our," or "us"). These Terms and Conditions ("Terms") govern your access to and use of theTheZift.com (the "Platform"), including the buying and selling of website components and complete websites.
        </Text>
        <Text style={styles.paragraph}>
          By accessing or using our Platform, you agree to be bound by these Terms. If you do not agree, please do not use our services.
        </Text>

        <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
        <Text style={styles.paragraph}>
          By creating an account, browsing, or making a purchase on TheZift, you acknowledge that you have read, understood, and agree to these Terms, as well as our Privacy Policy.
        </Text>

        <Text style={styles.sectionTitle}>2. Eligibility</Text>
        <Text style={styles.listItem}>• You must provide accurate and complete information during registration.</Text>
        <Text style={styles.listItem}>• You are responsible for maintaining the confidentiality of your account credentials.</Text>

        <Text style={styles.sectionTitle}>3. User Accounts</Text>
        <Text style={styles.paragraph}>When you create an account, you agree to:</Text>
        <Text style={styles.listItem}>• Provide truthful and accurate information</Text>
        <Text style={styles.listItem}>• Keep your login credentials secure</Text>
        <Text style={styles.listItem}>• Notify us immediately of any unauthorized access</Text>
        <Text style={styles.listItem}>• Accept responsibility for all activities under your account</Text>

        <Text style={styles.sectionTitle}>4. Buying and Selling</Text>

        <Text style={styles.subTitle}>For Buyers:</Text>
        <Text style={styles.listItem}>• All purchases are subject to availability and acceptance by the seller.</Text>
        <Text style={styles.listItem}>• Prices are displayed in the currency specified on the Platform.</Text>
        <Text style={styles.listItem}>• Payment must be made through our approved payment gateways.</Text>
        <Text style={styles.listItem}>• Digital products are delivered electronically upon successful payment.</Text>
        <Text style={styles.listItem}>• Refunds are subject to our Refund Policy.</Text>

        <Text style={styles.subTitle}>For Sellers:</Text>
        <Text style={styles.listItem}>• You must own or have the right to sell the components/websites you list.</Text>
        <Text style={styles.listItem}>• You are responsible for the accuracy of product descriptions and pricing.</Text>
        <Text style={styles.listItem}>• You must deliver products as described and in a timely manner.</Text>
        <Text style={styles.listItem}>• You agree to our commission structure and payout terms.</Text>
        <Text style={styles.listItem}>• You must comply with all applicable laws and regulations.</Text>

        <Text style={styles.sectionTitle}>5. Intellectual Property</Text>
        <Text style={styles.listItem}>• Sellers retain ownership of their original content but grant buyers a license to use purchased items.</Text>
        <Text style={styles.listItem}>• Buyers may not resell, redistribute, or claim ownership of purchased components.</Text>
        <Text style={styles.listItem}>• The TheZift name, logo, and Platform design are our intellectual property.</Text>
        <Text style={styles.listItem}>• Unauthorized use of any content may result in legal action.</Text>

        <Text style={styles.sectionTitle}>6. Prohibited Activities</Text>
        <Text style={styles.paragraph}>You may not:</Text>
        <Text style={styles.listItem}>• Upload malicious code, viruses, or harmful content</Text>
        <Text style={styles.listItem}>• Engage in fraudulent transactions or money laundering</Text>
        <Text style={styles.listItem}>• Violate intellectual property rights of others</Text>
        <Text style={styles.listItem}>• Harass, abuse, or harm other users</Text>
        <Text style={styles.listItem}>• Attempt to hack, disrupt, or compromise Platform security</Text>
        <Text style={styles.listItem}>• Use the Platform for illegal purposes</Text>
        <Text style={styles.listItem}>• Create multiple accounts to manipulate reviews or ratings</Text>

        <Text style={styles.sectionTitle}>7. Payment and Fees</Text>
        <Text style={styles.listItem}>• All payments are processed through secure third-party payment gateways.</Text>
        <Text style={styles.listItem}>• Sellers are subject to platform commission fees on each sale.</Text>
        <Text style={styles.listItem}>• Payment processing fees may apply as per the payment gateway's terms.</Text>
        <Text style={styles.listItem}>• Payouts to sellers are processed according to our payout schedule.</Text>

        <Text style={styles.sectionTitle}>8. Refunds and Disputes</Text>
        <Text style={styles.listItem}>• Refund requests must be submitted within the specified timeframe.</Text>
        <Text style={styles.listItem}>• Refunds are evaluated on a case-by-case basis.</Text>
        <Text style={styles.listItem}>• Disputes between buyers and sellers should be resolved amicably.</Text>
        <Text style={styles.listItem}>• TheZift may mediate disputes but is not obligated to do so.</Text>

        <Text style={styles.sectionTitle}>9. Content Moderation</Text>
        <Text style={styles.paragraph}>
          We reserve the right to review, approve, reject, or remove any content that violates these Terms or is deemed inappropriate. This includes but is not limited to product listings, reviews, and user-generated content.
        </Text>

        <Text style={styles.sectionTitle}>10. Limitation of Liability</Text>
        <Text style={styles.listItem}>• TheZift is a marketplace platform and is not responsible for the quality, legality, or accuracy of listed products.</Text>
        <Text style={styles.listItem}>• We do not guarantee uninterrupted or error-free service.</Text>
        <Text style={styles.listItem}>• We are not liable for any indirect, incidental, or consequential damages.</Text>
        <Text style={styles.listItem}>• Our total liability is limited to the amount paid by you in the transaction in question.</Text>

        <Text style={styles.sectionTitle}>11. Termination</Text>
        <Text style={styles.paragraph}>We reserve the right to:</Text>
        <Text style={styles.listItem}>• Suspend or terminate your account for violation of these Terms</Text>
        <Text style={styles.listItem}>• Remove content that violates our policies</Text>
        <Text style={styles.listItem}>• Refuse service to anyone at any time</Text>
        <Text style={styles.paragraph}>You may also delete your account at any time through your account settings.</Text>

        <Text style={styles.sectionTitle}>12. Changes to Terms</Text>
        <Text style={styles.paragraph}>
          We may update these Terms from time to time. The revised version will be posted with an updated "Last Updated" date. Continued use of the Platform after changes constitutes acceptance of the new Terms.
        </Text>

        <Text style={styles.sectionTitle}>13. Governing Law</Text>
        <Text style={styles.paragraph}>
          These Terms are governed by and construed in accordance with the laws of India. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts in India.
        </Text>

        <Text style={styles.sectionTitle}>14. Contact Us</Text>
        <Text style={styles.paragraph}>If you have any questions about these Terms, please contact us at:</Text>
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
