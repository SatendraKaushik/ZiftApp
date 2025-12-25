import { getApp } from '@react-native-firebase/app';
import { getAuth, GoogleAuthProvider, signInWithCredential } from '@react-native-firebase/auth';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

export const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    webClientId: '166734067721-cuiuks9p2rgtvlrfpldgcfllhvvmgq1k.apps.googleusercontent.com',
    offlineAccess: true,
    forceCodeForRefreshToken: true,
  });
};

export const signInWithGoogle = async () => {
  await GoogleSignin.signOut();
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const signInResult = await GoogleSignin.signIn();
  const idToken = signInResult.data?.idToken;
  
  if (!idToken) {
    throw new Error('No ID token received from Google Sign-In');
  }
  
  const googleCredential = GoogleAuthProvider.credential(idToken);
  const auth = getAuth(getApp());
  return signInWithCredential(auth, googleCredential);
};

export const signOutGoogle = async () => {
  await GoogleSignin.signOut();
  const auth = getAuth(getApp());
  await auth.signOut();
};
