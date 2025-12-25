import React, { useState } from 'react';
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';
import ForgetPassword from './ForgetPassword';
import Verify from './Verify';

type AuthScreen = 'login' | 'register' | 'forgot' | 'verify';

interface AuthNavigatorProps {
  onAuthSuccess: (user: any) => void;
}

export default function AuthNavigator({ onAuthSuccess }: AuthNavigatorProps) {
  const [currentScreen, setCurrentScreen] = useState<AuthScreen>('login');
  const [verifyEmail, setVerifyEmail] = useState('');

  const handleLoginSuccess = (user: any) => {
    onAuthSuccess(user);
  };

  const handleRegisterSuccess = (email: string) => {
    setVerifyEmail(email);
    setCurrentScreen('verify');
  };

  const handleNavigateToVerify = (email: string) => {
    setVerifyEmail(email);
    setCurrentScreen('verify');
  };

  const handleVerifySuccess = (user: any) => {
    onAuthSuccess(user);
  };

  switch (currentScreen) {
    case 'login':
      return (
        <LoginScreen
          onLoginSuccess={handleLoginSuccess}
          onNavigateToRegister={() => setCurrentScreen('register')}
          onNavigateToForgot={() => setCurrentScreen('forgot')}
          onNavigateToVerify={handleNavigateToVerify}
        />
      );
    case 'register':
      return (
        <RegisterScreen
          onRegisterSuccess={handleRegisterSuccess}
          onNavigateToLogin={() => setCurrentScreen('login')}
        />
      );
    case 'forgot':
      return (
        <ForgetPassword
          onNavigateToLogin={() => setCurrentScreen('login')}
        />
      );
    case 'verify':
      return (
        <Verify
          email={verifyEmail}
          onVerifySuccess={handleVerifySuccess}
          onNavigateToRegister={() => setCurrentScreen('register')}
          onNavigateToLogin={() => setCurrentScreen('login')}
        />
      );
    default:
      return (
        <LoginScreen
          onLoginSuccess={handleLoginSuccess}
          onNavigateToRegister={() => setCurrentScreen('register')}
          onNavigateToForgot={() => setCurrentScreen('forgot')}
          onNavigateToVerify={handleNavigateToVerify}
        />
      );
  }
}