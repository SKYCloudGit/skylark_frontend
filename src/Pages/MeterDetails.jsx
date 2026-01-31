import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate } from 'react-router-dom';
import GoBack from '../Components/GoBack';
import './MeterDetails.css';
import Forecasting from '../Components/Forecasting';
import { FaTint, FaArrowDown, FaArrowUp, FaThermometerHalf } from 'react-icons/fa';
import {
  faTint, //For Meter Model
  faMicrochip, // For Meter ID
  faCog, // For Firmware
  faBatteryThreeQuarters, // For Battery
  faSignal, // For Signal
  faUser, // For Customer Name
  faMapMarkerAlt, // For Address
} from '@fortawesome/free-solid-svg-icons';
import './MeterDetails.css';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from 'chart.js';
import { useParams } from 'react-router-dom';
import CustomPagination from '../Components/CustomPagination';
import { BASE_URL } from '../Services/api';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
);

const MeterDetails = () => {
  const { meterId } = useParams(); // ✅ Get meterSrNo from URL
  const { consumerId } = useParams();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [readings, setReadings] = useState({
    accumulatedFlow: 0,
    reverseFlow: 0,
    temperature: 0,
    instantFlow: 0,
    meterSrNo: '',
    errorCode: '',
  });
  const [graphData, setGraphData] = useState({ labels: [], datasets: [] });
  const [hierarchyDetails, setHierarchyDetails] = useState({
    state: '',
    zone: '',
    circle: '',
    area: '',
    consumer: '',
  });

  //code for table
  const [meterData, setMeterData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Fetch Auth Token
  const getAuthToken = () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('Authentication Error: No token found.');
      return null;
    }
    return token;
  };

  const fetchReadings = async () => {
    const token = getAuthToken();
    if (!token) return;

    const formattedDate = selectedDate.toISOString().split('T')[0];

    try {
      const response = await fetch(`/data/get/meterSrNo=${meterId}/date=${formattedDate}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('API Response:', response);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      // Get the meterSrNo from the response and set it in state
      if (data && data.length > 0) {
        setReadings((prev) => ({ ...prev, meterSrNo: data[0].meterId }));
      }

      console.log('Fetched Data:', data);

      if (Array.isArray(data) && data.length > 0) {
        const latestReading = data.sort(
          (a, b) => new Date(b.dataTimestamp) - new Date(a.dataTimestamp)
        )[0];
        setReadings(latestReading);
      } else {
        setReadings({ accumulatedFlow: 0, reverseFlow: 0, temperature: 0, instantFlow: 0 });
      }
    } catch (error) {
      console.error('Error fetching readings:', error);
    }
  };
  // Fetch latest data on component mount & when date changes
  useEffect(() => {
    fetchReadings();
  }, [selectedDate]);

  const errorDescriptions = {
    0: 'No error',
    1: 'Sensor failed',
    2: 'GPRS failed',
    3: 'Sensor + GPRS failed',
    4: 'BLE failed',
    5: 'Sensor + BLE failed',
    6: 'GPRS + BLE failed',
    7: 'Sensor + GPRS + BLE failed',
  };

  const getAlertType = (code) => {
    const numCode = parseInt(code);
    if (numCode === 0) return { level: 'Low', color: 'success' };
    if ([1, 2, 4].includes(numCode)) return { level: 'Medium', color: 'warning' };
    if ([3, 5, 6, 7].includes(numCode)) return { level: 'High', color: 'danger' };
    return { level: 'Unknown', color: 'secondary' };
  };

  const fetchGraphData = async () => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const response = await fetch(`/api/data/getAll/meterSrNo=${meterId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error(`API Error: ${response.status} ${response.statusText}`);

      const data = await response.json();

      // Ensure data is an array and not empty
      if (!data || !Array.isArray(data) || data.length === 0) {
        throw new Error('No data available or invalid format received');
      }

      // Get today's date and the date 30 days ago
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);

      // Filter data to include only entries from the last 30 days
      const filteredData = data.filter((entry) => {
        const entryDate = new Date(entry.dataTimestamp);
        return entryDate >= thirtyDaysAgo && entryDate <= today;
      });

      // Group the data by date and take the last entry for each day
      const groupedByDate = filteredData.reduce((acc, entry) => {
        const entryDate = new Date(entry.dataTimestamp).toISOString().split('T')[0];
        if (!acc[entryDate]) {
          acc[entryDate] = entry;
        } else {
          // Replace with the latest data entry for that day (based on timestamp)
          const currentTimestamp = new Date(acc[entryDate].dataTimestamp);
          const newTimestamp = new Date(entry.dataTimestamp);
          if (newTimestamp > currentTimestamp) {
            acc[entryDate] = entry;
          }
        }
        return acc;
      }, {});

      // Extract the last entry for each day and prepare data for the graph
      const lastEntries = Object.values(groupedByDate);

      // Prepare the labels and datasets
      const labels = lastEntries.map(
        (entry) => new Date(entry.dataTimestamp).toISOString().split('T')[0] // Date in YYYY-MM-DD format
      );

      const accumulatedFlowData = lastEntries.map((entry) => entry.accumulatedFlow);
      const reverseFlowData = lastEntries.map((entry) => entry.reverseFlow);
      const temperatureData = lastEntries.map((entry) => entry.temperature);
      const instantFlowData = lastEntries.map((entry) => entry.instantFlow);

      setGraphData({
        labels,
        datasets: [
          {
            label: 'Accumulated Flow',
            data: accumulatedFlowData,
            borderColor: 'blue',
            fill: false,
          },
          {
            label: 'Reverse Flow',
            data: reverseFlowData,
            borderColor: 'red',
            fill: false,
          },
          {
            label: 'Temperature',
            data: temperatureData,
            borderColor: 'orange',
            fill: false,
          },
          {
            label: 'Instant Flow',
            data: instantFlowData,
            borderColor: 'yellow',
            fill: false,
          },
        ],
      });
    } catch (error) {
      console.error('Error fetching graph data:', error);
    }
  };

  useEffect(() => {
    if (meterId) {
      fetchGraphData();
    }
  }, [meterId]);

  const fetchHierarchyDetails = async () => {
    if (!consumerId) return;

    const token = getAuthToken();
    if (!token) return;

    try {
      const response = await fetch(`/hierarchy/data/dataId=${consumerId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Fetched Hierarchy Data:', data);

      if (data) {
        setHierarchyDetails({
          state: data.name || 'N/A',
          zone: data.children?.[0]?.name || 'N/A',
          circle: data.children?.[0]?.children?.[0]?.name || 'N/A',
          area: data.children?.[0]?.children?.[0]?.children?.[0]?.name || 'N/A',
          consumer: data.children?.[0]?.children?.[0]?.children?.[0]?.children?.[0]?.name || 'N/A',
        });
      }
    } catch (error) {
      console.error('Error fetching hierarchy details:', error);
    }
  };

  useEffect(() => {
    if (consumerId) {
      fetchHierarchyDetails();
    }
  }, [consumerId]);

  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); // Navigates to the previous page
  };

  const fetchMeterData = async () => {
    const token = getAuthToken();
    if (!token) {
      console.error('No auth token found.');
      return;
    }

    try {
      const response = await fetch(`/api/data/getAll/meterSrNo=${meterId}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Include token if required
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error(`Failed to fetch data: ${response.statusText}`);

      const data = await response.json();
      setMeterData(data);
    } catch (error) {
      console.error('Error fetching meter data:', error);
    }
  };

  useEffect(() => {
    if (meterId) {
      fetchMeterData();
    }
  }, [meterId]); // Only fetch when meterId is valid

  const filteredData = meterData.filter((entry) => {
    const entryDate = new Date(entry.dataTimestamp);
    return entryDate.getMonth() + 1 === selectedMonth && entryDate.getFullYear() === selectedYear;
  });

  const handleChangePage = (newPage) => {
    const totalPages = Math.ceil(meterData.length / rowsPerPage);
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  };

  const handleChangeRowsPerPage = (newRows) => {
    setRowsPerPage(newRows);
    setPage(0); // Always reset to first page when rows per page changes
  };
  <CustomPagination
    count={Math.ceil(meterData.length / rowsPerPage)}
    page={page + 1} // Convert zero-based index to one-based
    onChange={(newPage) => setPage(newPage - 1)} // Convert back to zero-based
    rowsPerPage={rowsPerPage}
    onRowsPerPageChange={handleChangeRowsPerPage}
  />;

  // Get the current page's data
  const paginatedMeters = meterData.slice(page * rowsPerPage, (page + 1) * rowsPerPage) || [];

  const today = new Date();
  const DaysAgo = new Date();
  DaysAgo.setDate(today.getDate() - 1);

  // Filter last  days data
  const recentMeterData = meterData.filter((entry) => {
    const entryDate = new Date(entry.dataTimestamp);
    return entryDate >= DaysAgo && entryDate <= today;
  });

  return (
    <div className="container mt-4">
      {/* Meter Details Section */}
      <div className="d-flex justify-content-between align-items-center mb-3 mt-4">
        <GoBack />
      </div>

      <div className="row">
        {/* Device Details */}
        <div className="col-md-4 mb-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h4 className="card-title mb-4">Device Details</h4>

              <div className="d-flex justify-content-between align-items-center border-bottom py-2">
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faTint} className="icon me-2" />
                  <span>Model</span>
                </div>
                <strong>Ultrasonic GPRS</strong>
              </div>

              <div className="d-flex justify-content-between align-items-center border-bottom py-2">
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faMicrochip} className="icon me-2" />
                  <span>Meter ID</span>
                </div>
                <strong>{meterId}</strong>
              </div>

              <div className="d-flex justify-content-between align-items-center border-bottom py-2">
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faCog} className="icon me-2" />
                  <span>Firmware v1.1.1</span>
                </div>
                <span className="status">
                  <b>Up to date</b>
                </span>
              </div>

              <div className="d-flex justify-content-between align-items-center border-bottom py-2">
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faBatteryThreeQuarters} className="icon me-2" />
                  <span>Battery 85%</span>
                </div>
                <span className="status good">
                  <b>Good</b>
                </span>
              </div>

              <div className="d-flex justify-content-between align-items-center pt-2">
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faSignal} className="icon me-2" />
                  <span>Signal Strength</span>
                </div>
                <span className="status connected">
                  <b>Excellent</b>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Details */}
        <div className="col-md-4 mb-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h4 className="card-title mb-4">Customer Details</h4>

              <div className="d-flex justify-content-between align-items-center border-bottom py-2">
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faUser} className="icon me-2" />
                  <span>Name</span>
                </div>
                <strong>{hierarchyDetails.consumer || 'NA'}</strong>
              </div>

              <div className="d-flex justify-content-between align-items-start border-bottom py-2">
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="icon me-2" />
                  <span>Address</span>
                </div>
                <span className="text-end">
                  {hierarchyDetails.circle || 'NA'}, {hierarchyDetails.area || 'NA'},{' '}
                  {hierarchyDetails.zone || 'NA'}, {hierarchyDetails.state || 'NA'}
                </span>
              </div>

              <div className="d-flex justify-content-between border-bottom py-2">
                <span>Zone</span>
                <span>{hierarchyDetails.zone || 'NA'}</span>
              </div>

              <div className="d-flex justify-content-between border-bottom py-2">
                <span>Area</span>
                <span>{hierarchyDetails.area || 'NA'}</span>
              </div>

              <div className="d-flex justify-content-between border-bottom py-2">
                <span>City</span>
                <span>{hierarchyDetails.circle || 'NA'}</span>
              </div>

              <div className="d-flex justify-content-between pt-2">
                <span>State/Country</span>
                <span>{hierarchyDetails.state || 'NA'}, India</span>
              </div>
            </div>
          </div>
        </div>

        {/* Meter Readings */}
        <div className="col-md-4 mb-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="mb-0">Meter Readings</h4>
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  className="form-control form-control-sm"
                  dateFormat="yyyy, MMMM d"
                />
              </div>

              <div className="mb-3">
                <div className="d-flex align-items-center mb-1">
                  <FaTint className="icon blue me-2" />
                  <span>Accumulated Flow</span>
                </div>
                <strong>{readings.accumulatedFlow.toFixed(2)} m³</strong>
              </div>

              <div className="mb-3">
                <div className="d-flex align-items-center mb-1">
                  <FaArrowDown className="icon red me-2" />
                  <span>Reverse Flow</span>
                </div>
                <strong>{readings.reverseFlow} m³</strong>
              </div>

              <div className="mb-3">
                <div className="d-flex align-items-center mb-1">
                  <FaThermometerHalf className="icon orange me-2" />
                  <span>Temperature</span>
                </div>
                <strong>{readings.temperature} °C</strong>
              </div>

              <div>
                <div className="d-flex align-items-center mb-1">
                  <FaArrowUp className="icon green me-2" />
                  <span>Instant Flow</span>
                </div>
                <strong>{readings.instantFlow} m³/h</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Graph and Table Section */}
      <div className="row">
        {/* Chart.js Line Graph */}
        <div className="col-12 mb-4">
          <div className="card shadow-sm p-3" style={{ height: '400px' }}>
            <Line data={graphData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="col-12 mb-4">
          <div className="card shadow-sm p-3">
            <Forecasting meterSrNo={meterId} />
          </div>
        </div>

        {/* Table with Readings */}
        <div className="col-12 mb-4">
          <div className="card shadow-sm">
            <div className="table-responsive">
              <table className="table table-hover no-vertical-borders">
                <thead className="custom-thead">
                  <tr>
                    <th>Date</th>
                    <th>Accumulated Flow</th>
                    <th>Instant Flow</th>
                    <th>Reverse Flow</th>
                    <th>Temperature</th>
                  </tr>
                </thead>
                <tbody>
                  {meterData
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((meter, index) => (
                      <tr key={index}>
                        <td>{new Date(meter.dataTimestamp).toISOString().split('T')[0]}</td>
                        <td>{meter.accumulatedFlow.toFixed(2)}</td>
                        <td>{meter.instantFlow.toFixed(2)}</td>
                        <td>{meter.reverseFlow.toFixed(2)}</td>
                        <td>{meter.temperature.toFixed(2)} °C</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Pagination */}
        <div className="card-footer d-flex justify-content-end align-items-center">
          <CustomPagination
            count={Math.ceil(meterData.length / rowsPerPage)}
            page={page}
            onChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </div>
      </div>
      <div className="row">
        {/* Alerts Section – error codes 1–7 */}
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h4 className="card-title mb-4">Alerts Details</h4>

              <div className="table-responsive">
                <table className="table table-hover no-vertical-borders">
                  <thead className="custom-thead">
                    <tr>
                      <th>S.No</th>
                      <th>Date</th>
                      <th>Error Code</th>
                      <th>Description</th>
                      <th>Alert Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentMeterData.filter((entry) => parseInt(entry.errorCode) !== 0).length >
                    0 ? (
                      recentMeterData
                        .filter((entry) => parseInt(entry.errorCode) !== 0)
                        .map((entry, index) => {
                          const code = parseInt(entry.errorCode);
                          const desc = errorDescriptions[code] || 'Unknown';
                          const { level, color } = getAlertType(code);
                          const date = new Date(entry.dataTimestamp).toLocaleDateString();

                          return (
                            <tr key={index}>
                              <td>{index + 1}</td>
                              <td>{date}</td>
                              <td>{code}</td>
                              <td>{desc}</td>
                              <td>
                                <span className={`badge bg-${color}`}>{level}</span>
                              </td>
                            </tr>
                          );
                        })
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center">
                          No alerts found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Event Logs Section – error code 0 only */}
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h4 className="card-title mb-4">Event Logs</h4>

              <div className="table-responsive">
                <table className="table table-hover no-vertical-borders">
                  <thead className="custom-thead">
                    <tr>
                      <th>S.No</th>
                      <th>Date</th>
                      <th>Error Code</th>
                      <th>Description</th>
                      <th>Alert Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentMeterData.filter((entry) => parseInt(entry.errorCode) === 0).length >
                    0 ? (
                      recentMeterData
                        .filter((entry) => parseInt(entry.errorCode) === 0)
                        .map((entry, index) => {
                          const code = parseInt(entry.errorCode);
                          const desc = errorDescriptions[code] || 'Unknown';
                          const { level, color } = getAlertType(code);
                          const date = new Date(entry.dataTimestamp).toLocaleDateString();

                          return (
                            <tr key={index}>
                              <td>{index + 1}</td>
                              <td>{date}</td>
                              <td>{code}</td>
                              <td>{desc}</td>
                              <td>
                                <span className={`badge bg-${color}`}>{level}</span>
                              </td>
                            </tr>
                          );
                        })
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center">
                          No events found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeterDetails;
