import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomPagination from '../Components/CustomPagination';
import './AllMeters.css';
import SuccessModal from '../Components/SuccessModal';
import ErrorModal from '../Components/ErrorModal';
import CustomDropdown from '../Components/CustomDropdown';

const BcsData = () => {
  const [meters, setMeters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [formDataAdd, setFormDataAdd] = useState({
    meterIdentifier: '',
    iotDeviceIdentifier: '',
    realTimeClock: 'Pass',
    dataPublishHour: 'Pass',
    readMemory: 'Pass',
    destinationServerIP: 'Pass',
    publishTopic: 'Pass',
    subscribeTopic: 'Pass',
    sensorStatus: 'Pass',
    gprsStatus: 'Pass',
    imeiNumber: 'Pass',
    simNumber: 'Pass',
  });

  const navigate = useNavigate();

  const getAuthToken = () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('You are not authenticated. Please log in.');
      return null;
    }
    return token;
  };

  const fetchMeters = async () => {
    const token = getAuthToken();
    if (!token) return;
    try {
      const response = await fetch(`/device/manufacturing/getAll`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch meters');
      const data = await response.json();
      setMeters(data || []);
    } catch {
      setError(true);
      setErrorMessage('❌ Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeters();
  }, []);

  const handleManufacturingAdd = async () => {
    if (!formDataAdd.meterIdentifier || !formDataAdd.iotDeviceIdentifier) {
      setError(true);
      setErrorMessage('Please fill both Meter Identifier and IOT Device Identifier.');
      return;
    }

    const token = getAuthToken();
    if (!token) return;

    try {
      const res = await fetch(`/device/manufacturing/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formDataAdd),
      });

      if (res.ok) {
        setFormDataAdd({
          meterIdentifier: '',
          iotDeviceIdentifier: '',
          realTimeClock: 'Pass',
          dataPublishHour: 'Pass',
          readMemory: 'Pass',
          destinationServerIP: 'Pass',
          publishTopic: 'Pass',
          subscribeTopic: 'Pass',
          sensorStatus: 'Pass',
          gprsStatus: 'Pass',
          imeiNumber: 'Pass',
          simNumber: 'Pass',
        });
        setShowForm(false);
        setShowSuccessModal(true);
        await fetchMeters();
      } else {
        const err = await res.json();
        setError(true);
        setErrorMessage(err.message || '❌ Failed to add meter.');
      }
    } catch {
      setError(true);
      setErrorMessage('❌ Failed to add meter.');
    }
  };

  const handleChangePage = (newPage) => {
    if (newPage >= 0 && newPage < Math.ceil(meters.length / rowsPerPage)) {
      setPage(newPage);
    }
  };

  const handleChangeRowsPerPage = (newRows) => {
    setRowsPerPage(newRows);
    setPage(0);
  };

  return (
    <div className="container mt-4">
      <h4 className="screen-headings">BCS Meter Data</h4>
      <p className="text-muted">Bcs tool quality check passed meters.</p>
      <hr />

      {/* ➕ Add Meter Button */}

      <div className="d-flex justify-content-end mb-3">
        <button className="form-open-buttons" onClick={() => setShowForm(true)}>
          Add New Meter
        </button>
      </div>

      {/* 📋 Form Modal */}
      {showForm && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog modal-dialog-centered  modal-xl">
            <div className="modal-content card-custom-border shadow">
              <div className="modal-header bg-primary text-white py-">
                <h6 className="modal-title">Add</h6>
                <button
                  type="button"
                  className="btn-close btn-close-black"
                  onClick={() => setShowForm(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form>
                  {/* 🔢 Numbers */}
                  <div className="row">
                    <div className="col-md-3 mb-2">
                      <label className="label-heading small">Meter Identifier</label>
                      <input
                        type="text"
                        className="dropdowns input-tight"
                        style={{ marginTop: '0.02rem' }}
                        value={formDataAdd.meterIdentifier}
                        onChange={(e) =>
                          setFormDataAdd({
                            ...formDataAdd,
                            meterIdentifier: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="col-md-3 mb-2">
                      <label className="label-heading small">IOT Device Identifier</label>
                      <input
                        type="text"
                        className="dropdowns input-tight"
                        style={{ marginTop: '0.02rem' }}
                        value={formDataAdd.iotDeviceIdentifier}
                        onChange={(e) =>
                          setFormDataAdd({
                            ...formDataAdd,
                            iotDeviceIdentifier: e.target.value,
                          })
                        }
                      />
                    </div>

                    {/* ✅ Pass/Fail Dropdowns with CustomDropdown */}
                    {[
                      'realTimeClock',
                      'dataPublishHour',
                      'readMemory',
                      'destinationServerIP',
                      'publishTopic',
                      'subscribeTopic',
                      'sensorStatus',
                      'gprsStatus',
                      'imeiNumber',
                      'simNumber',
                    ].map((field) => (
                      <div className="col-md-3 mb-2" key={field}>
                        <label className="label-heading small">
                          {field.replace(/([A-Z])/g, ' $1')} {/* make labels readable */}
                        </label>
                        <CustomDropdown
                          options={[
                            { id: 'Pass', name: 'Pass' },
                            { id: 'Fail', name: 'Fail' },
                          ]}
                          value={formDataAdd[field]}
                          onChange={(val) =>
                            setFormDataAdd({
                              ...formDataAdd,
                              [field]: val,
                            })
                          }
                          displayKey="name"
                          placeholder="Select option"
                        />
                      </div>
                    ))}
                  </div>
                </form>
              </div>

              <div className="modal-footer py-2 d-flex justify-content-center gap-2">
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  onClick={handleManufacturingAdd}
                >
                  Submit
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  style={{ minWidth: '100px' }}
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && meters.length > 0 && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th className="text-white text-nowrap">Meter ID</th>
                <th className="text-white text-nowrap">IOT ID</th>
                <th className="text-white text-nowrap">Created Date</th>
                <th className="text-white text-nowrap">RTC</th>
                <th className="text-white text-nowrap">Data Publish</th>
                <th className="text-white text-nowrap">Read Memory</th>
                <th className="text-white text-nowrap">Server IP</th>
                <th className="text-white text-nowrap">Publish</th>
                <th className="text-white text-nowrap">Subscribe</th>
                <th className="text-white text-nowrap">Sensor Status</th>
                <th className="text-white text-nowrap">GPRS Status</th>
              </tr>
            </thead>
            <tbody>
              {meters.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((meter) => (
                <tr
                  key={meter.meterIdentifier}
                  className="parent-row"
                  style={{ cursor: 'pointer' }}
                  onClick={() =>
                    meter.meterIdentifier &&
                    navigate(`/test-result/${meter.meterIdentifier}/${meter.iotDeviceIdentifier}`)
                  }
                >
                  <td>{meter.meterIdentifier || 'N/A'}</td>
                  <td>{meter.iotDeviceIdentifier || 'N/A'}</td>
                  <td>{meter.created || 'N/A'}</td>
                  <td>{meter.realTimeClock || 'N/A'}</td>
                  <td>{meter.dataPublishHour || 'N/A'}</td>
                  <td>{meter.readMemory || 'N/A'}</td>
                  <td>{meter.destinationServerIP || 'N/A'}</td>
                  <td>{meter.publishTopic || 'N/A'}</td>
                  <td>{meter.subscribeTopic || 'N/A'}</td>
                  <td>{meter.sensorStatus || 'N/A'}</td>
                  <td>{meter.gprsStatus || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 📌 Pagination */}
      <CustomPagination
        count={meters.length}
        page={page}
        onChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Modals */}
      <SuccessModal show={showSuccessModal} onClose={() => setShowSuccessModal(false)} />
      <ErrorModal show={error} onClose={() => setError(false)} message={errorMessage} />
    </div>
  );
};

export default BcsData;
