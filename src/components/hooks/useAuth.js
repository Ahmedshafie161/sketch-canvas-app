import React, { useState, useRef } from 'react';

const useAuth = (setCurrentUser, setIsAuthenticated, setFolders, setFiles, setCurrentFile, setCanvasObjects, setConnections) => {
  const [authMode, setAuthMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

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
        // loadUserData(username); // Should be called in parent
      } else {
        alert('Invalid credentials');
      }
    }
  };

  return {
    authMode,
    setAuthMode,
    username,
    setUsername,
    password,
    setPassword,
    handleAuth,
  };
};

export default useAuth;
