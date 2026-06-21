/* ============================================
   GALLERY DETAIL PAGE - Gowtham Paints
   ============================================ */

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getGalleryItem, addReview } from '../services/api';
import { FaStar } from 'react-icons/fa';
import { FiArrowLeft, FiSend, FiAlertCircle, FiX } from 'react-icons/fi';
import './Gallery.css';

const GalleryDetail = () => {
  const { id } = useParams();
  const { currentUser, isAuthenticated } = useAuth();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    fetchItem();
  }, [id]);

  const fetchItem = async () => {
    setLoading(true);
    setFetchError('');
    try {
      const { data, error } = await getGalleryItem(id);
      if (error) {
        setFetchError(error);
        setItem(null);
      } else if (data && data.item) {
        setItem(data.item);
      } else {
        setFetchError('Project not found');
        setItem(null);
      }
    } catch (err) {
      setFetchError(err.message || 'Something went wrong');
      setItem(null);
    } finally {
      setLoading(false);
    }
  };

  // Demo item fallback removed to expose real errors

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewError('');

    if (reviewRating === 0) {
      setReviewError('Please select a rating');
      return;
    }
    if (reviewText.trim().length < 10) {
      setReviewError('Review must be at least 10 characters');
      return;
    }

    setSubmittingReview(true);
    try {
      await addReview(id, { rating: reviewRating, review_text: reviewText });
    } catch (err) {
      // Continue with local state
    }

    const newReview = {
      id: Date.now(),
      user_name: currentUser?.displayName || 'User',
      rating: reviewRating,
      review_text: reviewText,
      created_at: new Date().toISOString()
    };

    setItem(prev => ({
      ...prev,
      reviews: [newReview, ...(prev.reviews || [])],
      total_reviews: (prev.total_reviews || 0) + 1,
      avg_rating: (((prev.avg_rating || 0) * (prev.total_reviews || 0)) + reviewRating) / ((prev.total_reviews || 0) + 1)
    }));

    setReviewRating(0);
    setReviewText('');
    setSubmittingReview(false);
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <FaStar key={i} style={{ color: i < Math.round(rating) ? 'var(--secondary)' : 'var(--gray-300)' }} />
    ));
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  };

  if (loading) {
    return (
      <div className="detail-page">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <div className="loader"></div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="detail-page">
        <div className="container" style={{ textAlign: 'center', paddingTop: '120px' }}>
          <h2>{fetchError || 'Project not found'}</h2>
          <Link to="/gallery" className="btn btn-primary" style={{ marginTop: '20px' }}>Back to Gallery</Link>
        </div>
      </div>
    );
  }

  const images = item.images && item.images.length > 0 ? item.images : [item.color || '#E65100'];
  const currentImg = images[activeImage];
  const isUrl = (str) => {
    if (!str || typeof str !== 'string') return false;
    return str.startsWith('/') || str.startsWith('http') || str.startsWith('data:');
  };
  const getImgSrc = (str) => {
    if (!str || typeof str !== 'string') return '';
    return str.startsWith('/') ? `http://localhost:5000${str}` : str;
  };

  return (
    <div className="detail-page">
      <div className="container">
        <div className="detail-back">
          <Link to="/gallery"><FiArrowLeft /> Back to Gallery</Link>
        </div>

        <div className="detail-content">
          {/* Images */}
          <div className="detail-images">
            <div className="detail-main-image" onClick={() => setIsLightboxOpen(true)} style={{ cursor: 'pointer' }}>
              {isUrl(currentImg) ? (
                <img src={getImgSrc(currentImg)} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  background: `linear-gradient(135deg, ${currentImg}, ${currentImg}88)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '5rem'
                }}>
                  🎨
                </div>
              )}
            </div>

            <div className="detail-thumbnails">
              {images.map((img, i) => (
                <div
                  key={i}
                  className={`detail-thumb ${activeImage === i ? 'active' : ''}`}
                  onClick={() => setActiveImage(i)}
                >
                  {isUrl(img) ? (
                     <img src={getImgSrc(img)} alt={`Thumb ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      background: `linear-gradient(135deg, ${img}, ${img}88)`
                    }}></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="detail-info">
            <span className="detail-category">{item.category}</span>
            <h1>{item.title}</h1>

            <div className="detail-rating">
              <div className="stars">{renderStars(item.avg_rating)}</div>
              <span className="rating-text">
                {Number(item.avg_rating || 0).toFixed(1)} ({item.total_reviews} reviews)
              </span>
            </div>

            <p className="detail-description">{item.description}</p>

            {/* Reviews */}
            <div className="reviews-section">
              <h3>Customer Reviews</h3>

              {/* Review Form */}
              {isAuthenticated && (
                <div className="review-form">
                  <h4>Leave a Review</h4>
                  <form onSubmit={handleSubmitReview}>
                    <div className="star-select">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          className={`star-btn ${star <= (reviewHover || reviewRating) ? 'filled' : ''}`}
                          onClick={() => setReviewRating(star)}
                          onMouseEnter={() => setReviewHover(star)}
                          onMouseLeave={() => setReviewHover(0)}
                        >
                          <FaStar />
                        </button>
                      ))}
                    </div>

                    <div className="form-group">
                      <textarea
                        className="form-input"
                        placeholder="Share your experience..."
                        rows={3}
                        value={reviewText}
                        onChange={e => { setReviewText(e.target.value); setReviewError(''); }}
                        style={{ resize: 'vertical' }}
                      />
                    </div>

                    {reviewError && (
                      <p className="form-error" style={{ marginBottom: 'var(--space-md)' }}>
                        <FiAlertCircle size={14} /> {reviewError}
                      </p>
                    )}

                    <button type="submit" className="btn btn-primary btn-sm" disabled={submittingReview}>
                      <FiSend /> {submittingReview ? 'Posting...' : 'Post Review'}
                    </button>
                  </form>
                </div>
              )}

              {/* Review List */}
              <div className="review-list">
                {(item.reviews || []).map(review => (
                  <div key={review.id} className="review-item">
                    <div className="review-header">
                      <div className="review-author">
                        <div className="review-avatar">{getInitials(review.user_name)}</div>
                        <div>
                          <div className="review-author-name">{review.user_name}</div>
                          <div className="review-date">{formatDate(review.created_at)}</div>
                        </div>
                      </div>
                      <div className="review-stars">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                    <p className="review-text">{review.review_text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isLightboxOpen && (
        <div className="lightbox-overlay" onClick={() => setIsLightboxOpen(false)}>
          <button className="lightbox-close" onClick={() => setIsLightboxOpen(false)}>
            <FiX size={30} />
          </button>
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            {isUrl(currentImg) ? (
              <img src={getImgSrc(currentImg)} alt={item.title} />
            ) : (
              <div style={{
                width: '80vw',
                height: '80vh',
                background: `linear-gradient(135deg, ${currentImg}, ${currentImg}88)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10rem',
                borderRadius: '16px'
              }}>
                🎨
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryDetail;
