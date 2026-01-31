import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Droplets, Mail, Lock, TrendingUp, Zap, Wifi } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../Services/api';
import axios from 'axios';
import './Login.css';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [currentUsage, setCurrentUsage] = useState(1234.5);
  const [isOnline] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Simulated online meter status animation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentUsage((prev) => prev + Math.random() * 0.5);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Submit: Direct Login (CAPTCHA bypassed)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Direct login, CAPTCHA removed
      const loginRes = await axios.post(
        `/auth/login`,
        {
          username: email,
          password: password,
        },
        { withCredentials: true } // 🔑 important for JSESSIONID
      );

      if (!(loginRes.status === 200 && loginRes.data?.access_token)) {
        setError('❌ Invalid credentials. Please check your email and password.');
        setLoading(false);
        return;
      }

      // Store token + userId if needed
      localStorage.setItem('authToken', loginRes.data.access_token);
      if (loginRes.data.userId) {
        localStorage.setItem('userId', loginRes.data.userId);
      }

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Error during login:', err);
      setError('❌ Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <div className="login-container">
      {/* left panel with branding and animation */}
      <div className="login-left-panel">
        <div className="login-brand">
          <div className="login-logo">
            <Droplets className="logo-icon" />
            <h1 className="logo-text">Skylark</h1>
          </div>
          <p className="brand-tagline">Advanced Water management Platform</p>
          <p className="brand-subtitle">Where Innovation Meets Conservation</p>
        </div>

        <div className="login-illustration">
          <div className="monitoring-dashboard">
            <div className="dashboard-header">
              <div className="status-indicator">
                <div className={`status-dot ${isOnline ? 'online' : 'offline'}`}></div>
                <span className="status-text">
                  {isOnline ? 'All Meters Online' : 'Connecting...'}
                </span>
              </div>
              <Wifi className="wifi-icon" />
            </div>

            <div className="smart-meter">
              <div className="meter-circle">
                <div className="meter-inner">
                  <div className="meter-display">
                    <span className="meter-reading">{currentUsage.toFixed(1)}</span>
                    <span className="meter-unit">Litres</span>
                  </div>
                  <div className="meter-pulse"></div>
                </div>
              </div>
              <div className="meter-label">Readings</div>
            </div>

            <div className="week-grid mb-4">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => {
                const usage = [85, 92, 76, 88, 95, 82][index];
                const percentage = (usage / 100) * 100;
                return (
                  <div key={day} className="week-day-card">
                    <div className="week-day-label">{day}</div>
                    <div className="week-day-bar relative bg-white/20 rounded">
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-blue-400 rounded transition-all duration-300"
                        style={{ height: `${percentage}%` }}
                      ></div>
                      <div className="relative z-10 text-xs text-white font-medium pt-1 text-center">
                        {usage}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="smart-features">
              <div className="feature-card">
                <TrendingUp className="feature-icon" />
                <div className="feature-content">
                  <span className="feature-value">Smart Usage</span>
                  <span className="feature-label">Smarter Water Management</span>
                </div>
              </div>

              <div className="feature-card">
                <Zap className="feature-icon" />
                <div className="feature-content">
                  <span className="feature-value">Online Billing</span>
                  <span className="feature-label">Track. Pay. Save.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* right panel with form */}
      <div className="login-right-panel">
        <div className="login-form-container">
          <div className="login-header">
            <h2 className="login-title">Welcome Back</h2>
            <p className="login-subtitle">Access your smart water management dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {/* email */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <div className="input-wrapper">
                <Mail className="input-icon" />
                <input
                  type="text"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your username"
                  className="form-input"
                  required
                />
              </div>
            </div>

            {/* password */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="input-wrapper">
                <Lock className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="form-input"
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="password-toggle"
                  style={{ marginTop: '-35px' }}
                >
                  {showPassword ? (
                    <EyeOff className="toggle-icon" />
                  ) : (
                    <Eye className="toggle-icon" />
                  )}
                </button>
              </div>
            </div>

            {/* remember + forgot */}
            {/* <div className="form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="checkbox-input"
                />
                <span className="checkbox-custom"></span>
                Remember me
              </label>
              <Link href="/" className="forgot-password">
                Forgot password?
              </Link>
            </div> */}

            {/* errors */}
            {error && <div className="error-message">{error}</div>}

            {/* submit */}
            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Logging in...' : 'Access Dashboard'}
            </button>
          </form>

          <div className="login-footer">
            <p className="footer-text">
              New User?
              <Link to="/signup" className="signup-link">
                Create account here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
