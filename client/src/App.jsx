import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Container, Spinner, Row, Col, Card } from 'react-bootstrap';
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
              <Row className="justify-content-center mt-5">
                <Col md={10} lg={8}>
                  <Card className="shadow-sm border-0 rounded-4 text-center bg-light">
                    <Card.Body className="p-5">
                      <i className="bi bi-train-front-fill text-primary mb-3" style={{ fontSize: '4rem' }}></i>
                      <h1 className="fw-bold text-dark mb-4">Welcome to Last Race!</h1>
                      <p className="lead text-muted mb-5">
                        The ultimate underground routing challenge. Test your memory and planning skills against the clock!
                      </p>
                      
                      <Row className="text-start g-4 mb-5">
                        <Col md={4}>
                          <div className="d-flex align-items-start">
                            <i className="bi bi-geo-alt-fill text-danger fs-2 me-3 mt-1"></i>
                            <div>
                              <h5 className="fw-bold">Your Mission</h5>
                              <p className="text-muted small mb-0">You will be assigned a random starting station and a destination.</p>
                            </div>
                          </div>
                        </Col>
                        <Col md={4}>
                          <div className="d-flex align-items-start">
                            <i className="bi bi-stopwatch-fill text-warning fs-2 me-3 mt-1"></i>
                            <div>
                              <h5 className="fw-bold">90 Seconds</h5>
                              <p className="text-muted small mb-0">Plan your route carefully. Mentally reconstruct the lines!</p>
                            </div>
                          </div>
                        </Col>
                        <Col md={4}>
                          <div className="d-flex align-items-start">
                            <i className="bi bi-lightning-charge-fill text-info fs-2 me-3 mt-1"></i>
                            <div>
                              <h5 className="fw-bold">Random Events</h5>
                              <p className="text-muted small mb-0">Delays, strict inspectors, or lucky coins affect your score.</p>
                            </div>
                          </div>
                        </Col>
                      </Row>

                      <hr className="mb-4 opacity-25" />

                      <div className="d-grid gap-2 col-md-6 mx-auto">
                        <Link to="/login" className="btn btn-primary btn-lg rounded-pill fw-bold shadow-sm">
                          <i className="bi bi-box-arrow-in-right me-2"></i> Log In to Play
                        </Link>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            )
          } />

          {/*Login Route */}
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