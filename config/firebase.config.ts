import {
  Auth,
  getAuth,
  getReactNativePersistence,
  initializeAuth,
} from '@firebase/auth';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getFirestore } from "firebase/firestore";
import reactNativeAsyncStorage from '../utils/reactNativeAsyncStorage';

// const firebaseConfig = {
//   apiKey: "AIzaSyDgFHaimBbFOUARFenMy_B2I-PAPPwfbRw",
//   authDomain: "attendence-ct.firebaseapp.com",
//   projectId: "attendence-ct",
//   storageBucket: "attendence-ct.firebasestorage.app",
//   messagingSenderId: "29326093701",
//   appId: "1:29326093701:web:6371df391cbb915f5b68ec",
//   measurementId: "G-1TJS8FTX96"
// };

const firebaseConfig = {
  apiKey: "AIzaSyCMOoqTkKoL1lXHxKxJcf8SfODIwtDQQTI",
  authDomain: "cuet-swe.firebaseapp.com",
  projectId: "cuet-swe",
  storageBucket: "cuet-swe.firebasestorage.app",
  messagingSenderId: "69060700428",
  appId: "1:69060700428:web:56a665a0b27bb1d75e0129",
  measurementId: "G-8S18PPC4K2"
};

// Avoid re-initializing if already initialized
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Auth with React Native persistence
// Use try-catch to handle case where auth is already initialized
let auth:Auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(reactNativeAsyncStorage),
  });
} catch (error: any) {
  // If auth is already initialized, get the existing instance
  if (error.code === 'auth/already-initialized') {
    auth = getAuth(app);
  } else {
    throw error;
  }
}
export { auth };


// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);