/* ============================================
   GOWTHAM PAINTS - Firebase Configuration
   ============================================ */

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  EmailAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
  updateProfile,
  fetchSignInMethodsForEmail,
  linkWithCredential
} from 'firebase/auth';

// Firebase config - Replace with your own Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyDR46Qcych63izyyXDa832YDdiVjy4TUzw",
  authDomain: "gowtham-paints.firebaseapp.com",
  projectId: "gowtham-paints",
  storageBucket: "gowtham-paints.firebasestorage.app",
  messagingSenderId: "309878881884",
  appId: "1:309878881884:web:088cb379c011729116b099",
  measurementId: "G-X6THL6NXZV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Set persistence to LOCAL - user stays logged in even after closing browser
setPersistence(auth, browserLocalPersistence);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');

// Auth Functions
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { user: result.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

export const loginWithEmail = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { user: result.user, error: null };
  } catch (error) {
    let message = 'Login failed. Please try again.';
    if (error.code === 'auth/user-not-found') message = 'No account found with this email. Please Sign Up first.';
    if (error.code === 'auth/wrong-password') message = 'Incorrect password. Please try again.';
    if (error.code === 'auth/invalid-email') message = 'Invalid email address';
    if (error.code === 'auth/too-many-requests') message = 'Too many attempts. Please try again later.';
    if (error.code === 'auth/invalid-credential') {
      // Check if this email was registered via Google
      try {
        const methods = await fetchSignInMethodsForEmail(auth, email);
        if (methods.includes('google.com') && !methods.includes('password')) {
          message = 'This account was created with Google Sign-In. Please use "Continue with Google" to login, or Sign Up first to add a password.';
        } else if (methods.length === 0) {
          message = 'No account found with this email. Please Sign Up first.';
        } else {
          message = 'Incorrect password. Please try again.';
        }
      } catch (e) {
        message = 'Invalid email or password. If you signed up with Google, please use "Continue with Google".';
      }
    }
    return { user: null, error: message };
  }
};

export const registerWithEmail = async (email, password, displayName) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName });
    return { user: result.user, error: null };
  } catch (error) {
    let message = 'Registration failed. Please try again.';
    if (error.code === 'auth/email-already-in-use') {
      // Check if the account was created via Google - if so, link the password
      try {
        const methods = await fetchSignInMethodsForEmail(auth, email);
        if (methods.includes('google.com') && !methods.includes('password')) {
          // Account exists via Google - sign in with Google first, then link email/password
          try {
            const googleResult = await signInWithPopup(auth, googleProvider);
            const credential = EmailAuthProvider.credential(email, password);
            await linkWithCredential(googleResult.user, credential);
            if (displayName) {
              await updateProfile(googleResult.user, { displayName });
            }
            return { user: googleResult.user, error: null };
          } catch (linkError) {
            if (linkError.code === 'auth/provider-already-linked') {
              message = 'Password already set for this account. Please Sign In instead.';
            } else {
              message = 'Please sign in with Google first, then you can add a password from your profile.';
            }
          }
        } else {
          message = 'An account already exists with this email. Please Sign In instead.';
        }
      } catch (e) {
        message = 'An account already exists with this email. Please Sign In instead.';
      }
    }
    if (error.code === 'auth/weak-password') message = 'Password is too weak (minimum 6 characters)';
    if (error.code === 'auth/invalid-email') message = 'Invalid email address';
    return { user: null, error: message };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

export { auth, onAuthStateChanged };
export default app;

