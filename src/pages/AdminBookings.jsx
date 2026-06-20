/* ============================================
   ADMIN BOOKINGS PAGE - Gowtham Paints
   ============================================ */

import { useState, useEffect } from 'react';
import { getBookings, updateBooking, deleteBooking } from '../services/api';
import { FiSearch, FiCalendar, FiPhone, FiMail, FiMapPin, FiMap, FiClock, FiCheck, FiX, FiPlay, FiAlertCircle, FiDownload, FiEye, FiTrash2 } from 'react-icons/fi';
import { FaClipboardList, FaCheckCircle, FaHourglassHalf } from 'react-icons/fa';
import './AdminBookings.css';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mainTab, setMainTab] = useState('active'); // 'active' or 'completed'
  const [activeFilter, setActiveFilter] = useState('all'); // for active tab
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);

  // Modals
  const [viewModal, setViewModal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Fetch bookings periodically
  useEffect(() => {
    fetchBookings();
    const interval = setInterval(() => {
      fetchBookings(false); // fetch without setting loading to true
    }, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchBookings = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const { data } = await getBookings();
      if (data && data.bookings) {
        setBookings(data.bookings);
      } else {
        setBookings([]);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter bookings based on mainTab, activeFilter, and searchQuery
  useEffect(() => {
    let filtered = [...bookings];

    if (mainTab === 'active') {
      filtered = filtered.filter(b => b.status !== 'completed');
      if (activeFilter !== 'all') {
        filtered = filtered.filter(b => b.status === activeFilter);
      }
    } else if (mainTab === 'completed') {
      filtered = filtered.filter(b => b.status === 'completed');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(b =>
        b.customer_name?.toLowerCase().includes(q) ||
        b.phone?.includes(q) ||
        b.email?.toLowerCase().includes(q) ||
        b.city?.toLowerCase().includes(q) ||
        b.district?.toLowerCase().includes(q)
      );
    }

    setFilteredBookings(filtered);
  }, [mainTab, activeFilter, searchQuery, bookings]);

  // Update booking
  const handleUpdateBooking = async (id, updates) => {
    try {
      await updateBooking(id, updates);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
      showToast(`Booking #${id} updated successfully!`, 'success');
    } catch (err) {
      showToast('Failed to update booking', 'error');
    }
  };

  const handleDeleteBooking = async (id) => {
    try {
      await deleteBooking(id);
      setBookings(prev => prev.filter(b => b.id !== id));
      showToast(`Project #${id} deleted successfully!`, 'success');
      setDeleteConfirm(null);
    } catch (err) {
      showToast('Failed to delete project', 'error');
    }
  };

  const handleStatusChange = (id, newStatus) => {
    handleUpdateBooking(id, { status: newStatus });
  };

  const handleDateChange = (id, date) => {
    handleUpdateBooking(id, { allocated_date: date, status: 'confirmed' });
  };

  const handleNotesChange = (id, notes) => {
    setBookings(prev =>
      prev.map(b => b.id === id ? { ...b, admin_notes: notes } : b)
    );
  };

  const handleNotesSave = (id) => {
    const booking = bookings.find(b => b.id === id);
    if (booking) {
      handleUpdateBooking(id, { admin_notes: booking.admin_notes });
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const exportToExcel = () => {
    const completedProjects = bookings.filter(b => b.status === 'completed');
    if (completedProjects.length === 0) {
      showToast('No completed projects to export', 'error');
      return;
    }

    // Prepare CSV headers
    const headers = ['ID', 'Customer Name', 'Phone', 'Email', 'Address', 'City', 'District', 'State', 'Allocated Date', 'Completed Date', 'Admin Notes'];
    
    // Prepare CSV rows
    const rows = completedProjects.map(b => [
      b.id,
      `"${b.customer_name}"`,
      `"${b.phone}"`,
      `"${b.email}"`,
      `"${b.address}"`,
      `"${b.city}"`,
      `"${b.district}"`,
      `"${b.state}"`,
      b.allocated_date ? new Date(b.allocated_date).toLocaleDateString('en-IN') : '',
      b.updated_at ? new Date(b.updated_at).toLocaleDateString('en-IN') : '',
      `"${(b.admin_notes || '').replace(/"/g, '""')}"`
    ]);

    // Combine headers and rows
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    // Create and download Blob
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `GowthamPaints_Completed_Projects_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('Excel file downloaded!', 'success');
  };

  // Stats
  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
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
    if (!dateStr) return 'Not assigned';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loader-overlay" style={{ background: 'transparent', position: 'relative', minHeight: '60vh' }}>
          <div className="loader"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* Toast */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === 'success' ? <FiCheck /> : <FiAlertCircle />}
          {toast.message}
        </div>
      )}

      {/* Hero */}
      <div className="admin-hero">
        <div className="container admin-hero-content">
          <h1>📋 Booking Management</h1>
          <p>Manage all customer bookings, allocate dates, and track progress</p>

          <div className="admin-stats">
            <div className="stat-card">
              <div className="stat-card-header">
                <div className="stat-card-icon orange"><FaClipboardList /></div>
              </div>
              <div className="stat-card-value">{stats.total}</div>
              <div className="stat-card-label">Total Bookings</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-header">
                <div className="stat-card-icon yellow"><FaHourglassHalf /></div>
              </div>
              <div className="stat-card-value">{stats.pending}</div>
              <div className="stat-card-label">Pending</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-header">
                <div className="stat-card-icon blue"><FiCheck /></div>
              </div>
              <div className="stat-card-value">{stats.confirmed}</div>
              <div className="stat-card-label">Confirmed</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-header">
                <div className="stat-card-icon green"><FaCheckCircle /></div>
              </div>
              <div className="stat-card-value">{stats.completed}</div>
              <div className="stat-card-label">Completed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="admin-content">
        <div className="container">
          
          {/* Main Tabs */}
          <div className="admin-main-tabs">
            <button 
              className={`main-tab-btn ${mainTab === 'active' ? 'active' : ''}`}
              onClick={() => { setMainTab('active'); setActiveFilter('all'); }}
            >
              🚀 Active Bookings
            </button>
            <button 
              className={`main-tab-btn ${mainTab === 'completed' ? 'active' : ''}`}
              onClick={() => { setMainTab('completed'); setActiveFilter('all'); }}
            >
              ✅ Completed Projects
            </button>
          </div>

          {/* Toolbar */}
          <div className="admin-toolbar">
            <div className="admin-search">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search by name, phone, email, city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="admin-filters">
              {mainTab === 'active' && (
                <>
                  {['all', 'pending', 'confirmed', 'in_progress', 'cancelled'].map(filter => (
                    <button
                      key={filter}
                      className={`filter-btn ${activeFilter === filter ? 'active' : ''}`}
                      onClick={() => setActiveFilter(filter)}
                    >
                      {filter === 'all' ? 'All' : filter.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </button>
                  ))}
                </>
              )}

              {mainTab === 'completed' && (
                <button className="btn btn-primary btn-sm" onClick={exportToExcel}>
                  <FiDownload /> Download Excel
                </button>
              )}
            </div>
          </div>

          {/* Bookings List */}
          {filteredBookings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">{mainTab === 'completed' ? '🏆' : '📭'}</div>
              <h3>{mainTab === 'completed' ? 'No completed projects' : 'No bookings found'}</h3>
              <p>Try adjusting your filters or search query</p>
            </div>
          ) : (
            <div className={mainTab === 'completed' ? 'completed-grid' : 'bookings-grid'}>
              {filteredBookings.map(booking => (
                <div key={booking.id} className="booking-card">
                  <div className="booking-card-header">
                    <div className="booking-customer">
                      <div className="booking-avatar">
                        {getInitials(booking.customer_name)}
                      </div>
                      <div className="booking-customer-info">
                        <h4>{booking.customer_name}</h4>
                        <p>GP-{String(booking.id).padStart(4, '0')} • {booking.city}, {booking.district}</p>
                      </div>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>

                  {mainTab === 'active' ? (
                    <>
                      <div className="booking-card-body">
                        <div className="booking-detail">
                          <FiPhone className="booking-detail-icon" />
                          <div>
                            <div className="booking-detail-label">Phone</div>
                            <div className="booking-detail-value">{booking.phone}</div>
                          </div>
                        </div>

                        <div className="booking-detail">
                          <FiMapPin className="booking-detail-icon" />
                          <div>
                            <div className="booking-detail-label">Address</div>
                            <div className="booking-detail-value">{booking.address}</div>
                          </div>
                        </div>

                        <div className="booking-detail">
                          <FiCalendar className="booking-detail-icon" />
                          <div>
                            <div className="booking-detail-label">Allocated Date</div>
                            <div className="booking-detail-value">{formatDate(booking.allocated_date)}</div>
                          </div>
                        </div>

                        <div className="booking-detail">
                          <FiClock className="booking-detail-icon" />
                          <div>
                            <div className="booking-detail-label">Booked On</div>
                            <div className="booking-detail-value">{formatDate(booking.created_at)}</div>
                          </div>
                        </div>
                      </div>

                      <div className="booking-card-actions">
                        <div className="booking-date-picker">
                          <label><FiCalendar /> Assign Date:</label>
                          <input
                            type="date"
                            value={booking.allocated_date ? booking.allocated_date.split('T')[0] : ''}
                            onChange={(e) => handleDateChange(booking.id, e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>

                        <div className="status-actions">
                          {booking.status !== 'confirmed' && (
                            <button className="btn btn-sm btn-primary" onClick={() => handleStatusChange(booking.id, 'confirmed')}>
                              <FiCheck /> Confirm
                            </button>
                          )}
                          {booking.status !== 'in_progress' && (
                            <button className="btn btn-sm btn-accent" onClick={() => handleStatusChange(booking.id, 'in_progress')}>
                              <FiPlay /> Start
                            </button>
                          )}
                          <button className="btn btn-sm" style={{ background: 'var(--accent)', color: 'white' }} onClick={() => handleStatusChange(booking.id, 'completed')}>
                            <FaCheckCircle /> Complete
                          </button>
                          {booking.status !== 'cancelled' && (
                            <button className="btn btn-sm btn-danger" onClick={() => handleStatusChange(booking.id, 'cancelled')}>
                              <FiX /> Cancel
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="booking-notes">
                        <label className="form-label" style={{ fontSize: '0.7rem' }}>Admin Notes</label>
                        <textarea
                          placeholder="Add notes about this booking..."
                          value={booking.admin_notes || ''}
                          onChange={(e) => handleNotesChange(booking.id, e.target.value)}
                          onBlur={() => handleNotesSave(booking.id)}
                        />
                      </div>
                    </>
                  ) : (
                    /* Completed Project Card Body */
                    <div className="completed-card-actions">
                       <p className="completed-date">Completed on: {formatDate(booking.updated_at || booking.created_at)}</p>
                       <div className="completed-btn-group">
                         <button className="btn btn-sm btn-secondary" onClick={() => setViewModal(booking)}>
                           <FiEye /> View Details
                         </button>
                         <button className="btn btn-sm btn-danger" onClick={() => setDeleteConfirm(booking.id)}>
                           <FiTrash2 /> Delete
                         </button>
                       </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ textAlign: 'center' }}>
            <div className="empty-state-icon" style={{ color: '#D32F2F', fontSize: '3rem', marginBottom: '16px' }}>
              <FiTrash2 />
            </div>
            <h3>Delete Project?</h3>
            <p style={{ marginBottom: '24px', color: 'var(--text-secondary)' }}>
              Are you sure you want to permanently delete this completed project? This action cannot be undone.
            </p>
            <div className="modal-actions" style={{ justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDeleteBooking(deleteConfirm)}>
                <FiTrash2 /> Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {viewModal && (
        <div className="modal-overlay" onClick={() => setViewModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <h3 style={{ marginBottom: '4px' }}>Project GP-{String(viewModal.id).padStart(4, '0')} Details</h3>
                {getStatusBadge(viewModal.status)}
              </div>
              <button className="btn btn-icon" style={{ background: 'var(--gray-100)', color: 'var(--text-secondary)' }} onClick={() => setViewModal(null)}>
                <FiX />
              </button>
            </div>

            <div className="detail-modal-grid">
              <div className="detail-modal-item">
                <span className="detail-modal-label"><FiPhone /> Customer Name</span>
                <span className="detail-modal-value">{viewModal.customer_name}</span>
              </div>
              <div className="detail-modal-item">
                <span className="detail-modal-label"><FiPhone /> Phone</span>
                <span className="detail-modal-value">{viewModal.phone}</span>
              </div>
              <div className="detail-modal-item">
                <span className="detail-modal-label"><FiMail /> Email</span>
                <span className="detail-modal-value">{viewModal.email}</span>
              </div>
              <div className="detail-modal-item">
                <span className="detail-modal-label"><FiMapPin /> Full Address</span>
                <span className="detail-modal-value">{viewModal.address}, {viewModal.city}, {viewModal.district}, {viewModal.state}</span>
              </div>
              <div className="detail-modal-item">
                <span className="detail-modal-label"><FiClock /> Booked On</span>
                <span className="detail-modal-value">{formatDate(viewModal.created_at)}</span>
              </div>
              <div className="detail-modal-item">
                <span className="detail-modal-label"><FiCalendar /> Allocated Date</span>
                <span className="detail-modal-value">{formatDate(viewModal.allocated_date)}</span>
              </div>
              <div className="detail-modal-item" style={{ gridColumn: '1 / -1' }}>
                <span className="detail-modal-label">Admin Notes</span>
                <div className="detail-modal-value" style={{ background: 'var(--gray-100)', padding: '12px', borderRadius: '8px', marginTop: '8px' }}>
                  {viewModal.admin_notes || 'No notes available.'}
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn btn-primary" onClick={() => setViewModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;
