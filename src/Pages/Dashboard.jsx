import { useState, useEffect } from 'react';
import { fetchTotalDevices, fetchWeeklyStatus } from '../Services/api';
import PieChart from '../Components/PieChart';
import BarChart from '../Components/BarChart';
import './Dashboard.css';
import Card from 'react-bootstrap/Card';
import ErrorModal from '../Components/ErrorModal';

const Dashboard = () => {
  const [data, setData] = useState({
    totalDevices: 0,
    onlineDevices: 0,
    offlineDevices: 0,
    mappedOnline: 0,
    unmappedOnline: 0,
    mappedOffline: 0,
    unmappedOffline: 0,
    deviceStatus: [0, 0],
    weeklyStatus: [],
    totalCommunaicationDeivces: 0,
    totalNotInCommunaicationDeivces: 0,
  });

  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadTotalDevices = async () => {
      const response = await fetchTotalDevices(handleError); // ✅ pass error handler
      if (!response) return;

      const { mapped = {}, unMapped = {} } = response;

      const mappedComm = Number(mapped.communication || 0);
      const mappedNotComm = Number(mapped.notInCommunication || 0);
      const mappedNotStarted = Number(mapped.notStarted || 0);

      const unMappedComm = Number(unMapped.communication || 0);
      const unMappedNotComm = Number(unMapped.notInCommunication || 0);
      const unMappedNotStarted = Number(unMapped.notStarted || 0);

      const mappedDevices = mappedComm + mappedNotComm + mappedNotStarted;
      const unmappedDevices = unMappedComm + unMappedNotComm + unMappedNotStarted;

      const totalDevices = mappedDevices + unmappedDevices;
      const onlineDevices = mappedComm + unMappedComm;
      const offlineDevices = totalDevices - onlineDevices;
      const totalCommunaicationDeivces = mappedComm + unMappedComm;
      const totalNotInCommunaicationDeivces = mappedNotComm + unMappedNotComm;

      const mappedOffline = mappedNotComm + mappedNotStarted;
      const unmappedOffline = unMappedNotComm + unMappedNotStarted;

      setData((prev) => ({
        ...prev,
        totalDevices,
        onlineDevices,
        offlineDevices,
        totalCommunaicationDeivces,
        totalNotInCommunaicationDeivces,
        mappedOnline: mappedComm,
        unmappedOnline: unMappedComm,
        mappedOffline,
        unmappedOffline,
        deviceStatus: [onlineDevices, offlineDevices],
      }));
    };

    loadTotalDevices();
  }, []);

  useEffect(() => {
    const loadWeeklyStatus = async () => {
      const response = await fetchWeeklyStatus(handleError); // ✅ pass error handle
      if (!response) return;

      const formatted = response.map((item) => ({
        date: item.commDate,
        communicatingDevices:
          Number(item.communicationMapped || 0) + Number(item.communicationUnmapped || 0),
        nonCommunicatingDevices:
          Number(item.notCommunicationMapped || 0) + Number(item.notCommunicationUnmapped || 0),
        notStartedDevices:
          Number(item.notStartedMapped || 0) + Number(item.notStartedUnmapped || 0),
      }));

      setData((prev) => ({ ...prev, weeklyStatus: formatted }));
    };

    loadWeeklyStatus();
  }, []);

  const pieData = {
    labels: ['Online', 'Offline'],
    datasets: [
      {
        data: data.deviceStatus,
        backgroundColor: ['#2ECC71', '#E74C3C'],
      },
    ],
  };

  const barChartData = {
    labels: data.weeklyStatus.map((item) => item.date),
    datasets: [
      {
        label: 'Communicating Devices',
        data: data.weeklyStatus.map((item) => item.communicatingDevices),
        backgroundColor: '#2ECC71',
      },
      {
        label: 'Non-Communicating Devices',
        data: data.weeklyStatus.map((item) => item.nonCommunicatingDevices),
        backgroundColor: '#E74C3C',
      },
      {
        label: 'Not Started Devices',
        data: data.weeklyStatus.map((item) => item.notStartedDevices),
        backgroundColor: '#F39C12',
      },
    ],
  };

  useEffect(() => {
    document.body.classList.add('dashboard-body');

    return () => {
      document.body.classList.remove('dashbord-body');
    };
  }, []);

  const handleError = (msg) => {
    setErrorMessage('❌ ' + msg);
    setError(true);
  };

  return (
    <div className="container mt-5">
      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <Card>
            <Card.Header as="div" className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">All Devices</h5>
              <span className="fw-bold">{data.totalDevices}</span>
            </Card.Header>
            <Card.Body>
              <Card.Title as="div" className="d-flex justify-content-between align-items-center">
                <span className="d-flex align-items-center">
                  <span className="status-dot online"></span>

                  <h6 className="mb-0">Online Meters :</h6>
                </span>
                <span>{data.onlineDevices}</span>
              </Card.Title>

              <Card.Title as="div" className="d-flex justify-content-between align-items-center">
                <span className="d-flex align-items-center">
                  <span className="status-dot offline"></span>

                  <h6 className="mb-0">Offline Meters :</h6>
                </span>
                <span>{data.offlineDevices}</span>
              </Card.Title>
            </Card.Body>
          </Card>
        </div>

        <div className="col-md-4 mb-3">
          <Card>
            <Card.Header as="div" className="d-flex justify-content-between align-items-center">
              <span className="d-flex align-items-center">
                <span className="status-dot online"></span>
                <h5 className="mb-0">Online Devices</h5>
              </span>
              <span className="fw-bold">{data.onlineDevices}</span>
            </Card.Header>
            <Card.Body>
              <Card.Title as="div" className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0">Mapped Meters :</h6>
                <span>{data.mappedOnline}</span>
              </Card.Title>
              <Card.Title as="div" className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0">UnMapped Meters :</h6>
                <span>{data.unmappedOnline}</span>
              </Card.Title>
            </Card.Body>
          </Card>
        </div>

        <div className="col-md-4 mb-3">
          <Card>
            <Card.Header as="div" className="d-flex justify-content-between align-items-center">
              <span className="d-flex align-items-center">
                <span className="status-dot offline"></span>
                <h5 className="mb-0">Offline Devices</h5>
              </span>
              <span className="fw-bold">{data.offlineDevices}</span>
            </Card.Header>
            <Card.Body>
              <Card.Title as="div" className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0">Mapped Meters :</h6>
                <span>{data.mappedOffline}</span>
              </Card.Title>

              <Card.Title as="div" className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0">UnMapped Meters :</h6>
                <span>{data.unmappedOffline}</span>
              </Card.Title>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Charts */}
      <div className="row gx-4" style={{ overflow: 'hidden' }}>
        <div className="col-lg-8 mb-4">
          <div className="card shadow p-3" style={{ height: '400px' }}>
            <Card.Header as="div" className="d-flex justify-content-between align-items-center">
              <span className="d-flex align-items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="bi bi-bar-chart-line-fill"
                  viewBox="0 0 16 16"
                >
                  <path d="M11 2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12h.5a.5.5 0 0 1 0 1H.5a.5.5 0 0 1 0-1H1v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h1V7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7h1z" />
                </svg>

                <h5 className="mb-0"> weekly Status</h5>
              </span>
            </Card.Header>
            <BarChart data={barChartData} />
          </div>
        </div>
        <div className="col-lg-4 mb-4">
          <div className="card shadow p-3" style={{ height: '400px' }}>
            <Card.Header as="div" className="d-flex justify-content-between align-items-center">
              <span className="d-flex align-items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="bi bi-pie-chart-fill"
                  viewBox="0 0 16 16"
                >
                  <path d="M15.985 8.5H8.207l-5.5 5.5a8 8 0 0 0 13.277-5.5zM2 13.292A8 8 0 0 1 7.5.015v7.778zM8.5.015V7.5h7.485A8 8 0 0 0 8.5.015" />
                </svg>

                <h5 className="mb-0"> Device Status</h5>
              </span>
            </Card.Header>
            <PieChart data={pieData} />
          </div>
        </div>
      </div>
      <ErrorModal show={error} onClose={() => setError(false)} message={errorMessage} />
    </div>
  );
};

export default Dashboard;
