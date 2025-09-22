import React, { useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../Services/api';
import './AddUser.css';
import GoBack from '../Components/GoBack';

const AddUser = () => {
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
  const [message, setMessage] = useState({ type: '', text: '' });

  const getAuthToken = () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('You are not authenticated. Please log in.');
      return null;
    }
    return token;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validatePassword = (password) => {
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{6,}$/;
    return regex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }

    // Validation
    if (formData.password !== formData.cpassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      setLoading(false);
      return;
    }

    if (!validatePassword(formData.password)) {
      setMessage({
        type: 'error',
        text: 'Password must include at least 1 uppercase letter, 1 number, and 1 special character.',
      });
      setLoading(false);
      return;
    }

    // Prepare payload (exclude confirm password)
    const payload = {
      userName: formData.userName,
      firstName: formData.firstName,
      secondName: formData.secondName,
      emailAddress: formData.emailAddress,
      phoneNumber: formData.phoneNumber,
      password: formData.password,
      userRole: formData.userRole,
    };

    try {
      const response = await axios.post(`/api/auth/user`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setMessage({ type: 'success', text: 'User added successfully!' });
      setFormData({
        userName: '',
        firstName: '',
        secondName: '',
        emailAddress: '',
        phoneNumber: '',
        password: '',
        cpassword: '',
        userRole: 'customer',
      });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to add user.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {' '}
      <div className="d-flex justify-content-between align-items-center mb-2 mt-5">
        <GoBack />
      </div>
      <div
        className="container d-flex justify-content-center align-items-center min-vh-20"
        style={{ marginTop: '20px' }}
      >
        <div className="col-md-8 col-lg-6 shadow p-3 rounded bg-white">
          <h4 className="mb-2 text-center text-brand">Add New User</h4>

          {message.text && (
            <div
              className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'}`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="row mb-2">
              <div className="col">
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>
              <div className="col">
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  name="secondName"
                  value={formData.secondName}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>
            </div>

            <div className="row mb-4">
              <div className="col">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  name="userName"
                  value={formData.userName}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="col">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  name="emailAddress"
                  value={formData.emailAddress}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="example@domain.com"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                name="cpassword"
                value={formData.cpassword}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label">User Role</label>
              <select
                name="userRole"
                value={formData.userRole}
                onChange={handleChange}
                className="form-select"
              >
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? 'Adding User...' : 'Add User'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddUser;
