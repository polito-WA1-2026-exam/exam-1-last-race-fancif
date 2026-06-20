import { Navbar, Container, Nav, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

function NavHeader({ loggedIn, user, logout }) {
  const navigate = useNavigate();

  return (
    <Navbar bg="dark" data-bs-theme="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/">🚇 Last Race</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            {loggedIn && <Nav.Link as={Link} to="/ranking">Ranking</Nav.Link>}
          </Nav>
          <Nav>
            {loggedIn ? (
              <>
                <Navbar.Text className="me-3">
                  Signed in as: <strong>{user?.username}</strong>
                </Navbar.Text>
                <Button variant="outline-light" onClick={logout}>Logout</Button>
              </>
            ) : (
              <Button variant="outline-light" onClick={() => navigate('/login')}>Login</Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavHeader;