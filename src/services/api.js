/* ============================================
   GOWTHAM PAINTS - API Service
   ============================================ */

const API_BASE = 'http://localhost:5000/api';

// Helper to get auth token
const getAuthHeaders = async () => {
  const { auth } = await import('./firebase');
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }
  return { 'Content-Type': 'application/json' };
};

// Generic fetch wrapper
const apiRequest = async (endpoint, options = {}) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// For file uploads
const apiUpload = async (endpoint, formData) => {
  try {
    const { auth } = await import('./firebase');
    const user = auth.currentUser;
    const headers = {};
    if (user) {
      const token = await user.getIdToken();
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Upload failed');
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// ==================== AUTH ====================
export const syncUser = (userData) =>
  apiRequest('/auth/sync', {
    method: 'POST',
    body: JSON.stringify(userData)
  });

export const getUserRole = () =>
  apiRequest('/auth/role');

// ==================== BOOKINGS ====================
export const createBooking = (bookingData) =>
  apiRequest('/bookings', {
    method: 'POST',
    body: JSON.stringify(bookingData)
  });

export const getBookings = (params = '') =>
  apiRequest(`/bookings${params ? '?' + params : ''}`);

export const getMyBookings = (email) =>
  apiRequest(`/bookings/my?email=${encodeURIComponent(email)}`);

export const updateBooking = (id, updateData) =>
  apiRequest(`/bookings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updateData)
  });

export const deleteBooking = (id) =>
  apiRequest(`/bookings/${id}`, { method: 'DELETE' });

// ==================== GALLERY ====================
export const getGalleryItems = (category = '') =>
  apiRequest(`/gallery${category ? '?category=' + category : ''}`);

export const getGalleryItem = (id) =>
  apiRequest(`/gallery/${id}`);

export const deleteGalleryItem = (id) =>
  apiRequest(`/gallery/${id}`, { method: 'DELETE' });

export const addGalleryItem = (formData) =>
  apiUpload('/gallery', formData);

export const addGalleryImages = (id, formData) =>
  apiUpload(`/gallery/${id}/images`, formData);

// ==================== REVIEWS ====================
export const addReview = (galleryId, reviewData) =>
  apiRequest(`/gallery/${galleryId}/review`, {
    method: 'POST',
    body: JSON.stringify(reviewData)
  });

// ==================== NOTIFICATIONS ====================
export const getNotifications = () =>
  apiRequest('/notifications');

export const markNotificationRead = (id) =>
  apiRequest(`/notifications/${id}/read`, {
    method: 'PUT'
  });

export const markAllNotificationsRead = () =>
  apiRequest('/notifications/read-all', {
    method: 'PUT'
  });

// ==================== PROFILE ====================
export const getProfile = () =>
  apiRequest('/profile');

export const updateProfile = (profileData) =>
  apiRequest('/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData)
  });

export const uploadProfilePhoto = (formData) =>
  apiUpload('/profile/photo', formData);
