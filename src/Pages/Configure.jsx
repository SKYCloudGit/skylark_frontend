import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './HierarchyTitle.css';
import SuccessModal from '../Components/SuccessModal';
import ErrorModal from '../Components/ErrorModal';
import { useModulePermissions } from '../hooks/useModulePermissions';
import { BASE_URL } from '../Services/api';

const Configure = () => {
  const [topic, setTopic] = useState('');
  const [payload, setPayload] = useState('');
  const [payloadInput, setPayloadInput] = useState('');
  const [selectedCommand, setSelectedCommand] = useState('');
  const [qos, setQos] = useState('0');
  const [retainRequired, setRetainRequired] = useState('true');
  const [loading, setLoading] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const [meterSrnos, setMeterSrnos] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedMeter, setSelectedMeter] = useState('');

  const dropdownRef = useRef(null);
  const { canUpdate } = useModulePermissions();

  const getAuthToken = () => localStorage.getItem('authToken');

  const commands = [
    { id: 'Change Device Time', description: '$SETRTC', requiresInput: true, inputType: 'time' },
    { id: 'Change Posting Time', description: '$SETSTM', requiresInput: true, inputType: 'time' },
    { id: 'Change Device ID', description: '$SETDID', requiresInput: true, inputType: 'deviceId' },
    { id: 'Change Server IP', description: '$SETSIP', requiresInput: true, inputType: 'ip' },
    { id: 'Change Input feed', description: '$SETSUB', requiresInput: true, inputType: 'feed' },
    { id: 'Change Output feed', description: '$SETPUB', requiresInput: true, inputType: 'feed' },
  ];

  const fetchMeters = async () => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error('No auth token found');

      const userRes = await fetch(`/api/auth/me`, {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      if (!userRes.ok) throw new Error('Failed to fetch user info');
      const userData = await userRes.json();

      const hierarchyDataId = userData?.userHierarchy[0]?.hierarchyDataId;
      if (!hierarchyDataId) throw new Error('Hierarchy DataId not found');

      const res = await axios.get(`/api/data/meter/list/hierarchyDataId=${hierarchyDataId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data && Array.isArray(res.data)) {
        setMeterSrnos(res.data.map((m) => m.meterSrNo));
      }
    } catch (err) {
      console.error('Error fetching meters:', err);
    }
  };

  useEffect(() => {
    fetchMeters();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMeterSelect = (srNo) => {
    setSelectedMeter(srNo);
    setTopic(`Device/Config/${srNo}`);
    setSearch(srNo);
    setShowDropdown(false);
  };

  const handleCommandSelect = (cmdId) => {
    setSelectedCommand(cmdId);
    const cmd = commands.find((c) => c.id === cmdId);
    setPayload(cmd?.description || '');
    setPayloadInput('');
  };

  // Input validation
  const validateInput = (value, type) => {
    switch (type) {
      case 'time':
        return /^([01]\d|2[0-3]) : [0-5]\d$/.test(value);
      case 'deviceId':
        return /^[a-zA-Z0-9]{1,8}$/.test(value);
      case 'ip':
        return /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/.test(
          value
        );
      case 'feed':
        return /^[a-zA-Z0-9:.,]+$/.test(value);
      default:
        return true;
    }
  };

  const handlePayloadInputChange = (e) => {
    const cmd = commands.find((c) => c.id === selectedCommand);
    if (!cmd) return;

    let val = e.target.value;

    switch (cmd.inputType) {
      case 'time':
        // Remove all non-digit characters
        val = val.replace(/[^0-9]/g, '');

        // Limit to 4 digits (HHMM)
        val = val.slice(0, 4);

        // Insert colon after 2 digits
        if (val.length > 2) {
          val = val.slice(0, 2) + ' : ' + val.slice(2);
        }

        break;

      case 'deviceId':
        val = val.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8);
        break;
      case 'ip':
        // Remove anything other than digits and dots
        val = val.replace(/[^0-9.]/g, '');

        // Split by existing dots
        const octets = val.split('.');

        // Limit to 4 octets
        if (octets.length > 4) octets.length = 4;

        // Ensure each octet is 0-255
        for (let i = 0; i < octets.length; i++) {
          if (octets[i] === '') continue;
          let num = parseInt(octets[i]);
          if (isNaN(num)) num = '';
          else if (num > 255) num = 255;
          octets[i] = num.toString();
        }

        // Rejoin with dots
        val = octets.join('.');
        break;

      case 'feed':
        val = val.replace(/[^a-zA-Z0-9:.,]/g, '').slice(0, 14);
        break;
      default:
        break;
    }

    setPayloadInput(val);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);

    const cmd = commands.find((c) => c.id === selectedCommand);

    if (!selectedMeter) {
      setError(true);
      setErrorMessage('❌ Please select a meter.');
      return;
    }
    if (!cmd) {
      setError(true);
      setErrorMessage('❌ Please select a command.');
      return;
    }
    if (cmd.requiresInput && !payloadInput) {
      setError(true);
      setErrorMessage('❌ Please enter a value for the command.');
      return;
    }
    if (cmd.requiresInput && !validateInput(payloadInput, cmd.inputType)) {
      setError(true);
      setErrorMessage('❌ Invalid input format.');
      return;
    }

    const finalPayload = cmd.requiresInput ? `${cmd.description} ${payloadInput}` : cmd.description;

    try {
      const token = getAuthToken();
      if (!token) {
        setError(true);
        setErrorMessage('❌ Authentication required. Please log in.');
        return;
      }

      setLoading(true);

      console.log('Sending:', { topic, finalPayload, qos, retainRequired });

      await axios.get(
        `/api/c2dmessages/publish?topic=${encodeURIComponent(topic)}&payload=${encodeURIComponent(
          finalPayload
        )}&qos=${qos}&retainRequired=${retainRequired}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setShowSuccessModal(true);

      // Reset form
      setTopic('');
      setPayload('');
      setPayloadInput('');
      setSelectedCommand('');
      setSelectedMeter('');
      setSearch('');
      setFormSubmitted(false);
      setQos('0');
      setRetainRequired('true');

      fetchMeters();
    } catch (error) {
      setError(true);
      setErrorMessage(
        error.response ? `❌ Error: ${error.response.status}` : '❌ Failed to send message.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setTopic('');
    setPayload('');
    setPayloadInput('');
    setSelectedCommand('');
    setSelectedMeter('');
    setSearch('');
    setFormSubmitted(false);
  };

  return (
    <div className="container my-4">
      <h4 className="screen-headings">Configure</h4>
      <p className="text-muted">Here you can configure any changes to the end device.</p>
      <hr />

      <div className="d-flex justify-content-center mt-3">
        <form className="card col-md-5 shadow-sm card-custom-border" onSubmit={handleSave}>
          <div className="card-body">
            <h5 className="form-headings">Send Configuration</h5>

            {/* Meter Dropdown */}
            <div className="mb-3 position-relative" ref={dropdownRef}>
              <label className="label-heading">Select Meter Sr No</label>
              <input
                type="text"
                className="dropdowns input-tight"
                placeholder="Search or select meter..."
                value={search || selectedMeter}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setSelectedMeter('');
                }}
                onFocus={() => setShowDropdown(true)}
              />
              {showDropdown && (
                <div
                  className="dropdowns position-absolute w-100 mt-1"
                  style={{ maxHeight: '150px', overflowY: 'auto', zIndex: 1000 }}
                >
                  {meterSrnos
                    .filter((srNo) => !search || srNo.toLowerCase().includes(search.toLowerCase()))
                    .map((srNo) => (
                      <div
                        key={srNo}
                        className={`custom-dropdown-item ${
                          selectedMeter === srNo ? 'selected' : ''
                        }`}
                        onClick={() => handleMeterSelect(srNo)}
                      >
                        {srNo}
                      </div>
                    ))}
                  {meterSrnos.filter((srNo) => srNo.toLowerCase().includes(search.toLowerCase()))
                    .length === 0 && (
                    <div className="custom-dropdown-item text-muted">No results found</div>
                  )}
                </div>
              )}
              {formSubmitted && !selectedMeter && (
                <div className="invalid-feedback d-block">Please select a meter.</div>
              )}
            </div>

            {/* Topic */}
            <div className="mb-3">
              <label className="label-heading">Topic Name</label>
              <input type="text" className="dropdowns input-tight" value={topic} readOnly />
            </div>

            {/* Command Dropdown */}
            <div className="mb-3">
              <label className="label-heading">Select Command</label>
              <select
                className={`form-select${formSubmitted && !payload ? ' is-invalid' : ''}`}
                value={selectedCommand}
                onChange={(e) => handleCommandSelect(e.target.value)}
              >
                <option value="">-- Select Command --</option>
                {commands.map((cmd) => (
                  <option key={cmd.id} value={cmd.id}>
                    {cmd.id}
                  </option>
                ))}
              </select>
              {formSubmitted && !payload && (
                <div className="invalid-feedback d-block">Please select a command.</div>
              )}
            </div>

            {/* Conditional input */}
            {commands.find((c) => c.id === selectedCommand && c.requiresInput) && (
              <div className="mb-3">
                <label className="label-heading">Enter Value</label>
                <input
                  type="text"
                  className={`dropdowns input-tight${
                    formSubmitted && !payloadInput ? ' is-invalid' : ''
                  }`}
                  placeholder="Enter value..."
                  value={payloadInput}
                  onChange={handlePayloadInputChange}
                />
                {formSubmitted && !payloadInput && (
                  <div className="invalid-feedback d-block">Please enter a value.</div>
                )}
                {formSubmitted &&
                  payloadInput &&
                  !validateInput(
                    payloadInput,
                    commands.find((c) => c.id === selectedCommand)?.inputType
                  ) && (
                    <div className="invalid-feedback d-block">
                      ❌ Invalid format for this command.
                    </div>
                  )}
              </div>
            )}

            {/* Buttons */}
            <div className="text-center">
              <button
                type="submit"
                className="submit-buttons"
                disabled={!canUpdate('Meter Configuration') || loading}
              >
                {loading ? 'Sending...' : 'Save'}
              </button>
              <button
                type="button"
                className="cancel-button ms-3"
                onClick={handleCancel}
                disabled={loading}
              >
                Clear
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Modals */}
      <SuccessModal
        show={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message="✅ Message sent successfully!"
      />
      <ErrorModal show={error} onClose={() => setError(false)} message={errorMessage} />
    </div>
  );
};

export default Configure;
