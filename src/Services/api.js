// src/api/api.js
export const BASE_URL = 'http://20.197.44.133:8081';

const getToken = () => localStorage.getItem('authToken');

const fetchWithAuth = async (url, onError) => {
  const token = getToken();
  if (!token) {
    if (onError) onError('Authentication token not found.');
    return null;
  }

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    return await response.json();
  } catch (error) {
    if (onError) onError(error.message || 'Unknown error');
    return null;
  }
};

export const fetchTotalDevices = async (onError) =>
  fetchWithAuth(`/api/data/dashboard/presentDay/status`, onError);

export const fetchWeeklyStatus = async (onError) =>
  fetchWithAuth(`/api/data/dashboard/week/status`, onError);

export const getDeviceDetails = (meterId, onError) =>
  fetchWithAuth(`/api/api/device/${meterId}`, onError);

export const getConsumerDetails = (consumerId, onError) =>
  fetchWithAuth(`/api/api/consumer/${consumerId}`, onError);

export const getReadings = (meterId, onError) =>
  fetchWithAuth(`/api/api/readings/${meterId}`, onError);
