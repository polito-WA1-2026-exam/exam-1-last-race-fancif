import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Container, Spinner } from 'react-bootstrap';
import API from './API.js';
import NavHeader from './components/NavHeader';
import LoginForm from './components/LoginForm';
import GameArea from './components/GameArea';
import Ranking from './components/Ranking.jsx';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // check if the user already has an active session
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await API.getUserInfo();
        setLoggedIn(true);
        setUser(currentUser);
      } catch (err) {
        // No valid session found, user is anonymous
        setLoggedIn(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogin = async (credentials) => {
    const user = await API.logIn(credentials);
    setLoggedIn(true);
    setUser(user);
  };

  const handleLogout = async () => {
    await API.logOut();
    setLoggedIn(false);
    setUser(null);
  };

  // show loading spinner
  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <Spinner animation="border" role="status" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <NavHeader loggedIn={loggedIn} user={user} logout={handleLogout} />
      
      <Container>
        <Routes>
          {/* Default Route: Home */}
          <Route path="/" element={
            loggedIn ? (
              <GameArea user={user} />
            ) : (
              <div>
                <h2 className="mt-4">Last Race - Game Instructions</h2>
                <p>Welcome to Last Race! In this game, you will be assigned a starting station and a destination within the underground network.</p>
                <p>You have 90 seconds to plan your route. Random events will affect your score along the way.</p>
                <p><strong>Please log in to see the map and play!</strong></p>
              </div>
            )
          } />

          {/* Login Route */}
          <Route path="/login" element={
            loggedIn ? <Navigate replace to="/" /> : <LoginForm login={handleLogin} />
          } />

          {/* Ranking Route (Protected) */}
          <Route path="/ranking" element={
            loggedIn ? (
              <Ranking />
            ) : (
              <Navigate replace to="/login" />
            )
          } />

          {/* Fallback Route for undefined URLs */}
          <Route path="*" element={<h2 className="mt-5 text-center">404 - Page Not Found</h2>} />
        </Routes>
      </Container>
    </BrowserRouter>
  );
}

export default App;