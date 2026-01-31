import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomPagination from '../Components/CustomPagination';
import ErrorModal from '../Components/ErrorModal';
import { BASE_URL } from '../Services/api';

const MappedMeter = () => {
  const [meters, setMeters] = useState([]);
  const [filteredMeters, setFilteredMeters] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const navigate = useNavigate();

  const getAuthToken = () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      alert('You are not authenticated. Redirecting to login.');
      navigate('/login');
      return null;
    }
    return token;
  };

  const extractFieldFromHierarchy = (hierarchy, target) => {
    if (!hierarchy) return null;
    const find = (node) => {
      if (node.title === target) return node.name;
      for (const child of node.children || []) {
        const result = find(child);
        if (result) return result;
      }
      return null;
    };
    return find(hierarchy);
  };

  const fetchHierarchy = async (consumerId) => {
    const token = getAuthToken();
    if (!token) return {};

    try {
      const response = await fetch(`/api/hierarchy/data/dataId=${consumerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const text = await response.text();
      if (!text.trim()) return {};
      const hierarchy = JSON.parse(text);

      return {
        state: extractFieldFromHierarchy(hierarchy, 'State') || 'N/A',
        zone: extractFieldFromHierarchy(hierarchy, 'Zone') || 'N/A',
        circle: extractFieldFromHierarchy(hierarchy, 'Circle') || 'N/A',
        area: extractFieldFromHierarchy(hierarchy, 'Area') || 'N/A',
        consumerName: extractFieldFromHierarchy(hierarchy, 'Consumer') || 'N/A',
      };
    } catch (error) {
      setError(true);
      setErrorMessage('❌ Failed to fetch data');

      return {};
    }
  };

  useEffect(() => {
    const fetchMappedMeters = async () => {
      const token = getAuthToken();
      if (!token) return;

      try {
        const response = await fetch(`/data/meter/mappedMeters`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        const mappedMeters = data.filter((meter) => meter.consumerId);

        const fullMappedData = await Promise.all(
          mappedMeters.map(async (meter) => {
            const hierarchy = await fetchHierarchy(meter.consumerId);
            return {
              id: meter.id,
              meterSrNo: meter.meterSrNo || 'N/A',
              state: hierarchy.state || 'N/A',
              zone: hierarchy.zone || 'N/A',
              circle: hierarchy.circle || 'N/A',
              area: hierarchy.area || 'N/A',
              consumerName: hierarchy.consumerName || 'N/A',
              status: meter.status || 'N/A',
            };
          })
        );
        setMeters(fullMappedData);
        setFilteredMeters(fullMappedData);
      } catch (err) {
        setError(true);
        setErrorMessage('❌ Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchMappedMeters();
  }, []);

  // Search logic
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

  return (
    <div className="container mt-4">
      <h4 className="screen-headings">Mapped Meters</h4>
      <p className="text-muted">View all mapped meters with hierarchy info</p>
      <hr />

      {/* Search Bar */}
      <div className="mb-2" style={{ maxWidth: '300px' }}>
        <input
          type="text"
          className=" input-text"
          placeholder="Search all fields..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading && (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      )}

      {error && <div className="alert alert-danger text-center">{error}</div>}

      {!loading && !error && filteredMeters.length > 0 && (
        <div className="table-responsive shadow-sm mt-3">
          <table className="table table-hover no-vertical-borders">
            <thead className="custom-thead" style={{ backgroundColor: '#7C3AED', color: '#fff' }}>
              <tr>
                <th>Meter Serial No</th>
                <th>State</th>
                <th>Zone</th>
                <th>Circle</th>
                <th>Area</th>
                <th>Consumer Name</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredMeters
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((meter) => (
                  <tr key={meter.id}>
                    <td>{meter.meterSrNo}</td>
                    <td>{meter.state}</td>
                    <td>{meter.zone}</td>
                    <td>{meter.circle}</td>
                    <td>{meter.area}</td>
                    <td>{meter.consumerName}</td>
                    <td>{meter.status}</td>
                  </tr>
                ))}
            </tbody>
          </table>

          <CustomPagination
            count={Math.ceil(filteredMeters.length / rowsPerPage)}
            page={page}
            onChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </div>
      )}
      <ErrorModal show={error} onClose={() => setError(false)} message={errorMessage} />
    </div>
  );
};

export default MappedMeter;
