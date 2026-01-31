// src/Components/MeterForecasting.js
import React, { useState } from 'react';
import { Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import { BASE_URL } from '../Services/api';

const Forecasting = ({ meterSrNo }) => {
  const [utilisationData, setUtilisationData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchUtilisation = async () => {
    if (!meterSrNo) return;
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Auth token missing. Please login.');

      const res = await fetch(`/api/data/forecast/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        if (res.status === 404) throw new Error('No utilisation available for this meter.');
        throw new Error(`Request failed with status ${res.status}`);
      }

      const data = await res.json();
      setUtilisationData(
        data.map((item) => ({
          id: item.id,
          meterSrNo: item.meterSrNo,
          commDate: item.commDate,
          utilisation: item.utilisation,
        }))
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Card.Header className="bg-primary text-white">
        Forecasting for Meter: {meterSrNo}
      </Card.Header>
      <Card.Body>
        {/* Date Range Filter */}
        <Form className="d-flex gap-3 mb-3">
          <Form.Group>
            <Form.Label>Start Date</Form.Label>
            <Form.Control
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>End Date</Form.Label>
            <Form.Control
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </Form.Group>
          <div className="align-self-end">
            <Button variant="primary" disabled={!startDate || !endDate} onClick={fetchUtilisation}>
              Submit
            </Button>
          </div>
        </Form>

        {loading && (
          <div className="d-flex justify-content-center py-3">
            <Spinner animation="border" />
          </div>
        )}
        {error && <Alert variant="danger">{error}</Alert>}

        {!loading && !error && utilisationData.length > 0 ? (
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={utilisationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="commDate" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="utilisation" stroke="#007bff" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          !loading && !error && <p className="text-muted">No utilisation data for this meter.</p>
        )}
      </Card.Body>
    </div>
  );
};

export default Forecasting;
