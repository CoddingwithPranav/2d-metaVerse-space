import { useEffect, useCallback, useState } from 'react'; // Import useCallback
import { useZustandAuth } from '@/store/authStore'; // Assuming this path is correct
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Import jwtDecode

// Define the expected structure of your JWT payload
// Adjust these properties based on what your backend sends in the token
interface DecodedTokenPayload {
  userId: string;
  email: string;
  role: string; // The property holding the user's role
  exp: number; // Expiration timestamp (in seconds since epoch)
  iat: number; // Issued at timestamp (in seconds since epoch)
  // Add any other properties your JWT payload might contain
}

const useAuth = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Changed router to navigate for clarity with react-router-dom v6
  const { token, role, setAuth, clearAuth } = useZustandAuth(); // Destructure role from Zustand

  // Use useCallback for logout to ensure stable reference for useEffect dependency
  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    clearAuth();
    navigate('/login'); // Use navigate function directly
  }, [clearAuth, navigate]);

  const saveAuthData = (newToken: string) => {
    localStorage.setItem('authToken', newToken);
    try {
      const decoded = jwtDecode<DecodedTokenPayload>(newToken);
      const userRole = decoded.role || null; // Extract the role
      setAuth(newToken, userRole); // Store both token and role in Zustand
    } catch (error) {
      console.error('Error decoding new token:', error);
      // If the new token is invalid, clear authentication
      clearAuth();
      navigate('/login');
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      try {
        const decoded = jwtDecode<DecodedTokenPayload>(storedToken);
        const userRole = decoded.role || null;

        // Check for token expiration
        // JWT `exp` is in seconds, Date.now() is in milliseconds, so multiply by 1000
        if (decoded.exp * 1000 < Date.now()) {
          console.log('Token expired. Logging out...');
          logout(); // Token expired, clear auth
        } else {
          setAuth(storedToken, userRole); // Set auth state if token is valid and not expired
        }
      } catch (error) {
        console.error('Invalid or malformed token found in localStorage:', error);
        logout(); // Clear auth if token is invalid or malformed
      }
    } else {
      // If no token in localStorage, ensure Zustand state is also clear
      clearAuth();
    }
    setLoading(false);
  }, [setAuth, clearAuth, logout]); // Add logout to dependencies as it's used inside useEffect

  return { token, role, saveAuthData, logout, loading }; // Expose the role
};

export default useAuth;