import React, { useEffect, useState } from 'react';
import { Card, Badge } from 'react-bootstrap';
import {
  FaCheckCircle,
  FaTimesCircle,
  FaInfoCircle,
  FaDatabase,
  FaWifi,
  FaClock,
  FaCalendar,
} from 'react-icons/fa';
import { useParams } from 'react-router-dom';
import GoBack from '../Components/GoBack';

// ✅ Status icon helper
const getStatusIcon = (status) => {
  switch (status?.toLowerCase()) {
    case 'pass':
      return (
        <span className="text-success">
          <FaCheckCircle className="me-1" /> Pass
        </span>
      );
    case 'fail':
      return (
        <span className="text-danger">
          <FaTimesCircle className="me-1" /> Fail
        </span>
      );
    default:
      return (
        <span className="text-muted">
          <FaInfoCircle className="me-1" /> N/A
        </span>
      );
  }
};

const TestResult = () => {
  const { meterIdentifier, iotDeviceIdentifier } = useParams(); // ✅ match route params
  const [deviceData, setDeviceData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDeviceResults = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('User not authenticated');

      const response = await fetch(`/device/test-result/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      // ✅ Find the specific device by Meter ID + IoT ID
      const record = data.find(
        (d) =>
          String(d.meterIdentifier).toLowerCase() === String(meterIdentifier).toLowerCase() &&
          String(d.iotDeviceIdentifier).toLowerCase() === String(iotDeviceIdentifier).toLowerCase()
      );

      setDeviceData(record || null);
    } catch (error) {
      console.error('Failed to fetch device results:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeviceResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meterIdentifier, iotDeviceIdentifier]);

  if (loading) return <div className="container mt-5">Loading...</div>;
  if (!deviceData) return <div className="container mt-5">No data found.</div>;

  const {
    meterIdentifier: meterId,
    iotDeviceIdentifier: iotId,
    created,
    modifiedDate,
    realTimeClock,
    dataPublishHour,
    readMemory,
    destinationServerIP,
    publishTopic,
    subscribeTopic,
    sensorStatus,
    gprsStatus,
    imeiNumber,
    simNumber,
  } = deviceData;

  const testResults = [
    { label: 'Real Time Clock', status: realTimeClock },
    { label: 'Data Publish Hour', status: dataPublishHour },
    { label: 'Read Memory', status: readMemory },
    { label: 'Destination Server IP', status: destinationServerIP },
    { label: 'Publish Topic', status: publishTopic },
    { label: 'Subscribe Topic', status: subscribeTopic },
    { label: 'Sensor Status', status: sensorStatus },
    { label: 'GPRS Status', status: gprsStatus },
    { label: 'IMEI Number', status: imeiNumber ? 'pass' : 'fail' },
    { label: 'SIM Number', status: simNumber ? 'pass' : 'fail' },
  ];

  return (
    <div className="container mt-5">
      {/* Back button */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <GoBack />
      </div>

      <h2 className="fw-bold">Device Test Results</h2>
      <p className="text-muted">
        Displaying test results for <strong>{iotId || 'NA'}</strong>
      </p>

      {/* Device Info Card */}
      <Card className="mb-4 p-3">
        <div className="d-flex justify-content-between flex-wrap">
          <div className="mb-2">
            <h5 className="fw-bold">
              Device Information{' '}
              <Badge bg="primary" pill>
                New
              </Badge>
            </h5>
            <p>
              <FaDatabase className="me-2" />
              Device ID: <strong>{iotId || 'NA'}</strong>
            </p>
            <p>
              <FaWifi className="me-2" />
              Meter ID: <strong>{meterId || 'NA'}</strong>
            </p>
          </div>
          <div className="text-end mb-2">
            <p>
              <FaCalendar className="me-2" />
              Created: <strong>{created ? new Date(created).toLocaleString() : 'NA'}</strong>
            </p>
            <p>
              <FaClock className="me-2" />
              Modified:{' '}
              <strong>
                {modifiedDate ? new Date(modifiedDate).toLocaleString() : 'Not Modified'}
              </strong>
            </p>
          </div>
        </div>
      </Card>

      {/* Test Results Card */}
      <Card className="p-3">
        <h5 className="fw-bold mb-3">Test Results</h5>
        <div className="row">
          {testResults.map((test, idx) => (
            <div className="col-md-6 mb-2" key={idx}>
              <div className="d-flex justify-content-between border p-2 rounded bg-light">
                <span>{test.label}</span>
                <span>{getStatusIcon(test.status)}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default TestResult;
