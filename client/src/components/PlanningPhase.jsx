import { useState, useEffect } from 'react';
import { Button, Card, Row, Col, Badge, ProgressBar } from 'react-bootstrap';

function PlanningPhase({ stations, segments, onSubmitRoute }) {
  const [startStation, setStartStation] = useState(null);
  const [destStation, setDestStation] = useState(null);
  const [timeLeft, setTimeLeft] = useState(90);
  const [selectedSegments, setSelectedSegments] = useState([]);

  // mission and timer setup
  useEffect(() => {
    const adjList = {};
    stations.forEach(s => { adjList[s.id] = []; });
    segments.forEach(seg => {
      adjList[seg.station_a_id].push(seg.station_b_id);
      adjList[seg.station_b_id].push(seg.station_a_id);
    });

    const findValidMission = () => {
      const shuffledStations = [...stations].sort(() => 0.5 - Math.random());
      for (let start of shuffledStations) {
        const distances = { [start.id]: 0 };
        const queue = [start.id];
        while (queue.length > 0) {
          const curr = queue.shift();
          for (let neighbor of adjList[curr]) {
            if (distances[neighbor] === undefined) {
              distances[neighbor] = distances[curr] + 1;
              queue.push(neighbor);
            }
          }
        }
        const validDestinations = stations.filter(s => distances[s.id] >= 3);
        if (validDestinations.length > 0) {
          const dest = validDestinations[Math.floor(Math.random() * validDestinations.length)];
          return { start, dest };
        }
      }
      return null;
    };

    const mission = findValidMission();
    if (mission) {
      setStartStation(mission.start);
      setDestStation(mission.dest);
    }

    const timerId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [stations, segments]);

  
  useEffect(() => {
    if (timeLeft === 0) {
      onSubmitRoute(selectedSegments, startStation, destStation);
    }
  }, [timeLeft]); 

  const toggleSegment = (segment) => {
    if (selectedSegments.find(s => s.id === segment.id)) {
      setSelectedSegments(selectedSegments.filter(s => s.id !== segment.id));
    } else {
      setSelectedSegments([...selectedSegments, segment]);
    }
  };

  const getStationName = (id) => {
    const station = stations.find(s => s.id === id);
    return station ? station.name : 'Unknown';
  };

  if (!startStation || !destStation) return <p>Loading mission...</p>;

  return (
    <div>
      <Card className="mb-4 border-primary">
        <Card.Body className="text-center">
          <h4>Your Mission</h4>
          <h2 className="text-primary">
            {startStation.name} <i className="bi bi-arrow-right"></i> {destStation.name}
          </h2>
          <div className="mt-3">
            <h5>Time Left: <Badge bg={timeLeft > 20 ? "success" : "danger"}>{timeLeft}s</Badge></h5>
            <ProgressBar animated variant={timeLeft > 20 ? "info" : "danger"} now={(timeLeft / 90) * 100} />
          </div>
        </Card.Body>
      </Card>

      <Row>
        <Col md={7}>
          <h5>Available Segments</h5>
          <p className="text-muted small">Click to add to your route. You have to mentally reconstruct the lines!</p>
          <div className="d-grid gap-2">
            {segments.map(seg => {
              const isSelected = selectedSegments.find(s => s.id === seg.id);
              return (
                <Button 
                  key={seg.id} 
                  variant={isSelected ? "primary" : "outline-secondary"}
                  onClick={() => toggleSegment(seg)}
                  className="text-start"
                >
                  {isSelected ? <i className="bi bi-check-circle-fill me-2"></i> : <i className="bi bi-circle me-2"></i>}
                  {getStationName(seg.station_a_id)} &harr; {getStationName(seg.station_b_id)}
                </Button>
              );
            })}
          </div>
        </Col>
        
        <Col md={5}>
          <h5>Your Route</h5>
          <Card className="bg-light mb-3">
            <Card.Body>
              {selectedSegments.length === 0 ? (
                <p className="text-muted">No segments selected yet.</p>
              ) : (
                <ol>
                  {selectedSegments.map((seg, idx) => (
                    <li key={idx}>
                      {getStationName(seg.station_a_id)} &harr; {getStationName(seg.station_b_id)}
                    </li>
                  ))}
                </ol>
              )}
            </Card.Body>
          </Card>
          <div className="d-grid">
            {}
            <Button variant="success" size="lg" onClick={() => onSubmitRoute(selectedSegments, startStation, destStation)}>
              Submit Route Now
            </Button>
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default PlanningPhase;