import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const savedAuth = localStorage.getItem('canvasAuth');
    if (savedAuth) {
      const { user } = JSON.parse(savedAuth);
      setCurrentUser(user);
      setIsAuthenticated(true);
    }
  }, []);

  const handleAuth = (e) => {
    e.preventDefault();
    if (!username || !password) return;

    const users = JSON.parse(localStorage.getItem('canvasUsers') || '{}');

    if (authMode === 'register') {
      if (users[username]) {
        alert('Username already exists');
        return;
      }
      users[username] = password;
      localStorage.setItem('canvasUsers', JSON.stringify(users));
      alert('Registration successful! Please login.');
      setAuthMode('login');
      setPassword('');
    } else {
      if (users[username] === password) {
        setCurrentUser(username);
        setIsAuthenticated(true);
        localStorage.setItem('canvasAuth', JSON.stringify({ user: username }));
      } else {
        alert('Invalid credentials');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('canvasAuth');
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  return {
    isAuthenticated,
    currentUser,
    authMode,
    username,
    password,
    setAuthMode,
    setUsername,
    setPassword,
    handleAuth,
    handleLogout,
  };
};
