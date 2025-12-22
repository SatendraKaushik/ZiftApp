import React, { useState } from 'react';
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
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Axios from '../../libs/Axios';

const { height } = Dimensions.get('window');

interface RegisterScreenProps {
  onRegisterSuccess: (email: string) => void;
  onNavigateToLogin: () => void;
}

export default function RegisterScreen({ onRegisterSuccess, onNavigateToLogin }: RegisterScreenProps) {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);

  const getPasswordStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const validateForm = () => {
    const newErrors = { name: '', email: '', password: '' };
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
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
      const response = await Axios.post('/user/register', formData);
      Alert.alert('Success', response.data.message);
      onRegisterSuccess(formData.email);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      Alert.alert('Registration Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => Alert.alert('Google Signup', 'Google registration coming soon');
  const handleGithubSignup = () => Alert.alert('GitHub Signup', 'GitHub registration coming soon');

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthColors = ['#EF4444', '#F97316', '#EAB308', '#22C55E'];
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Image 
          source={require('../assests/zift/ziftlogo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.brandName}>TheZift</Text>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Get started with your free account</Text>
      </View>

      <View style={styles.content}>
        {!showEmailForm ? (
          <View>
            <TouchableOpacity style={styles.socialButton} onPress={handleGoogleSignup}>
              <View style={styles.socialButtonContent}>
                <FontAwesome name="google" size={20} color="#4285F4" />
                <Text style={styles.socialButtonText}>Continue with Google</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialButton} onPress={handleGithubSignup}>
              <View style={styles.socialButtonContent}>
                <FontAwesome name="github" size={20} color="#24292E" />
                <Text style={styles.socialButtonText}>Continue with GitHub</Text>
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
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={[styles.input, errors.name ? styles.inputError : null]}
                placeholder="Enter your full name"
                value={formData.name}
                onChangeText={(value) => handleChange('name', value)}
                placeholderTextColor="#9CA3AF"
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

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

              {formData.password && (
                <View style={styles.strengthContainer}>
                  <View style={styles.strengthBars}>
                    {[0, 1, 2, 3].map((i) => (
                      <View
                        key={i}
                        style={[
                          styles.strengthBar,
                          { backgroundColor: i < passwordStrength ? strengthColors[passwordStrength - 1] : '#E5E7EB' },
                        ]}
                      />
                    ))}
                  </View>
                  <Text style={styles.strengthText}>
                    Password strength: {passwordStrength > 0 ? strengthLabels[passwordStrength - 1] : 'Too weak'}
                  </Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={[styles.registerButton, loading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.registerButtonText}>Create Account</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={styles.backButton} onPress={() => setShowEmailForm(false)}>
              <Text style={styles.backButtonText}>← Back to social signup</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.footer}>
          <TouchableOpacity style={styles.forgotPasswordLink}>
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.loginLink} onPress={onNavigateToLogin}>
            <Text style={styles.loginText}>
              Already have an account? <Text style={styles.loginTextBold}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { flexGrow: 1, minHeight: height },
  header: { alignItems: 'center', paddingTop: 60, paddingBottom: 40, paddingHorizontal: 20, backgroundColor: '#FAFAFA' },
  logo: { width: 80, height: 80, marginBottom: 16 },
  brandName: { fontSize: 24, fontWeight: 'bold', color: '#DC2626', marginBottom: 8 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1F2937', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#6B7280', textAlign: 'center' },
  content: { flex: 1, paddingHorizontal: 20, paddingVertical: 30 },
  socialButton: { backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#E5E7EB', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  socialButtonContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
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
  strengthContainer: { marginTop: 12 },
  strengthBars: { flexDirection: 'row', gap: 4, marginBottom: 8 },
  strengthBar: { flex: 1, height: 4, borderRadius: 2 },
  strengthText: { fontSize: 12, color: '#6B7280' },
  registerButton: { backgroundColor: '#DC2626', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 20, marginBottom: 16 },
  buttonDisabled: { opacity: 0.6 },
  registerButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  backButton: { alignItems: 'center', padding: 12 },
  backButtonText: { fontSize: 14, color: '#6B7280' },
  footer: { alignItems: 'center', marginTop: 20, gap: 12 },
  forgotPasswordLink: { padding: 8 },
  forgotPasswordText: { fontSize: 14, color: '#DC2626', fontWeight: '500' },
  loginLink: { padding: 8 },
  loginText: { fontSize: 14, color: '#6B7280' },
  loginTextBold: { color: '#DC2626', fontWeight: '600' },
});