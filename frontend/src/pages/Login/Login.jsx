import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, LogIn, Sparkles, AlertCircle, X, KeyRound, ShieldAlert } from 'lucide-react';
import { toast } from 'react-toastify';
import authService from '../../services/authService';
import styles from './Login.module.css';

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Forgot password modal states
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1: Send OTP, 2: Reset Password
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [isResetLoading, setIsResetLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please fill in both fields.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await login(email, password);
      toast.success('Welcome back! Successfully logged in.');
      navigate('/'); // Redirect to dashboard upon successful login
    } catch (err) {
      console.error('Login error:', err);
      const errorMsg = err.response?.data?.error || 'Invalid credentials. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      setResetError('Please enter your email address.');
      return;
    }
    setIsResetLoading(true);
    setResetError('');
    try {
      const response = await authService.forgotPassword(resetEmail);
      toast.success(response.message || 'OTP sent! Please check the terminal output for the OTP code.');
      setResetStep(2);
    } catch (err) {
      setResetError(err.response?.data?.error || 'Failed to request password reset OTP.');
    } finally {
      setIsResetLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!resetOtp.trim() || !newPassword.trim()) {
      setResetError('Please enter the OTP and your new password.');
      return;
    }
    setIsResetLoading(true);
    setResetError('');
    try {
      const response = await authService.resetPassword(resetEmail, resetOtp, newPassword);
      toast.success(response.message || 'Password updated successfully! You can log in now.');
      setIsResetModalOpen(false);
      setResetStep(1);
      setResetEmail('');
      setResetOtp('');
      setNewPassword('');
    } catch (err) {
      setResetError(err.response?.data?.error || 'Failed to reset password.');
    } finally {
      setIsResetLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={`${styles.authCard} scale-in`}>
        <div className={styles.header}>
          <div className={styles.logoBadge}>
            <Sparkles className={styles.logoIcon} />
          </div>
          <h1 className={styles.title}>Welcome back!</h1>
          <p className={styles.subtitle}>Log in to access your student registry database</p>
        </div>

        {error && (
          <div className={`${styles.errorAlert} fade-in`}>
            <AlertCircle className={styles.errorIcon} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>Email Address</label>
            <div className={styles.inputWrapper}>
              <Mail className={styles.inputIcon} />
              <input
                type="email"
                id="email"
                placeholder="admin@eduportal.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                className={styles.input}
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <div className={styles.inputWrapper}>
              <Lock className={styles.inputIcon} />
              <input
                type="password"
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className={styles.input}
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <div className={styles.forgotContainer}>
            <button 
              type="button" 
              onClick={() => {
                setIsResetModalOpen(true);
                setResetStep(1);
                setResetError('');
              }} 
              className={styles.forgotLink}
            >
              Forgot Password?
            </button>
          </div>

          <button type="submit" className={styles.btnSubmit} disabled={isLoading}>
            {isLoading ? (
              <div className={styles.spinner} />
            ) : (
              <>
                <LogIn className={styles.btnIcon} />
                <span>Log In Session</span>
              </>
            )}
          </button>
        </form>

        <div className={styles.footer}>
          <span>New administrator?</span>{' '}
          <Link to="/register" className={styles.link}>
            Create Admin Profile
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal Overlay */}
      {isResetModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsResetModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button 
              type="button" 
              className={styles.modalCloseBtn} 
              onClick={() => setIsResetModalOpen(false)}
            >
              <X size={16} />
            </button>

            <div className={styles.header}>
              <div className={styles.logoBadge} style={{ background: 'linear-gradient(135deg, var(--warning) 0%, hsl(38, 92%, 40%) 100%)' }}>
                <KeyRound className={styles.logoIcon} />
              </div>
              <h2 className={styles.title}>Password Recovery</h2>
              <p className={styles.subtitle}>
                {resetStep === 1 
                  ? 'Request a 6-digit verification code to recover credentials' 
                  : 'Enter verification OTP and your new secure password'}
              </p>
            </div>

            {resetError && (
              <div className={styles.errorAlert}>
                <ShieldAlert className={styles.errorIcon} />
                <span>{resetError}</span>
              </div>
            )}

            {resetStep === 1 ? (
              <form onSubmit={handleForgotSubmit} className={styles.form}>
                <div className={styles.inputGroup}>
                  <label htmlFor="resetEmail" className={styles.label}>Registered Email Address</label>
                  <div className={styles.inputWrapper}>
                    <Mail className={styles.inputIcon} />
                    <input
                      type="email"
                      id="resetEmail"
                      placeholder="admin@eduportal.com"
                      value={resetEmail}
                      onChange={(e) => {
                        setResetEmail(e.target.value);
                        setResetError('');
                      }}
                      className={styles.input}
                      disabled={isResetLoading}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className={styles.btnSubmit} disabled={isResetLoading}>
                  {isResetLoading ? <div className={styles.spinner} /> : 'Send Recovery OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetSubmit} className={styles.form}>
                <div className={styles.inputGroup}>
                  <label htmlFor="resetOtp" className={styles.label}>6-Digit OTP Code</label>
                  <div className={styles.inputWrapper}>
                    <Lock className={styles.inputIcon} />
                    <input
                      type="text"
                      id="resetOtp"
                      placeholder="123456"
                      maxLength="6"
                      value={resetOtp}
                      onChange={(e) => {
                        setResetOtp(e.target.value);
                        setResetError('');
                      }}
                      className={styles.input}
                      disabled={isResetLoading}
                      required
                    />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="newPassword" className={styles.label}>New Secure Password</label>
                  <div className={styles.inputWrapper}>
                    <Lock className={styles.inputIcon} />
                    <input
                      type="password"
                      id="newPassword"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setResetError('');
                      }}
                      className={styles.input}
                      disabled={isResetLoading}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className={styles.btnSubmit} disabled={isResetLoading}>
                  {isResetLoading ? <div className={styles.spinner} /> : 'Reset My Password'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
