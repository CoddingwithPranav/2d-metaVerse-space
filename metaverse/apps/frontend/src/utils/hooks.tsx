import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const usePageView = () => {
  const location = useLocation();
  useEffect(() => {
    console.log(`Page view: ${location.pathname}`);
  }, [location]);
};