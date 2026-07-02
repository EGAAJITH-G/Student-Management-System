import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Lock, UserPlus, Sparkles, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import styles from './Register.module.css';

const Register = () => {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('admin'); // Default to admin for convenient testing
  const [secretKey, setSecretKey] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username.trim() || !email.trim() || !password.trim()) {
      const errorMsg = 'Please fill in all required fields.';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    if (password.length < 6) {
      const errorMsg = 'Password must be at least 6 characters.';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    if (password !== confirmPassword) {
      const errorMsg = 'Passwords do not match.';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    if ((role === 'admin' || role === 'staff') && !secretKey.trim()) {
      const errorMsg = 'Please enter the registration security code.';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await register(username, email, password, role, secretKey);
      toast.success('Profile Created Successfully! Welcome to EduPortal.');
      navigate('/'); // Redirect to dashboard upon successful registration
    } catch (err) {
      console.error('Registration error:', err);
      const errorMsg = err.response?.data?.error || 'Registration failed. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={`${styles.authCard} scale-in`}>
        <div className={styles.header}>
          <div className={styles.logoBadge}>
            <Sparkles className={styles.logoIcon} />
          </div>
          <h1 className={styles.title}>Create Admin Profile</h1>
          <p className={styles.subtitle}>Register to manage students and view enrollment data</p>
        </div>

        {error && (
          <div className={`${styles.errorAlert} fade-in`}>
            <AlertCircle className={styles.errorIcon} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="username" className={styles.label}>Username</label>
            <div className={styles.inputWrapper}>
              <User className={styles.inputIcon} />
              <input
                type="text"
                id="username"
                placeholder="e.g. admin_doe"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError('');
                }}
                className={styles.input}
                disabled={isLoading}
                required
              />
            </div>
          </div>

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
                placeholder="Min 6 characters"
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

          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>Confirm Password</label>
            <div className={styles.inputWrapper}>
              <Lock className={styles.inputIcon} />
              <input
                type="password"
                id="confirmPassword"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError('');
                }}
                className={styles.input}
                disabled={isLoading}
                required
              />
            </div>
          </div>

          {/* Administrative Role Selection */}
          <div className={styles.inputGroup}>
            <label htmlFor="role" className={styles.label}>Administrative Role</label>
            <div className={styles.inputWrapper}>
              <User className={styles.inputIcon} />
              <select
                id="role"
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                  setSecretKey(''); // Reset secret key when switching roles
                  setError('');
                }}
                className={styles.input}
                style={{ paddingLeft: '2.5rem', cursor: 'pointer' }}
                disabled={isLoading}
              >
                <option value="admin">Admin (Full Access)</option>
                <option value="staff">Staff (Edit Only)</option>
                <option value="student">Student (View Only)</option>
              </select>
            </div>
          </div>

          {/* Registration Security Code (Admin/Staff only) */}
          {(role === 'admin' || role === 'staff') && (
            <div className={styles.inputGroup}>
              <label htmlFor="secretKey" className={styles.label}>Registration Security Key</label>
              <div className={styles.inputWrapper}>
                <Lock className={styles.inputIcon} />
                <input
                  type="password"
                  id="secretKey"
                  placeholder="Enter administrative security key"
                  value={secretKey}
                  onChange={(e) => {
                    setSecretKey(e.target.value);
                    setError('');
                  }}
                  className={styles.input}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>
          )}

          <button type="submit" className={styles.btnSubmit} disabled={isLoading}>
            {isLoading ? (
              <div className={styles.spinner} />
            ) : (
              <>
                <UserPlus className={styles.btnIcon} />
                <span>Create Admin Profile</span>
              </>
            )}
          </button>
        </form>

        <div className={styles.footer}>
          <span>Already have an account?</span>{' '}
          <Link to="/login" className={styles.link}>
            Log In here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
