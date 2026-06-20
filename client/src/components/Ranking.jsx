import { useState, useEffect } from 'react';
import { Container, Table, Spinner, Alert } from 'react-bootstrap';
import API from '../API.js';

function Ranking() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const data = await API.getRanking();
        setRanking(data);
      } catch (err) {
        setError('Failed to load global ranking. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchRanking();
  }, []);

  if (loading) return <Spinner animation="border" className="mt-5" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Global Ranking <i className="bi bi-trophy-fill text-warning"></i></h2>
      
      {ranking.length === 0 ? (
        <p className="lead">No games played yet. Be the first to set a record!</p>
      ) : (
        <Table striped bordered hover variant="dark" className="text-center">
          <thead>
            <tr>
              <th>Position</th>
              <th>Player</th>
              <th>Best Score</th>
            </tr>
          </thead>
          <tbody>
            {ranking.map((row, index) => (
              <tr key={index}>
                <td>
                  {index === 0 ? '🥇 1st' : index === 1 ? '🥈 2nd' : index === 2 ? '🥉 3rd' : `${index + 1}th`}
                </td>
                <td className="text-capitalize">{row.username}</td>
                <td><strong>{row.best_score} 🪙</strong></td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}

export default Ranking;