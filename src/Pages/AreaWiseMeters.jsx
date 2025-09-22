import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomPagination from '../Components/CustomPagination';
import CustomDropdown from '../Components/CustomDropdown';
import SuccessModal from '../Components/SuccessModal';
import ErrorModal from '../Components/ErrorModal';
import ConfirmModal from '../Components/ConfirmModal';
import './AllMeters.css';
import { useModulePermissions } from '../hooks/useModulePermissions';
import { BASE_URL } from '../Services/api';

const AreaWiseMeters = () => {
  const [meters, setMeters] = useState([]);
  const [filteredMeters, setFilteredMeters] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    meterSrNo: '',
    yearOfManufacture: '',
    initialAccumulatedFlow: '',
    manufacturerName: '',
  });

  const navigate = useNavigate();

  const { canWrite } = useModulePermissions();

  const getAuthToken = () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('You are not authenticated. Please log in.');
      return null;
    }
    return token;
  };

  useEffect(() => {
    const fetchMeters = async () => {
      const token = getAuthToken();
      if (!token) return;

      try {
        const userRes = await fetch(`/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = await userRes.json();
        const userId = userData?.userHierarchy[0]?.hierarchyDataId;

        const response = await fetch(`/api/data/meter/list/hierarchyDataId=${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch meters');
        const data = await response.json();
        setMeters(data || []);
      } catch (err) {
        setError(true);
        setErrorMessage(err.message || 'Something went wrong.');
      } finally {
        setLoading(false);
      }
    };

    fetchMeters();
  }, []);

  useEffect(() => {
    let filtered = meters;
    if (filterType === 'mapped') {
      filtered = meters.filter((m) => m.consumerId);
    } else if (filterType === 'unmapped') {
      filtered = meters.filter((m) => !m.consumerId);
    }
    setFilteredMeters(filtered);
    setPage(0);
  }, [filterType, meters]);

  useEffect(() => {
    const lowerSearch = searchTerm.toLowerCase();
    const filtered = meters.filter((meter) =>
      Object.values(meter).some((val) => val?.toString().toLowerCase().includes(lowerSearch))
    );
    setFilteredMeters(filtered);
    setPage(0);
  }, [searchTerm, meters]);

  const handleChangePage = (newPage) => {
    if (newPage >= 0 && newPage < Math.ceil(filteredMeters.length / rowsPerPage)) {
      setPage(newPage);
    }
  };

  const handleChangeRowsPerPage = (newRows) => {
    setRowsPerPage(newRows);
    setPage(0);
  };
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async () => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const response = await fetch(`/api/data/meter/add`, {
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
      <h4 className="screen-headings">Area Wise Meters</h4>
      <p className="text-muted">Here we can view meters according to area</p>
      <hr />

      <div className="row d-flex justify-content-space-between mb-3 g-2">
        {/* Filter */}
        <div className="col-md-3">
          <label className="label-heading">Filter:</label>
          <CustomDropdown
            options={[
              { id: 'all', title: 'All Meters' },
              { id: 'mapped', title: 'Mapped' },
              { id: 'unmapped', title: 'Unmapped' },
            ]}
            value={filterType}
            onChange={(val) => setFilterType(val)}
            placeholder="Select Filter"
          />
        </div>

        {/* Search */}
        <div className="col-md-5">
          <label className="label-heading">Search:</label>
          <input
            type="text"
            className="dropdowns input-tight"
            style={{ marginTop: '0.01rem' }}
            placeholder="Search all fields..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Button */}
        <div className="col-md-4" style={{ marginTop: '2rem' }}>
          <button
            className="form-open-buttons"
            style={{ marginLeft: '18rem' }}
            disabled={!canWrite('All Meters')}
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Hide' : 'Add Meter'}
          </button>
        </div>
      </div>

      {showForm && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content card-custom-border shadow">
              {/* Header */}
              <div className="modal-header bg-primary text-white py-6">
                <h5 className="modal-title m-0">Add Meter</h5>
                <button
                  type="button"
                  className="btn-close bg-white btn-close-white"
                  aria-label="Close"
                  onClick={() => setShowForm(false)}
                ></button>
              </div>

              {/* Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
              >
                <div className="modal-body p-3">
                  <div className="row">
                    <div className="col-md-6 mb-2">
                      <label className="label-heading small">Meter serial No</label>
                      <input
                        type="text"
                        className="dropdowns input-tight"
                        style={{ marginTop: '0.02rem' }}
                        id="meterSrNo"
                        value={formData.meterSrNo}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-6 mb-2">
                      <label className="label-heading small">Year Of Manufacture</label>
                      <input
                        type="text"
                        className="dropdowns input-tight"
                        style={{ marginTop: '0.02rem' }}
                        id="yearOfManufacture"
                        value={formData.yearOfManufacture}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-6 mb-2">
                      <label className="label-heading small"> Initial Accumulated Flow (m³)</label>
                      <input
                        type="text"
                        className="dropdowns input-tight"
                        style={{ marginTop: '0.02rem' }}
                        id="initialAccumulatedFlow"
                        value={formData.initialAccumulatedFlow}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-6 mb-2">
                      <label className="label-heading small">Manufacturer Name</label>
                      <input
                        type="text"
                        className="dropdowns input-tight"
                        style={{ marginTop: '0.02rem' }}
                        id="manufacturerName"
                        value={formData.manufacturerName}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer py-2 d-flex justify-content-center gap-2">
                  <button
                    type="submit"
                    disabled={!canWrite('Hierarchy Titles')}
                    className="btn btn-primary btn-sm"
                    style={{ minWidth: '100px' }}
                  >
                    Submit
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Serial No</th>
              <th>Manufacturer</th>
              <th>Year</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredMeters
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((meter, index) => (
                <tr
                  className="parent-row"
                  key={meter.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    if (meter.meterSrNo) {
                      navigate(`/meter-details/${meter.consumerId}/${meter.meterSrNo}`);
                    }
                  }}
                >
                  <td>{page * rowsPerPage + index + 1}</td>
                  <td className="text-break">{meter.meterSrNo || 'N/A'}</td>
                  <td className="text-break">{meter.manufacturerName || 'N/A'}</td>
                  <td className="text-break">{meter.yearOfManufacture || 'N/A'}</td>
                  <td className="text-break">
                    <span
                      className={`badge ${
                        meter.status === 'active' ? 'bg-success' : 'bg-secondary'
                      }`}
                    >
                      {meter.status}
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <CustomPagination
        count={Math.ceil(filteredMeters.length / rowsPerPage)}
        page={page}
        onChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Modals */}
      <SuccessModal
        show={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message="✅ Data added successfully!"
      />
      <ErrorModal show={error} onClose={() => setError(false)} message={errorMessage} />
      <ConfirmModal
        show={showConfirmModal}
        title="Confirm Action"
        message="Are you sure you want to proceed?"
        confirmText="Yes"
        cancelText="No"
        onCancel={() => setShowConfirmModal(false)}
        onConfirm={() => {
          setShowConfirmModal(false);
          // handleConfirmedAction()
        }}
      />
    </div>
  );
};

export default AreaWiseMeters;
