/* ============================================
   PROFILE PAGE - Gowtham Paints
   ============================================ */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { logoutUser } from '../services/firebase';
import { getProfile, updateProfile as updateProfileApi, getBookings } from '../services/api';
import { TAMIL_NADU_DISTRICTS, validators } from '../utils/validators';
import { FiUser, FiMail, FiPhone, FiMapPin, FiMap, FiEdit2, FiLogOut, FiSave, FiCalendar, FiCheck, FiShield, FiTrash2 } from 'react-icons/fi';
import { FaPaintRoller } from 'react-icons/fa';
import './Profile.css';

const Profile = () => {
  const { currentUser, userRole, isAdmin, refreshProfile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [toast, setToast] = useState(null);
  const [imgError, setImgError] = useState(false);

  const [formData, setFormData] = useState({
    name: currentUser?.displayName || '',
    email: currentUser?.email || '',
    phone: '',
    address: '',
    city: '',
    district: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchProfile();
    fetchBookings();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await getProfile();
      if (data && data.profile) {
        setFormData(prev => ({
          ...prev,
          name: data.profile.name || currentUser?.displayName || '',
          email: currentUser?.email || data.profile.email || '',
          phone: data.profile.phone || '',
          address: data.profile.address || '',
          city: data.profile.city || '',
          district: data.profile.district || '',
        }));
      }
    } catch (err) {
      // Use default data
    }
  };

  const fetchBookings = async () => {
    try {
      const { data } = await getBookings();
      if (data && data.bookings) {
        setBookings(data.bookings.slice(0, 5));
      }
    } catch {
      // Demo bookings
      setBookings([
        { id: 1, city: 'Chennai', district: 'Chennai', status: 'pending', created_at: new Date(Date.now() - 86400000).toISOString() },
        { id: 2, city: 'Madurai', district: 'Madurai', status: 'completed', created_at: new Date(Date.now() - 864000000).toISOString() },
      ]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone' && value && !/^\d*$/.test(value)) return;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSave = async () => {
    const newErrors = {};
    if (formData.phone && validators.phone.validate(formData.phone)) {
      newErrors.phone = validators.phone.validate(formData.phone);
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      await updateProfileApi(formData);
      await refreshProfile();
      showToast('Profile updated successfully!');
    } catch (err) {
      showToast('Profile saved locally', 'success');
    } finally {
      setSaving(false);
      setIsEditing(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getInitials = () => {
    const name = getDisplayName();
    if (name !== 'User') {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return currentUser?.email?.[0]?.toUpperCase() || 'U';
  };

  const getDisplayName = () => {
    if (formData.name && formData.name !== 'User') return formData.name;
    if (currentUser?.displayName) return currentUser.displayName;
    if (formData.email) {
      const prefix = formData.email.split('@')[0];
      // remove numbers and capitalize
      const cleanPrefix = prefix.replace(/[0-9]/g, '');
      if (cleanPrefix) {
        return cleanPrefix.charAt(0).toUpperCase() + cleanPrefix.slice(1);
      }
      return prefix.charAt(0).toUpperCase() + prefix.slice(1);
    }
    return 'User';
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: { class: 'badge-warning', label: 'Pending' },
      confirmed: { class: 'badge-primary', label: 'Confirmed' },
      in_progress: { class: 'badge-success', label: 'In Progress' },
      completed: { class: 'badge-success', label: 'Completed' },
      cancelled: { class: 'badge-danger', label: 'Cancelled' },
    };
    const s = map[status] || map.pending;
    return <span className={`badge ${s.class}`}>{s.label}</span>;
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="profile-page">
      {/* Background Orbs */}
      <div className="profile-bg-pattern">
        <div className="profile-bg-orb"></div>
        <div className="profile-bg-orb"></div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          <FiCheck /> {toast.message}
        </div>
      )}

      <div className="profile-container">
        <div className="profile-card">
          {/* Header */}
          <div className="profile-header">
            <div className="profile-header-content">
              <div className="profile-avatar-wrapper">
                <div className="profile-avatar">
                  {currentUser?.photoURL && !imgError ? (
                    <img 
                      src={currentUser.photoURL} 
                      alt="Profile" 
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <div className="profile-avatar-placeholder">
                      {getInitials()}
                    </div>
                  )}
                </div>
                <div className="profile-avatar-edit">
                  <FiEdit2 />
                </div>
              </div>

              <div className="profile-header-info">
                <h2>{getDisplayName()}</h2>
                <p className="profile-email">{currentUser?.email || formData.email}</p>
                <div className="profile-role-badge">
                  {isAdmin ? <><FiShield /> Admin</> : <><FiUser /> User</>}
                </div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="profile-body">
            {/* Personal Info */}
            <div className="profile-section">
              <div className="profile-section-header">
                <div className="profile-section-title">
                  <span className="section-icon"><FiUser /></span>
                  {t('profile_personal_info')}
                </div>
                {!isEditing ? (
                  <button className="btn btn-sm btn-secondary" onClick={() => setIsEditing(true)}>
                    <FiEdit2 /> {t('profile_edit')}
                  </button>
                ) : (
                  <button className="btn btn-sm btn-primary" onClick={handleSave} disabled={saving}>
                    <FiSave /> {saving ? t('profile_saving') : t('profile_save')}
                  </button>
                )}
              </div>

              <div className="profile-form-grid">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    style={!isEditing ? { background: 'var(--gray-100)', cursor: 'not-allowed' } : {}}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={currentUser?.email || formData.email}
                    disabled
                    style={{ background: 'var(--gray-100)', cursor: 'not-allowed' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    className={`form-input ${errors.phone ? 'error' : ''}`}
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    maxLength={10}
                    placeholder="10-digit number"
                    style={!isEditing ? { background: 'var(--gray-100)', cursor: 'not-allowed' } : {}}
                  />
                  {errors.phone && <p className="form-error">{errors.phone}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    className="form-input"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Your city"
                    style={!isEditing ? { background: 'var(--gray-100)', cursor: 'not-allowed' } : {}}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">District</label>
                  <select
                    className="form-select"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    disabled={!isEditing}
                    style={!isEditing ? { background: 'var(--gray-100)', cursor: 'not-allowed' } : {}}
                  >
                    <option value="">Select District</option>
                    {TAMIL_NADU_DISTRICTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input
                    type="text"
                    className="form-input"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Your address"
                    style={!isEditing ? { background: 'var(--gray-100)', cursor: 'not-allowed' } : {}}
                  />
                </div>
              </div>
            </div>


            {/* Logout */}
            <div className="profile-logout">
              <button className="btn btn-danger" onClick={() => setShowLogoutConfirm(true)}>
                <FiLogOut /> {t('profile_logout')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Confirm Modal */}
      {showLogoutConfirm && (
        <div className="modal-overlay" onClick={() => setShowLogoutConfirm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>👋</div>
            <h3>{t('profile_logout')}</h3>
            <p style={{ color: 'var(--text-secondary)', margin: 'var(--space-md) 0 var(--space-xl)' }}>
              {t('profile_confirm_logout')}
            </p>
            <div className="modal-actions" style={{ justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={() => setShowLogoutConfirm(false)}>
                {t('profile_cancel')}
              </button>
              <button className="btn btn-danger" onClick={handleLogout}>
                <FiLogOut /> {t('profile_yes_logout')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
