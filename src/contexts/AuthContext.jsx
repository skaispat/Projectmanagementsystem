import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check for existing user session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('mis_user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      // Only allow admin users
      if (parsedUser.role === 'admin') {
        setUser(parsedUser);
      } else {
        localStorage.removeItem('mis_user');
      }
    }
    setLoading(false);
  }, []);

  // Login function - Admin only
  const login = async (username, password) => {
    setLoading(true);
    
    // Only accept admin credentials
    if (username === 'admin' && password === 'admin123') {
      const adminUser = {
        id: 'admin-001',
        name: 'Admin User',
        role: 'admin',
        image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=600'
      };
      setUser(adminUser);
      localStorage.setItem('mis_user', JSON.stringify(adminUser));
      setLoading(false);
      return true;
    }
    
    setLoading(false);
    return false;
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('mis_user');
    setUser(null);
    navigate('/login');
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}