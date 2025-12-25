import React, { useState, useEffect } from 'react';
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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Axios from '../../libs/Axios';
import { TokenStorage } from '../../libs/TokenStorage';
import { signInWithGoogle, configureGoogleSignIn } from '../../libs/googleAuth';

const { height } = Dimensions.get('window');

interface LoginScreenProps {
  onLoginSuccess: (user: any) => void;
  onNavigateToRegister: () => void;
  onNavigateToForgot: () => void;
  onNavigateToVerify: (email: string) => void;
}

export default function LoginScreen({ onLoginSuccess, onNavigateToRegister, onNavigateToForgot, onNavigateToVerify }: LoginScreenProps) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);

  useEffect(() => {
    configureGoogleSignIn();
  }, []);

  const validateForm = () => {
    const newErrors = { email: '', password: '' };
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field as keyof typeof errors]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const response = await Axios.post('/user/login', formData);
      
      if (response.data.user) {
        if (response.data.accessToken) {
         
          await TokenStorage.setToken(response.data.accessToken);
        }
        console.log('User data:', response.data.user);
        await TokenStorage.setUser(response.data.user);
        onLoginSuccess(response.data.user);
      }
    } catch (error: any) {
      let errorMessage = 'Login failed';
      if (typeof error.response?.data === 'string' && error.response.data.includes('<html')) {
        const match = error.response.data.match(/Error:\s*(.*?)<br>/);
        if (match && match[1]) {
          errorMessage = match[1].trim();
        }
      } else {
        errorMessage = error.response?.data?.message || 'Login failed';
      }
      
      if (errorMessage === 'Email not verified') {
        Alert.alert(
          'Email Not Verified',
          'Your email is not verified. Please verify your email to continue.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Verify Now',
              onPress: async () => {
                try {
                  await Axios.post('/user/resend-otp', { email: formData.email });
                  onNavigateToVerify(formData.email);
                } catch (err: any) {
                  Alert.alert('Error', err.response?.data?.message || 'Failed to send OTP');
                }
              }
            }
          ]
        );
      } else {
        Alert.alert('Login Error', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const userCredential = await signInWithGoogle();
      const idToken = await userCredential.user.getIdToken();

      const response = await Axios.post('/user/google-auth', { idToken });
      
      if (response.data.accessToken) {
        // console.log('Tokenby google:', response.data.accessToken);
        await TokenStorage.setToken(response.data.accessToken);
      }
      await TokenStorage.setUser(response.data.user);
      onLoginSuccess(response.data.user);
    } catch (error: any) {
      Alert.alert('Google Login Error', error.response?.data?.message || error.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  // "package_name": "com.ziftapp"
  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
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
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to your account to continue</Text>
      </View>

      <View style={styles.content}>
        {!showEmailForm ? (
          <View>
            <TouchableOpacity style={styles.socialButton} onPress={handleGoogleLogin}>
              <View style={styles.socialButtonContent}>
                <Image 
                  source={require('../assests/zift/google.png')} 
                  style={styles.googleIcon}
                  resizeMode="contain"
                />
                <Text style={styles.socialButtonText}>Continue with Google</Text>
              </View>
            </TouchableOpacity>



            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Or continue with email</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.emailButton} onPress={() => setShowEmailForm(true)}>
              <View style={styles.socialButtonContent}>
                <Icon name="email" size={20} color="#FFFFFF" />
                <Text style={styles.emailButtonText}>Continue with Email</Text>
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={[styles.input, errors.email ? styles.inputError : null]}
                placeholder="Enter your email"
                value={formData.email}
                onChangeText={(value) => handleChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#9CA3AF"
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.passwordInput, errors.password ? styles.inputError : null]}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChangeText={(value) => handleChange('password', value)}
                  secureTextEntry={!showPassword}
                  placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword(!showPassword)}>
                  <Icon name={showPassword ? "visibility" : "visibility-off"} size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            <TouchableOpacity style={styles.forgotPassword} onPress={onNavigateToForgot}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginButtonText}>Sign In</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={styles.backButton} onPress={() => setShowEmailForm(false)}>
              <Text style={styles.backButtonText}>← Back to social login</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.registerLink} onPress={onNavigateToRegister}>
          <Text style={styles.registerText}>
            Don't have an account? <Text style={styles.registerTextBold}>Sign up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { paddingBottom: 100 },
  header: { alignItems: 'center', paddingTop: 60, paddingBottom: 40, paddingHorizontal: 20, backgroundColor: '#FAFAFA' },
  logo: { width: 80, height: 80, marginBottom: 16 },
  brandName: { fontSize: 24, fontWeight: 'bold', color: '#DC2626', marginBottom: 8 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1F2937', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#6B7280', textAlign: 'center' },
  content: { flex: 1, paddingHorizontal: 20, paddingVertical: 30 },
  socialButton: { backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#E5E7EB', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  socialButtonContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  googleIcon: { width: 20, height: 20 },
  socialButtonText: { fontSize: 16, fontWeight: '600', color: '#374151' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  dividerText: { marginHorizontal: 16, fontSize: 14, color: '#6B7280' },
  emailButton: { backgroundColor: '#DC2626', borderRadius: 12, padding: 16, alignItems: 'center' },
  emailButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginLeft: 8 },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '500', color: '#374151', marginBottom: 8 },
  input: { borderWidth: 2, borderColor: '#E5E7EB', borderRadius: 12, padding: 16, fontSize: 16, backgroundColor: '#FFFFFF', color: '#1F2937' },
  inputError: { borderColor: '#EF4444' },
  passwordContainer: { flexDirection: 'row', alignItems: 'center' },
  passwordInput: { flex: 1, borderWidth: 2, borderColor: '#E5E7EB', borderRadius: 12, padding: 16, fontSize: 16, backgroundColor: '#FFFFFF', color: '#1F2937' },
  eyeButton: { position: 'absolute', right: 16, padding: 8 },
  errorText: { color: '#EF4444', fontSize: 14, marginTop: 4 },
  forgotPassword: { alignItems: 'flex-end', marginBottom: 24 },
  forgotPasswordText: { fontSize: 14, color: '#DC2626', fontWeight: '500' },
  loginButton: { backgroundColor: '#DC2626', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 16 },
  buttonDisabled: { opacity: 0.6 },
  loginButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  backButton: { alignItems: 'center', padding: 12 },
  backButtonText: { fontSize: 14, color: '#6B7280' },
  registerLink: { alignItems: 'center', marginTop: 20 },
  registerText: { fontSize: 14, color: '#6B7280' },
  registerTextBold: { color: '#DC2626', fontWeight: '600' },
});