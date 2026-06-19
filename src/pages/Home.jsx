/* ============================================
   HOME PAGE - Gowtham Paints
   ============================================ */

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPaintRoller, FaHome, FaPalette, FaShieldAlt, FaTint, FaTools, FaHandshake, FaStar } from 'react-icons/fa';
import { FiArrowRight, FiAward, FiUsers, FiClock, FiCheckCircle } from 'react-icons/fi';
import './Home.css';

const Home = () => {
  const [counters, setCounters] = useState({ projects: 0, customers: 0, years: 0, cities: 0 });
  const countersRef = useRef(null);
  const servicesRef = useRef(null);
  const hasAnimated = useRef(false);

  // Services data
  const services = [
    { icon: <FaPaintRoller />, title: 'Interior Painting', desc: 'Transform your indoor spaces with premium quality paints and expert techniques. From accent walls to complete room makeovers.' },
    { icon: <FaHome />, title: 'Exterior Painting', desc: 'Protect and beautify your building exterior with weather-resistant paints that last for years.' },
    { icon: <FaPalette />, title: 'Texture Painting', desc: 'Add dimension and character with stunning texture finishes — stucco, knockdown, sand, and designer patterns.' },
    { icon: <FaTint />, title: 'Waterproofing', desc: 'Keep your walls safe from moisture damage with professional waterproofing solutions.' },
    { icon: <FaTools />, title: 'Wood Polishing', desc: 'Restore and protect wood surfaces with premium polishing and lacquer finish services.' },
    { icon: <FaShieldAlt />, title: 'Wall Putty & Primer', desc: 'Prepare surfaces perfectly for a flawless paint finish with professional putty and primer application.' },
  ];

  // Color palette
  const colorPalette = [
    { color: '#E65100', name: 'Sunset Orange' },
    { color: '#FFB300', name: 'Golden Amber' },
    { color: '#00897B', name: 'Teal Breeze' },
    { color: '#1565C0', name: 'Royal Blue' },
    { color: '#AD1457', name: 'Rose Wine' },
    { color: '#2E7D32', name: 'Forest Green' },
    { color: '#6A1B9A', name: 'Royal Purple' },
    { color: '#FF6F00', name: 'Mango' },
    { color: '#00838F', name: 'Deep Cyan' },
    { color: '#C62828', name: 'Cherry Red' },
    { color: '#4E342E', name: 'Walnut Brown' },
    { color: '#37474F', name: 'Charcoal' },
    { color: '#F9A825', name: 'Sunflower' },
    { color: '#558B2F', name: 'Olive' },
    { color: '#D84315', name: 'Terracotta' },
    { color: '#283593', name: 'Indigo' },
  ];

  // Testimonials
  const testimonials = [
    { name: 'Rajesh Kumar', location: 'Chennai', rating: 5, text: 'Gowtham Paints did an amazing job on our home interior. The texture painting in the living room is absolutely stunning. Highly professional team!' },
    { name: 'Priya Lakshmi', location: 'Madurai', rating: 5, text: 'We hired them for exterior waterproofing and painting. The quality of work is excellent. No issues even after monsoon season!' },
    { name: 'Suresh Babu', location: 'Coimbatore', rating: 4, text: 'Great service and reasonable prices. The team was punctual and completed the work within the promised timeline. Will definitely recommend.' },
    { name: 'Meena Devi', location: 'Tiruchirappalli', rating: 5, text: 'Best painting service in Tamil Nadu! They helped us choose the perfect colors and the finish is flawless. Our house looks brand new.' },
    { name: 'Karthik Rajan', location: 'Salem', rating: 5, text: 'Professional, courteous, and skilled. The wood polishing work on our doors and windows exceeded our expectations.' },
  ];

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Service cards animation
          const cards = entry.target.querySelectorAll('.service-card, .counter-card');
          cards.forEach((card, i) => {
            setTimeout(() => {
              card.classList.add('visible');
            }, i * 100);
          });

          // Counter animation
          if (entry.target === countersRef.current && !hasAnimated.current) {
            hasAnimated.current = true;
            animateCounters();
          }
        }
      });
    }, { threshold: 0.2 });

    if (servicesRef.current) observer.observe(servicesRef.current);
    if (countersRef.current) observer.observe(countersRef.current);

    return () => observer.disconnect();
  }, []);

  // Animate counters
  const animateCounters = () => {
    const targets = { projects: 500, customers: 1200, years: 10, cities: 38 };
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic

      setCounters({
        projects: Math.round(targets.projects * eased),
        customers: Math.round(targets.customers * eased),
        years: Math.round(targets.years * eased),
        cities: Math.round(targets.cities * eased),
      });

      if (step >= steps) clearInterval(timer);
    }, interval);
  };

  return (
    <div className="home-page">
      {/* ==================== HERO ==================== */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-gradient-orb hero-orb-1"></div>
          <div className="hero-gradient-orb hero-orb-2"></div>
          <div className="hero-gradient-orb hero-orb-3"></div>
        </div>

        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-badge">
              <span className="dot"></span>
              #1 Paint Service in Tamil Nadu
            </div>

            <h1 className="hero-title">
              Transform Your Space With{' '}
              <span className="highlight">Perfect Colors</span>
            </h1>

            <p className="hero-description">
              Premium paint and construction services across Tamil Nadu. 
              From elegant interiors to durable exteriors — we bring your vision to life 
              with expert craftsmanship and quality materials.
            </p>

            <div className="hero-actions">
              <Link to="/booking" className="btn btn-primary btn-lg">
                Book Now <FiArrowRight />
              </Link>
              <Link to="/gallery" className="btn btn-secondary btn-lg" style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white' }}>
                View Gallery
              </Link>
            </div>

            <div className="hero-stats">
              <div className="hero-stat">
                <div className="hero-stat-value">500+</div>
                <div className="hero-stat-label">Projects Done</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-value">1200+</div>
                <div className="hero-stat-label">Happy Customers</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-value">10+</div>
                <div className="hero-stat-label">Years Experience</div>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-image-container">
              <div className="hero-paint-card">
                <div className="paint-colors-display">
                  <div className="paint-color"></div>
                  <div className="paint-color"></div>
                  <div className="paint-color"></div>
                  <div className="paint-color"></div>
                  <div className="paint-color"></div>
                </div>
                <h3>Choose Your Colors</h3>
                <p>Over 1000+ shades available</p>
              </div>

              <div className="floating-badge floating-badge-1">
                <span className="badge-icon">⭐</span>
                <span className="badge-text">4.9 Rating</span>
              </div>

              <div className="floating-badge floating-badge-2">
                <span className="badge-icon">✅</span>
                <span className="badge-text">Quality Guaranteed</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== SERVICES ==================== */}
      <section className="services-section" ref={servicesRef}>
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Our Services</span>
            <h2>What We <span className="text-gradient">Offer</span></h2>
            <p>Professional painting and construction services tailored to your needs. Quality workmanship guaranteed.</p>
          </div>

          <div className="services-grid">
            {services.map((service, i) => (
              <div key={i} className="service-card" style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className="service-icon">{service.icon}</div>
                <h4>{service.title}</h4>
                <p>{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== WHY CHOOSE US ==================== */}
      <section className="why-section" ref={countersRef}>
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Why Choose Us</span>
            <h2>Numbers That <span className="text-gradient">Speak</span></h2>
            <p>A decade of excellence in painting and construction services across Tamil Nadu.</p>
          </div>

          <div className="counters-grid">
            <div className="counter-card">
              <div className="counter-icon">🏠</div>
              <div className="counter-value">{counters.projects}+</div>
              <div className="counter-label">Projects Completed</div>
            </div>
            <div className="counter-card">
              <div className="counter-icon">😊</div>
              <div className="counter-value">{counters.customers}+</div>
              <div className="counter-label">Happy Customers</div>
            </div>
            <div className="counter-card">
              <div className="counter-icon">📅</div>
              <div className="counter-value">{counters.years}+</div>
              <div className="counter-label">Years Experience</div>
            </div>
            <div className="counter-card">
              <div className="counter-icon">📍</div>
              <div className="counter-value">{counters.cities}</div>
              <div className="counter-label">Districts Covered</div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== COLOR PALETTE ==================== */}
      <section className="palette-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Color Palette</span>
            <h2>Popular <span className="text-gradient">Shades</span></h2>
            <p>Browse through our curated collection of trending paint colors for your home.</p>
          </div>

          <div className="palette-grid">
            {colorPalette.map((item, i) => (
              <div key={i} className="palette-item">
                <div className="palette-color" style={{ background: item.color }}></div>
                <span className="palette-name">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== TESTIMONIALS ==================== */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Testimonials</span>
            <h2>What Our <span className="text-gradient">Customers Say</span></h2>
            <p>Real reviews from real customers across Tamil Nadu.</p>
          </div>

          <div className="testimonials-track">
            {testimonials.map((review, i) => (
              <div key={i} className="testimonial-card">
                <div className="testimonial-stars">
                  {[...Array(5)].map((_, j) => (
                    <FaStar key={j} style={{ opacity: j < review.rating ? 1 : 0.2 }} />
                  ))}
                </div>
                <p className="testimonial-text">&ldquo;{review.text}&rdquo;</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">
                    {review.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="testimonial-author-info">
                    <h5>{review.name}</h5>
                    <p>{review.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== CTA ==================== */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Transform Your Space?</h2>
            <p>Book a free consultation today and let our experts help you choose the perfect colors.</p>
            <Link to="/booking" className="cta-btn">
              Book Free Consultation <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
