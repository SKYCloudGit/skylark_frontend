import React, { useState } from 'react';
import { TrendingUp, Zap, Wifi, Droplets, Mail, Lock, User, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Signup.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    userName: '',
    firstName: '',
    secondName: '',
    emailAddress: '',
    phoneNumber: '',
    password: '',
    cpassword: '',
    userRole: 'customer',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [currentUsage] = useState(1234.5);
  const [isOnline] = useState(true);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // ✅ Allow only digits in phone number
    if (name === 'phoneNumber') {
      if (!/^\d*$/.test(value)) return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // ✅ Phone number validation (10 digits)
    if (!/^\d{10}$/.test(formData.phoneNumber)) {
      setError('❌ Phone number must be exactly 10 digits.');
      setLoading(false);
      return;
    }

    // ✅ Password strength validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError(
        '❌ Password must be at least 8 characters, include uppercase, lowercase, number, and special character.'
      );
      setLoading(false);
      return;
    }

    // ✅ Confirm password validation
    if (formData.password !== formData.cpassword) {
      setError('❌ Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`/auth/signup`, formData, {});
      if (response.status === 200 || response.status === 201) {
        alert('Signup successful ✅');
        navigate('/');
      } else {
        setError('❌ Signup failed.');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError('❌ Error during signup.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Left panel */}
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

      {/* Right panel */}
      <div className="login-right-panel">
        <div className="login-form-container">
          <div className="login-header">
            <h2 className="login-title">Create Account</h2>
            <p className="login-subtitle">Join the smart water management platform</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-grid">
              <div className="form-group full-width">
                <label className="form-label">Username</label>
                <div className="input-wrapper">
                  <User className="input-icon" />
                  <input
                    type="text"
                    name="userName"
                    value={formData.userName}
                    onChange={handleChange}
                    placeholder="Enter username"
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">First Name</label>
                <div className="input-wrapper">
                  <User className="input-icon" />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="First name"
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Second Name</label>
                <div className="input-wrapper">
                  <User className="input-icon" />
                  <input
                    type="text"
                    name="secondName"
                    value={formData.secondName}
                    onChange={handleChange}
                    placeholder="Second name"
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" />
                  <input
                    type="email"
                    name="emailAddress"
                    value={formData.emailAddress}
                    onChange={handleChange}
                    placeholder="Enter email"
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <div className="input-wrapper">
                  <Phone className="input-icon" />
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="Enter phone"
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" />
                  <input
                    type="password"
                    name="cpassword"
                    value={formData.cpassword}
                    onChange={handleChange}
                    placeholder="Confirm password"
                    className="form-input"
                    required
                  />
                </div>
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Creating...' : 'Sign Up'}
            </button>
          </form>

          <div className="login-footer">
            <p className="footer-text">
              Already have account?
              <a href="/" className="signup-link">
                {' '}
                Login here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
