import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import './MeterMap.css';
import CustomDropdown from '../Components/CustomDropdown';
import MultiCustomDropdown from '../Components/MultiCustomDropdown';
import ErrorModal from '../Components/ErrorModal';
import SuccessModal from '../Components/SuccessModal';
import { useModulePermissions } from '../hooks/useModulePermissions';
import { BASE_URL } from '../Services/api';

const MeterMap = () => {
  const [titles, setTitles] = useState([]);
  const [dropdownOptions, setDropdownOptions] = useState({});
  const [hierarchy, setHierarchy] = useState([]);
  const [meters, setMeters] = useState([]);
  const [error, setError] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [consumerId, setConsumerId] = useState('');
  const [address, setAddress] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const { canWrite } = useModulePermissions();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    can: '',
    email: '',
    street: '',
    area: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    consumerId: '',
    meterId: [],
  });

  const getAuthToken = () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('You are not authenticated. Please log in.');
      return null;
    }
    return token;
  };

  useEffect(() => {
    const fetchTitles = async () => {
      const token = getAuthToken();
      if (!token) return;

      try {
        const response = await fetch(`/hierarchy/titles/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        let data = await response.json();

        data = data.filter((t) => t && t.title && t.title.trim());

        setTitles(data);
        buildHierarchyPath(data);
      } catch (error) {
        setErrorMessage('❌ Failed to fetch hierarchy titles.');
        setError(true);
      }
    };

    fetchTitles();
  }, []);

  const fetchHierarchyData = async (hierarchyTitleId, parentId = null) => {
    const token = getAuthToken();
    if (!token) return [];

    try {
      const response = await fetch(
        `/hierarchy/data/titleId=${hierarchyTitleId}${parentId ? `/parentId=${parentId}` : ''}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      return await response.json();
    } catch (error) {
      setErrorMessage('❌ Failed to fetch hierarchy data.');
      setError(true);
      return [];
    }
  };

  const buildHierarchyPath = async (titlesData) => {
    const idMap = new Map();
    const childMap = new Map();
    const visited = new Set();
    const ordered = [];
    const options = {};

    titlesData.forEach((title) => {
      idMap.set(title.id, title);
      const parent = title.parentTitleId || null;
      if (!childMap.has(parent)) {
        childMap.set(parent, []);
      }
      childMap.get(parent).push(title);
    });

    const dfs = async (node) => {
      if (visited.has(node.id)) return;
      visited.add(node.id);

      const dropdownData = await fetchHierarchyData(node.id);
      options[node.id] = dropdownData.map((item) => ({
        id: item.id,
        name: item.name,
      }));

      const children = childMap.get(node.id) || [];
      for (const child of children) {
        await dfs(child);
      }

      ordered.push(node);
    };

    const roots = childMap.get(null) || [];
    for (const root of roots) {
      await dfs(root);
    }

    setHierarchy(ordered.reverse());
    setDropdownOptions(options);
  };

  const handleParentChange = async (levelId, selectedId) => {
    setFormData((prevData) => ({
      ...prevData,
      [levelId]: selectedId,
      consumerId: selectedId,
    }));

    const nextTitleIndex = hierarchy.findIndex((item) => item.id === levelId) + 1;
    if (nextTitleIndex < hierarchy.length) {
      const nextTitle = hierarchy[nextTitleIndex];
      const nextLevelData = await fetchHierarchyData(nextTitle.id, selectedId);

      setDropdownOptions((prevOptions) => ({
        ...prevOptions,
        [nextTitle.id]: nextLevelData.map((item) => ({
          id: item.id,
          name: item.name,
        })),
      }));
    }
  };

  useEffect(() => {
    const fetchAddress = async () => {
      if (!formData.consumerId) return;

      setError('');
      setAddress(null);
      const token = getAuthToken();
      if (!token) return;

      try {
        const response = await fetch(`/data/address/consumerId=${formData.consumerId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Address not found');

        const data = await response.json();
        setAddress(data);
      } catch (err) {
        setErrorMessage('❌ Address not found or fetch failed.');
        setError(true);
      }
    };

    fetchAddress();
  }, [formData.consumerId]);

  useEffect(() => {
    const fetchMeters = async () => {
      const token = getAuthToken();
      if (!token) return;

      try {
        const response = await fetch(`/data/meter/mapped`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('Failed to fetch meters');

        const data = await response.json();
        setMeters(data);
      } catch (err) {
        setErrorMessage('❌ Failed to fetch  meters.');
        setError(true);
      }
    };

    fetchMeters();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    setPreviewOpen(true);

    const token = getAuthToken();
    if (!token) return;

    if (showForm) {
      const requiredFields = ['street', 'area', 'city', 'state', 'country', 'postalCode'];
      for (const field of requiredFields) {
        if (!formData[field] || formData[field].trim() === '') {
          return;
        }
      }
    }

    for (const title of hierarchy) {
      if (!formData[title.id] || formData[title.id].trim() === '') {
        return;
      }
    }

    const payload = {
      consumerId: formData.consumerId,
      address: {
        street: formData.street,
        area: formData.area,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        postalCode: formData.postalCode,
      },
      existingAddress: null,
      meterIds: formData.meterId,
    };

    try {
      const response = await fetch(`/data/meter/consumer/mapping`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSuccessMessage('✅ Data submitted successfully!');
        setShowSuccess(true);
        setFormData({});
        setShowForm(false);
      } else {
        setErrorMessage('❌ Failed to submit data.');
        setError(true);
      }
    } catch (error) {
      setErrorMessage('❌ Network error during submission.');
      setError(true);
    }
  };

  return (
    <div className="container mt-4">
      <h4 className="screen-headings">Meter Mapping</h4>
      <p className="text-muted">
        Map meters by selecting hierarchy and entering customer address details.
      </p>
      <hr className="mb-4" />

      <form onSubmit={handleSubmit} noValidate>
        <div className="row g-4">
          <div className="col-md-6">
            <div className="card border-0 shadow-sm p-4 h-100">
              <h5 className="form-headings">🏷️ Hierarchy Selection</h5>
              {hierarchy.map((title, index) => {
                const value = formData[title.id] || '';
                const showError = formSubmitted && (!value || value.trim() === '');
                return (
                  <div className="mb-3" key={title.id}>
                    <label className="label-heading ">{title.title}</label>
                    <CustomDropdown
                      isScrollable
                      options={dropdownOptions[title.id] || []}
                      value={value}
                      onChange={(val) => handleParentChange(title.id, val)}
                      displayKey="name"
                      placeholder={`Select ${title.title}`}
                      showError={showError}
                    />
                    {showError && (
                      <div className="invalid-feedback d-block">Please select {title.title}.</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="col-md-6">
            <div className="d-flex justify-content-end mb-3">
              <button
                type="button"
                className="form-open-buttons"
                onClick={() => setShowForm(!showForm)}
              >
                {showForm ? 'Hide Address Form' : '➕ Add Address'}
              </button>
            </div>

            {showForm && (
              <div className="card border-0 shadow-sm p-4 mb-4">
                <h5 className="form-headings">🏠 Address Details</h5>
                <div className="row g-3">
                  {['street', 'area', 'city', 'state', 'country', 'postalCode'].map((field) => (
                    <div className="col-md-6" key={field}>
                      <label htmlFor={field} className="label-heading">
                        {field.charAt(0).toUpperCase() + field.slice(1)}
                      </label>
                      <input
                        type="text"
                        id={field}
                        className={`dropdowns input-tight${
                          formSubmitted && !formData[field] ? 'is-invalid' : ''
                        }`}
                        style={{ marginTop: '0.02rem' }}
                        value={formData[field] || ''}
                        onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                      />
                      {formSubmitted && !formData[field] && (
                        <div className="invalid-feedback">Please fill out this field.</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="card border-0 shadow-sm p-4">
              <h5 className="form-headings">📟 Meter Selection</h5>
              <label htmlFor="meterId" className="form-label fw-semibold">
                Meter Serial Number
              </label>

              <MultiCustomDropdown
                options={meters.map((meter) => ({
                  id: meter.id,
                  title: meter.meterSrNo,
                }))}
                value={formData.meterId}
                onChange={(selectedIds) =>
                  setFormData({
                    ...formData,
                    meterId: selectedIds,
                  })
                }
                placeholder="Select Meter(s)..."
                isScrollable
                showError={formSubmitted && (!formData.meterId || formData.meterId.length === 0)}
              />

              {formSubmitted && (!formData.meterId || formData.meterId.length === 0) && (
                <div className="invalid-feedback d-block">Please select Meter(s).</div>
              )}
            </div>
          </div>
        </div>

        {address && address.length > 0 && (
          <div className="mt-5">
            <h5 className="mb-3 text-dark">📋 Existing Address</h5>
            <div className="row g-3">
              {address.map((addr) => (
                <div key={addr.id} className="col-md-6">
                  <div className="p-3 rounded shadow-sm bg-light border">
                    <span className="badge bg-secondary mb-2">{addr.addressType}</span>
                    <p className="mb-1 fw-bold">{addr.street}</p>
                    <p className="mb-1">
                      {addr.city}, {addr.state}, {addr.postalCode}
                    </p>
                    <p className="mb-0">{addr.country}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="d-flex justify-content-start gap-3 mt-4">
          <button type="submit" disabled={!canWrite('Meter Mapping')} className="save-button">
            💾 Save
          </button>
          <button type="button" className="clear-button" onClick={() => setFormData({})}>
            🔄 Clear
          </button>
        </div>
      </form>
      <SuccessModal
        show={showSuccess}
        onClose={() => setShowSuccess(false)}
        message={successMessage}
      />

      <ErrorModal show={error} onClose={() => setError(false)} message={errorMessage} />
    </div>
  );
};

export default MeterMap;
