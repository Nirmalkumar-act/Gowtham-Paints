import { useState, useEffect } from 'react';
import './SplashScreen.css';
import logo from '../assets/logo.png';

const SplashScreen = () => {
  const [show, setShow] = useState(true);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    // Keep the splash screen for 3 seconds for the slow cinematic intro
    const fadeTimer = setTimeout(() => {
      setFade(true);
    }, 3000);

    // Completely unmount after 3.8 seconds
    const removeTimer = setTimeout(() => {
      setShow(false);
    }, 3800);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!show) return null;

  return (
    <div className={`splash-screen ${fade ? 'fade-out' : ''}`}>
      <div className="splash-logo-wrapper">
        <img src={logo} alt="Gowtham Paints Logo" className="splash-logo" />
      </div>
    </div>
  );
};

export default SplashScreen;
