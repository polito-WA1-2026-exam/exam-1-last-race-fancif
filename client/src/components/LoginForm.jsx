import { useState } from 'react';
import { Form, Button, Alert, Container, Row, Col, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function LoginForm({ login }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    
    try {
      await login({ username, password });
      navigate('/'); 
    } catch (err) {
      setErrorMessage(err.message || 'Wrong username or password.');
    }
  };

  return (
    <Container>
      <Row className="justify-content-md-center mt-5">
        <Col md={5}>
          <Card className="shadow-lg border-0 rounded-4 mt-5">
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <i className="bi bi-train-lightrail text-primary" style={{ fontSize: '3rem' }}></i>
                <h2 className="fw-bold mt-2">Enter the Station</h2>
              </div>
              
              {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-muted small fw-bold">USERNAME</Form.Label>
                  <Form.Control 
                    type="text" 
                    value={username} 
                    onChange={e => setUsername(e.target.value)} 
                    required 
                    className="p-3" 
                    
                  />
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label className="text-muted small fw-bold">PASSWORD</Form.Label>
                  <Form.Control 
                    type="password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    required 
                    className="p-3" 
                    
                  />
                </Form.Group>
                <div className="d-grid">
                  <Button variant="primary" type="submit" size="lg" className="rounded-pill fw-bold">
                    Start Playing
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default LoginForm;