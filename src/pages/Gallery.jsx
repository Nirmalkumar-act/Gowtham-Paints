/* ============================================
   GALLERY PAGE - Gowtham Paints
   ============================================ */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getGalleryItems, addGalleryItem, deleteGalleryItem } from '../services/api';
import { FaStar, FaPlus, FaPaintBrush } from 'react-icons/fa';
import { FiImage, FiUpload, FiX, FiTrash2, FiEye, FiCamera } from 'react-icons/fi';
import './Gallery.css';

const Gallery = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({ title: '', description: '', category: 'Interior' });
  const [uploadImages, setUploadImages] = useState([]);
  const [uploadPreviews, setUploadPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const gridRef = useRef(null);

  const categories = ['Interior', 'Exterior', 'Texture', 'Waterproofing', 'Wood Polish'];

  useEffect(() => {
    fetchItems();
  }, []);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('gallery-card-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const cards = document.querySelectorAll('.gallery-card');
    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, [items]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const { data } = await getGalleryItems();
      if (data && data.items) {
        setItems(data.items);
      } else {
        setItems([]);
      }
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle image upload
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setUploadImages(prev => [...prev, ...files]);

      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          setUploadPreviews(prev => [...prev, ev.target.result]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeUploadImage = (index) => {
    setUploadImages(prev => prev.filter((_, i) => i !== index));
    setUploadPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadData.title.trim()) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', uploadData.title);
      formData.append('description', uploadData.description);
      formData.append('category', uploadData.category);
      uploadImages.forEach(img => {
        formData.append('images', img);
      });

      await addGalleryItem(formData);

      // Refresh from server to get correct data
      await fetchItems();
      setShowUploadModal(false);
      setUploadData({ title: '', description: '', category: 'Interior' });
      setUploadImages([]);
      setUploadPreviews([]);
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteGalleryItem(id);
      setItems(prev => prev.filter(item => item.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // Render stars
  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <FaStar
        key={i}
        className={i < Math.round(rating) ? 'star-filled' : 'star-empty'}
      />
    ));
  };

  // Get image source
  const getImageSrc = (item) => {
    if (item.image_url && !item.image_url.startsWith('data:')) {
      return `http://localhost:5000${item.image_url}`;
    }
    if (item.image_url && item.image_url.startsWith('data:')) {
      return item.image_url;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="gallery-page">
        <div className="gallery-loader">
          <div className="loader"></div>
          <p>Loading gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="gallery-page">
      {/* Hero Section */}
      <div className="gallery-hero">
        <div className="gallery-hero-bg">
          <div className="hero-shape hero-shape-1"></div>
          <div className="hero-shape hero-shape-2"></div>
          <div className="hero-shape hero-shape-3"></div>
        </div>
        <div className="container">
          <div className="gallery-hero-content">
            <div className="gallery-hero-badge">
              <FaPaintBrush /> Our Portfolio
            </div>
            <h1>Our <span className="text-gradient">Gallery</span></h1>
            <p>Explore our stunning painting & construction projects across Tamil Nadu</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="gallery-content">
        <div className="container">
          {/* Toolbar */}
          <div className="gallery-toolbar">
            <div className="gallery-toolbar-left">
              <span className="gallery-count">
                <FiImage />
                {items.length} {items.length === 1 ? 'project' : 'projects'}
              </span>
            </div>

            {/* Admin Only - Add Photo Button */}
            {isAdmin && (
              <button
                className="btn btn-primary gallery-add-btn"
                onClick={() => setShowUploadModal(true)}
                id="add-photo-btn"
              >
                <FaPlus /> Add Photo
              </button>
            )}
          </div>

          {/* Gallery Masonry Grid */}
          {items.length > 0 ? (
            <div className="gallery-masonry" ref={gridRef}>
              {/* Admin Add Card */}
              {isAdmin && (
                <div
                  className="gallery-card gallery-card-visible add-card"
                  onClick={() => setShowUploadModal(true)}
                  id="add-project-card"
                >
                  <div className="add-card-inner">
                    <div className="add-card-icon">
                      <FiCamera />
                    </div>
                    <span className="add-card-text">Add New Project</span>
                    <span className="add-card-hint">Upload photos & details</span>
                  </div>
                </div>
              )}

              {/* Gallery Cards */}
              {items.map((item, i) => (
                <div
                  key={item.id}
                  className="gallery-card"
                  style={{ '--card-delay': `${i * 0.08}s` }}
                >
                  {/* Card Image */}
                  <div
                    className="gallery-card-image"
                    onClick={() => navigate(`/gallery/${item.id}`)}
                  >
                    {getImageSrc(item) ? (
                      <img
                        src={getImageSrc(item)}
                        alt={item.title}
                        loading="lazy"
                      />
                    ) : (
                      <div className="gallery-card-placeholder"
                        style={{
                          background: `linear-gradient(135deg, ${item.color || '#E65100'}, ${item.color ? item.color + '88' : '#FFB300'})`
                        }}
                      >
                        <FaPaintBrush />
                      </div>
                    )}

                    {/* Hover Overlay */}
                    <div className="gallery-card-hover-overlay">
                      <div className="overlay-action">
                        <FiEye />
                        <span>View Project</span>
                      </div>
                    </div>

                    {/* Category Badge */}
                    <span className="gallery-card-badge">{item.category}</span>
                  </div>

                  {/* Card Body */}
                  <div
                    className="gallery-card-body"
                    onClick={() => navigate(`/gallery/${item.id}`)}
                  >
                    <h4 className="gallery-card-title">{item.title}</h4>
                    <p className="gallery-card-desc">{item.description}</p>

                    <div className="gallery-card-footer">
                      <div className="gallery-card-rating">
                        <div className="stars">{renderStars(item.avg_rating)}</div>
                        <span className="rating-value">{Number(item.avg_rating || 0).toFixed(1)}</span>
                        <span className="rating-count">({item.total_reviews})</span>
                      </div>
                    </div>
                  </div>

                  {/* Admin Only - Delete Button */}
                  {isAdmin && (
                    <button
                      className="gallery-delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirm(item.id);
                      }}
                      title="Delete project"
                      id={`delete-project-${item.id}`}
                    >
                      <FiTrash2 />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="gallery-empty">
              <div className="gallery-empty-icon">
                <FiImage />
              </div>
              <h3>No Projects Yet</h3>
              <p>
                {isAdmin
                  ? 'Start showcasing your work by adding your first project photo!'
                  : 'Check back soon for amazing painting projects!'
                }
              </p>
              {isAdmin && (
                <button
                  className="btn btn-primary"
                  onClick={() => setShowUploadModal(true)}
                >
                  <FaPlus /> Add First Project
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="delete-modal" onClick={e => e.stopPropagation()}>
            <div className="delete-modal-icon">
              <FiTrash2 />
            </div>
            <h3>Delete Project?</h3>
            <p>This will permanently delete this project including all photos and reviews. This action cannot be undone.</p>
            <div className="delete-modal-actions">
              <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm)}>
                <FiTrash2 /> Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal - Admin Only */}
      {showUploadModal && isAdmin && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="upload-modal" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="upload-modal-header">
              <div>
                <h3>Add New Project</h3>
                <p>Upload photos and add project details</p>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setShowUploadModal(false)}
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleUpload} className="upload-form">
              {/* Image Upload Area */}
              <div className="upload-images-section">
                <label className="form-label">
                  <FiCamera /> Project Photos
                </label>
                <div className="upload-images-grid">
                  {uploadPreviews.map((preview, idx) => (
                    <div key={idx} className="upload-thumb">
                      <img src={preview} alt={`Preview ${idx + 1}`} />
                      {idx === 0 && <span className="cover-badge">Cover</span>}
                      <button
                        type="button"
                        className="upload-thumb-remove"
                        onClick={() => removeUploadImage(idx)}
                      >
                        <FiX />
                      </button>
                    </div>
                  ))}
                  <div
                    className="upload-add-btn"
                    onClick={() => document.getElementById('gallery-upload').click()}
                  >
                    <FiUpload />
                    <span>Add Photos</span>
                  </div>
                </div>
                <p className="upload-hint">First image will be the cover photo. You can add multiple images.</p>
              </div>
              <input
                id="gallery-upload"
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={handleImageSelect}
              />

              {/* Title */}
              <div className="form-group">
                <label className="form-label">Project Title *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Modern Living Room Painting"
                  value={uploadData.title}
                  onChange={e => setUploadData(prev => ({ ...prev, title: e.target.value }))}
                  required
                  id="project-title-input"
                />
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-input"
                  placeholder="Describe the project, paint types used, special techniques..."
                  rows={3}
                  value={uploadData.description}
                  onChange={e => setUploadData(prev => ({ ...prev, description: e.target.value }))}
                  style={{ resize: 'vertical' }}
                  id="project-desc-input"
                />
              </div>

              {/* Category */}
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={uploadData.category}
                  onChange={e => setUploadData(prev => ({ ...prev, category: e.target.value }))}
                  id="project-category-select"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Actions */}
              <div className="upload-modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowUploadModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={uploading || !uploadData.title.trim()}
                  id="submit-project-btn"
                >
                  {uploading ? (
                    <>
                      <span className="spinner-sm"></span> Uploading...
                    </>
                  ) : (
                    <>
                      <FiUpload /> Add Project
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
