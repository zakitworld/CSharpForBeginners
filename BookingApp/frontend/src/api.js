const API_BASE_URL = 'http://localhost:5167/api';

export const login = async (email) => {
  const response = await fetch(`${API_BASE_URL}/auth/login?email=${encodeURIComponent(email)}`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error('Login failed');
  return response.json();
};

export const getBookings = async (token) => {
  const response = await fetch(`${API_BASE_URL}/bookings`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error('Failed to fetch bookings');
  return response.json();
};

export const createBooking = async (token, booking) => {
  const response = await fetch(`${API_BASE_URL}/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(booking)
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to create booking');
  }
  return response.json();
};
