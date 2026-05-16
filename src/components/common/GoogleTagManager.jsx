// src/components/common/GoogleTagManager.jsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const GoogleTagManager = () => {
  const location = useLocation();

  useEffect(() => {
    // Jab bhi route change ho, GTM ko naya page view bhejo
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'pageview',
        page: location.pathname + location.search,
      });
       console.log('Pageview tracked:', location.pathname);
    }
  }, [location]);

  return null;
};

export default GoogleTagManager;