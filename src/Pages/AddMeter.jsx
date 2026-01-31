import React, { useState } from 'react';
import GoBack from '../Components/GoBack';

export default function Add() {
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const getAuthToken = () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setError(true);
      setErrorMessage('You are not authenticated. Please log in.');
      return null;
    }
    return token;
  };

  const [formData, setFormData] = useState({
    meterSrNo: '',
    yearOfManufacture: '',
    initialAccumulatedFlow: '',
    manufacturerName: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = getAuthToken();
    if (!token) return;

    try {
      const response = await fetch(`/data/meter/add`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        alert('Data submitted successfully');
      } else {
        alert('Submission failed');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred');
    }
  };

  return (
    <div className="container mt-4">
      <div className=" mt-4">
        <GoBack />
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="d-flex flex-column align-items-center">
        <div className="card col-md-5 mb-4 p-4 shadow-sm card-custom-border ">
          <div className="col-md-15 mb-3">
            <label htmlFor="meterSrNo" className="label-headingl">
              Meter Serial No.
            </label>
            <input
              type="text"
              className="input-text input-tight"
              id="meterSrNo"
              value={formData.meterSrNo}
              onChange={handleChange}
              style={{ borderColor: '#7C3AED' }}
            />
          </div>

          <div className="col-md-15 mb-3">
            <label htmlFor="yearOfManufacture" className="label-heading">
              Year of Manufacture
            </label>
            <input
              type="text"
              className="input-text input-tight"
              id="yearOfManufacture"
              value={formData.yearOfManufacture}
              onChange={handleChange}
              style={{ borderColor: '#7C3AED' }}
            />
          </div>

          <div className="col-md-15 mb-3">
            <label htmlFor="initialAccumulatedFlow" className="label-heading">
              Initial Accumulated Flow (m³)
            </label>
            <input
              type="text"
              className="input-text input-tight"
              id="initialAccumulatedFlow"
              value={formData.initialAccumulatedFlow}
              onChange={handleChange}
              style={{ borderColor: '#7C3AED' }}
            />
          </div>

          <div className="col-md-15 mb-3">
            <label htmlFor="manufacturerName" className="label-heading">
              Manufacturer Name
            </label>
            <input
              type="text"
              className="input-text input-tight"
              id="manufacturerName"
              value={formData.manufacturerName}
              onChange={handleChange}
              style={{ borderColor: '#7C3AED' }}
            />
          </div>

          <div className="text-center">
            <button type="submit" className="submit-buttons">
              Submit
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
