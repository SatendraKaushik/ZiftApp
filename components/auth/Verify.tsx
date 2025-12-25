import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import Axios from '../../libs/Axios';

const { height } = Dimensions.get('window');

interface VerifyProps {
  email: string;
  onVerifySuccess: (user: any) => void;
  onNavigateToRegister: () => void;
  onNavigateToLogin: () => void;
}

export default function Verify({ email, onVerifySuccess, onNavigateToRegister, onNavigateToLogin }: VerifyProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(0);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      const pastedCode = value.slice(0, 6);
      const newOtp = [...otp];
      for (let i = 0; i < pastedCode.length; i++) {
        if (index + i < 6) {
          newOtp[index + i] = pastedCode[i];
        }
      }
      setOtp(newOtp);
      const nextIndex = Math.min(index + pastedCode.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace') {
      const newOtp = [...otp];
      if (otp[index]) {
        newOtp[index] = '';
        setOtp(newOtp);
      } else if (index > 0) {
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleSubmit = async () => {
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      Alert.alert('Error', 'Please enter complete OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await Axios.post('/user/verify-email', {
        email,
        otp: otpString
      });
      Alert.alert('Success', response.data.message, [
        { text: 'OK', onPress: () => onNavigateToLogin() }
      ]);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Verification failed';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResending(true);
    try {
      const response = await Axios.post('/user/resend-otp', { email });
      Alert.alert('Success', response.data.message);
      setTimer(60);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to resend OTP';
      Alert.alert('Error', errorMessage);
    } finally {
      setResending(false);
    }
  };

  useEffect(() => {
    if (!email) {
      onNavigateToRegister();
    }
  }, [email, onNavigateToRegister]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Image 
          source={require('../assests/zift/ziftlogo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.brandName}>TheZift</Text>
        <Text style={styles.title}>Verify Your Email</Text>
        <Text style={styles.subtitle}>We've sent a 6-digit code to</Text>
        <Text style={styles.email}>{email}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.form}>
          <Text style={styles.label}>Enter verification code</Text>
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                style={styles.otpInput}
                maxLength={6}
                value={digit}
                onChangeText={(value) => handleChange(index, value)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
                keyboardType="numeric"
                textAlign="center"
              />
            ))}
          </View>

          <TouchableOpacity
            style={[styles.verifyButton, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.verifyButtonText}>Verify Email</Text>
            )}
          </TouchableOpacity>

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive the code?</Text>
            <TouchableOpacity
              onPress={handleResendOTP}
              disabled={resending || timer > 0}
              style={[styles.resendButton, (resending || timer > 0) && styles.buttonDisabled]}
            >
              <Text style={styles.resendButtonText}>
                {resending ? 'Resending...' : timer > 0 ? `Resend in ${timer}s` : 'Resend OTP'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.backLink} onPress={onNavigateToRegister}>
          <Text style={styles.backLinkText}>← Back to Registration</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  scrollContent: { paddingBottom: 50 },
  header: { alignItems: 'center', paddingTop: 40, paddingBottom: 30, paddingHorizontal: 20 },
  logo: { width: 60, height: 60, marginBottom: 12 },
  brandName: { fontSize: 20, fontWeight: 'bold', color: '#DC2626', marginBottom: 6 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1F2937', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
  email: { fontSize: 14, fontWeight: '600', color: '#1F2937', marginTop: 4 },
  content: { paddingHorizontal: 20, paddingBottom: 20 },
  form: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 16, textAlign: 'center' },
  otpContainer: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 24 },
  otpInput: { width: 42, height: 42, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, fontSize: 18, fontWeight: '600', color: '#1F2937', textAlign: 'center' },
  verifyButton: { backgroundColor: '#DC2626', borderRadius: 8, padding: 16, alignItems: 'center', marginBottom: 24 },
  buttonDisabled: { opacity: 0.5 },
  verifyButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  resendContainer: { alignItems: 'center', gap: 12 },
  resendText: { fontSize: 14, color: '#6B7280' },
  resendButton: { padding: 8 },
  resendButtonText: { fontSize: 14, color: '#DC2626', fontWeight: '500' },
  backLink: { alignItems: 'center', padding: 12 },
  backLinkText: { fontSize: 14, color: '#DC2626', fontWeight: '500' },
});