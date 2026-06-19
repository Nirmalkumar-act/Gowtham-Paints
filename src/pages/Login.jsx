/* ============================================
   LOGIN PAGE - Gowtham Paints (Exact Mockup Match)
   ============================================ */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  signInWithGoogle,
  loginWithEmail,
  registerWithEmail
} from '../services/firebase';
import { validators } from '../utils/validators';
import { FiEye, FiEyeOff, FiAlertCircle, FiCheck, FiMail, FiLock, FiUser, FiAward, FiSettings, FiShield } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { FaPaintRoller } from 'react-icons/fa';
import './Login.css';
import logo from '../assets/logo.png';

const Login = () => {
  const navigate = useNavigate();
  const { currentUser, loading } = useAuth();

  const [role, setRole] = useState('user');
  const [mode, setMode] = useState('login');
  const isLoggingIn = useRef(false); // Prevents useEffect redirect race condition
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    // Only auto-redirect if the user was ALREADY logged in when they arrived.
    // If isLoggingIn is true, our login handlers will handle the redirect via window.location.href.
    if (!loading && currentUser && !isLoggingIn.current) {
      window.location.href = '/';
    }
  }, [currentUser, loading]);

  const getFriendlyErrorMessage = (errorString) => {
    if (!errorString) return 'An unknown error occurred.';
    if (errorString.includes('auth/email-already-in-use')) return 'This email is already registered. Please log in.';
    if (errorString.includes('auth/invalid-credential') || errorString.includes('auth/wrong-password')) return 'Invalid email or password.';
    if (errorString.includes('auth/user-not-found')) return 'No user found with this email.';
    if (errorString.includes('auth/weak-password')) return 'Password is too weak.';
    if (errorString.includes('auth/network-request-failed')) return 'Network error.';
    return errorString;
  };

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'name':
        error = validators.name.validate(value);
        break;
      case 'email':
        error = validators.email.validate(value);
        break;
      case 'password':
        if (mode === 'login') {
          if (!value) error = 'Password is required';
        } else {
          error = validators.password.validate(value);
        }
        break;
      case 'confirmPassword':
        error = validators.confirmPassword.validate(value, formData.password);
        break;
      default:
        break;
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setGeneralError('');

    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
      
      if (name === 'password' && touched.confirmPassword) {
        setErrors(prev => ({
          ...prev,
          confirmPassword: validators.confirmPassword.validate(formData.confirmPassword, value)
        }));
      }
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const getFieldStatusClass = (name) => {
    if (!touched[name]) return '';
    if (errors[name]) return 'error';
    return 'success';
  };

  const toggleMode = (newMode) => {
    if (mode === newMode) return;
    setMode(newMode);
    setErrors({});
    setTouched({});
    setGeneralError('');
    setSuccessMessage('');
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    setSuccessMessage('');

    const fieldsToValidate = mode === 'register'
      ? ['name', 'email', 'password', 'confirmPassword']
      : ['email', 'password'];

    const newErrors = {};
    const newTouched = {};
    let hasErrors = false;

    fieldsToValidate.forEach(field => {
      newTouched[field] = true;
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        hasErrors = true;
      }
    });

    setTouched(prev => ({ ...prev, ...newTouched }));
    setErrors(prev => ({ ...prev, ...newErrors }));

    if (hasErrors) return;

    if (role === 'admin') {
      const adminEmail = 'tamilnk145@gmail.com';
      const adminPassword = 'Nirmal12345@';

      if (mode === 'login') {
        if (formData.email !== adminEmail || formData.password !== adminPassword) {
          setGeneralError('Invalid admin credentials. Access Denied.');
          return;
        }
      }
    }

    setIsSubmitting(true);
    isLoggingIn.current = true;

    try {
      if (mode === 'login') {
        const { user, error } = await loginWithEmail(formData.email, formData.password);
        if (error) {
          if (role === 'admin' && formData.email === 'tamilnk145@gmail.com') {
            const reg = await registerWithEmail(formData.email, formData.password, "Gowtham Admin");
            if (!reg.error) {
              setSuccessMessage('Admin Initialized! Redirecting...');
              setTimeout(() => navigate('/admin/bookings'), 1000);
              return;
            }
          }
          setGeneralError(getFriendlyErrorMessage(error));
        } else if (user) {
          // Full page reload triggers the splash screen in App.jsx
          if (role === 'admin') {
            window.location.href = '/admin/bookings';
          } else {
            window.location.href = '/';
          }
          return; // prevent finally block from resetting isSubmitting
        }
      } else {
        const { user, error } = await registerWithEmail(
          formData.email,
          formData.password,
          formData.name
        );
        if (error) {
          setGeneralError(getFriendlyErrorMessage(error));
        } else if (user) {
          window.location.href = '/';
          return;
        }
      }
    } catch (err) {
      setGeneralError('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGeneralError('');
    setIsSubmitting(true);
    isLoggingIn.current = true;
    try {
      const { user, error } = await signInWithGoogle();
      if (error) {
        setGeneralError(getFriendlyErrorMessage(error));
      } else if (user) {
        window.location.href = '/';
        return;
      }
    } catch (err) {
      setGeneralError('Google Sign-In failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="login-page" style={{ alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className={`login-page ${mode === 'login' ? 'layout-login' : 'layout-signup'}`}>
      
      {/* Branding Side (Left on Desktop) */}
      <div className="login-branding">
        {/* The uploaded background images already contain all text, logos, and badges. */}
      </div>

      {/* Form Side (Right on Desktop) */}
      <div className="login-form-wrapper">
        <div className="login-form-container">
          <div className="form-content-inner">
            
            {/* Logo */}
            <div className="form-logo" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <img src={logo} alt="Gowtham Paints" style={{ height: '100px', width: 'auto', margin: '0 auto', display: 'block' }} />
            </div>

            {/* Header */}
            <div className="login-header">
              <h2>{mode === 'login' ? 'Welcome Back!' : 'Create Account'}</h2>
              <p>{mode === 'login' ? 'Sign in to continue to your account' : 'Fill in the details to get started'}</p>
            </div>

            {/* Alerts */}
            {generalError && (
              <div className="login-alert error">
                <FiAlertCircle size={16} />
                <span>{generalError}</span>
              </div>
            )}
            {successMessage && (
              <div className="login-alert success">
                <FiCheck size={16} />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Form */}
            <form className="login-form" onSubmit={handleSubmit} noValidate>
              
              <div className={mode === 'register' ? 'form-grid' : ''}>
                
                {mode === 'register' && (
                  <div className="form-group">
                    <div className="input-wrapper">
                      <FiUser className="input-icon" />
                      <input
                        type="text"
                        name="name"
                        className={`form-input ${getFieldStatusClass('name')}`}
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        autoComplete="name"
                      />
                    </div>
                    {errors.name && <p className="form-error">{errors.name}</p>}
                  </div>
                )}

                <div className={`form-group ${mode === 'login' ? 'full-width' : ''}`}>
                  <div className="input-wrapper">
                    <FiMail className="input-icon" />
                    <input
                      type="email"
                      name="email"
                      className={`form-input ${getFieldStatusClass('email')}`}
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      autoComplete="email"
                    />
                  </div>
                  {errors.email && <p className="form-error">{errors.email}</p>}
                </div>

                <div className={`form-group ${mode === 'login' ? 'full-width' : ''}`}>
                  <div className="input-wrapper">
                    <FiLock className="input-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      className={`form-input ${getFieldStatusClass('password')}`}
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  {errors.password && <p className="form-error">{errors.password}</p>}
                </div>

                {mode === 'register' && (
                  <div className="form-group">
                    <div className="input-wrapper">
                      <FiLock className="input-icon" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        className={`form-input ${getFieldStatusClass('confirmPassword')}`}
                        placeholder="Confirm Password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="form-error">{errors.confirmPassword}</p>}
                  </div>
                )}
              </div>

              {mode === 'login' ? (
                <div className="form-extras">
                  <label className="checkbox-group">
                    <input type="checkbox" />
                    <span>Remember me</span>
                  </label>
                  <span className="forgot-password" style={{cursor: 'pointer'}} onClick={() => {}}>
                    Forgot Password?
                  </span>
                </div>
              ) : (
                <div className="form-extras" style={{ marginTop: '0.5rem' }}>
                  <label className="checkbox-group">
                    <input type="checkbox" required />
                    <span>I agree to the <span className="terms-text">Terms & Conditions</span> and <span className="terms-text">Privacy Policy</span></span>
                  </label>
                </div>
              )}

              <button type="submit" className="login-submit" disabled={isSubmitting}>
                {isSubmitting ? <span className="spinner"></span> : (mode === 'login' ? 'Sign In' : 'Create Account')}
              </button>
            </form>

            {/* Social Divider */}
            {role === 'user' && (
              <div className="login-divider">
                <span>or continue with</span>
              </div>
            )}

            {/* Social Button */}
            {role === 'user' && (
              <button type="button" className="google-btn" onClick={handleGoogleSignIn} disabled={isSubmitting}>
                <FcGoogle size={20} />
                Continue with Google
              </button>
            )}

            {/* Footer */}
            {role === 'user' && (
              <div className="login-footer">
                {mode === 'login' ? (
                  <p>Don't have an account? <span onClick={() => toggleMode('register')}>Sign Up</span></p>
                ) : (
                  <p>Already have an account? <span onClick={() => toggleMode('login')}>Sign In</span></p>
                )}
              </div>
            )}

            {/* Admin Toggle (Hidden/Secret for clean UI) */}
            <div style={{ position: 'absolute', bottom: -30, right: 0 }}>
              <button style={{background:'transparent', border:'none', color:'#ccc', fontSize:'10px', cursor:'pointer'}} onClick={() => setRole(role === 'admin' ? 'user' : 'admin')}>
                {role === 'admin' ? 'Exit Admin Mode' : 'Admin'}
              </button>
            </div>
            {role === 'admin' && (
              <div style={{ textAlign: 'center', marginTop: '1rem', color: '#ef4444', fontSize: '0.8rem', fontWeight: 'bold' }}>
                ADMIN LOGIN MODE
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
