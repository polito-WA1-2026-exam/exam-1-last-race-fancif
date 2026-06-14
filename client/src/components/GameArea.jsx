import { useState, useEffect } from 'react';
import { Button, Card, Row, Col, Spinner, Alert } from 'react-bootstrap';
import API from '../API.js';
import PlanningPhase from './PlanningPhase.jsx';
import ExecutionPhase from './ExecutionPhase.jsx';
import ResultPhase from './ResultPhase.jsx';

function GameArea({ user }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Network Data
  const [stations, setStations] = useState([]);
  const [lines, setLines] = useState([]);
  const [segments, setSegments] = useState([]);
  const [events, setEvents] = useState([]); // NEW: Added events state
  
  // Game State: 'SETUP', 'PLANNING', 'EXECUTION', 'RESULT'
  const [gamePhase, setGamePhase] = useState('SETUP');

  // Mission State
  const [currentMission, setCurrentMission] = useState(null); 
  const [submittedRoute, setSubmittedRoute] = useState([]);
  const [finalScore, setFinalScore] = useState(0);

  // Fetch initial data when the component mounts
  useEffect(() => {
    const fetchNetworkData = async () => {
      try {
        const fetchedStations = await API.getStations();
        const fetchedLines = await API.getLines();
        const fetchedSegments = await API.getSegments();
        const fetchedEvents = await API.getEvents(); // NEW: Fetch events
        
        setStations(fetchedStations);
        setLines(fetchedLines);
        setSegments(fetchedSegments);
        setEvents(fetchedEvents); // NEW: Save events to state
      } catch (err) {
        setError('Failed to load network data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchNetworkData();
  }, []);

  // Helper function to get a station's name by its ID
  const getStationName = (id) => {
    const station = stations.find(s => s.id === id);
    return station ? station.name : 'Unknown';
  };

  // Associa il colore di Bootstrap in base al nome della linea
  const getLineColor = (name) => {
    if (name.includes('Rossa')) return 'linea-rossa text-danger';
    if (name.includes('Blu')) return 'linea-blu text-primary';
    if (name.includes('Verde')) return 'linea-verde text-success';
    if (name.includes('Gialla')) return 'linea-gialla text-warning';
    return 'text-dark';
  };

  // Handler for when the user submits their route in the Planning Phase
  const handleRouteSubmit = (routeSegments, startStation, destStation) => {
    setSubmittedRoute(routeSegments);
    setCurrentMission({ start: startStation, dest: destStation });
    setGamePhase('EXECUTION');
  };

  const handleExecutionFinish = async (finalCoins) => {
    const scoreToSave = finalCoins < 0 ? 0 : finalCoins;
    setFinalScore(scoreToSave); // Salviamo il punteggio nello stato per mostrarlo
    
    try {
      await API.saveGame(scoreToSave);
      setGamePhase('RESULT');
    } catch (err) {
      setError('Failed to save the game result.');
    }
  };

  const handlePlayAgain = () => {
    // Resettiamo gli stati della partita precedente
    setSubmittedRoute([]);
    setCurrentMission(null);
    setFinalScore(0);
    setGamePhase('SETUP'); // Torniamo alla mappa!
  };

  if (loading) return <Spinner animation="border" className="mt-5" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div className="mt-4">
      {/* Phase 1: SETUP */}
      {gamePhase === 'SETUP' && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Network Map</h2>
            <Button variant="success" size="lg" onClick={() => setGamePhase('PLANNING')}>
              Start Game
            </Button>
          </div>
          
          <Row xs={1} md={2} className="g-4">
            {lines.map((line) => {
              // Filter segments that belong to this specific line
              const lineSegments = segments.filter(seg => seg.line_id === line.id);
              
              return (
                <Col key={line.id}>
                  <Card className={`metro-card ${getLineColor(line.name)}`}>
                    <Card.Header as="h5" className="bg-white border-0 fw-bold pb-0">
                      <i className="bi bi-train-front-fill me-2"></i>
                      {line.name}
                    </Card.Header>
                    <Card.Body>
                      <ul className="list-unstyled mb-0 text-muted">
                        {lineSegments.map(seg => (
                          <li key={seg.id} className="mb-1 border-bottom pb-1">
                            <i className="bi bi-geo-alt-fill me-2 small"></i>
                            {getStationName(seg.station_a_id)} &harr; {getStationName(seg.station_b_id)}
                          </li>
                        ))}
                      </ul>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </>
      )}

      {/* Phase 2: PLANNING */}
      {gamePhase === 'PLANNING' && (
        <PlanningPhase 
          stations={stations} 
          segments={segments} 
          onSubmitRoute={handleRouteSubmit} 
        />
      )}

      {/* Phase 3: EXECUTION */}
      {gamePhase === 'EXECUTION' && (
        <ExecutionPhase 
          stations={stations}
          route={submittedRoute}
          mission={currentMission}
          events={events}
          onFinish={handleExecutionFinish}
        />
      )}
      
      {/* Phase 4: RESULT */}
      {gamePhase === 'RESULT' && (
        <ResultPhase coins={finalScore} onPlayAgain={handlePlayAgain} />
      )}
    </div>
  );
}

export default GameArea;