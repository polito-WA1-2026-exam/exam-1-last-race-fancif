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
      {/* MISSION CARD */}
      <Card className="mb-4 shadow-sm border-primary">
        <Card.Body className="text-center py-3">
          <h5 className="text-uppercase text-muted small fw-bold mb-1">Your Mission</h5>
          <h3 className="text-primary fw-bold mb-2">
            {startStation.name} <i className="bi bi-arrow-right-circle-fill mx-2 text-secondary"></i> {destStation.name}
          </h3>
          <div className="d-flex justify-content-center align-items-center gap-3">
            <h6 className="mb-0">Time Left: <Badge bg={timeLeft > 20 ? "success" : "danger"} className="px-3 py-2 ms-1">{timeLeft}s</Badge></h6>
            <ProgressBar animated variant={timeLeft > 20 ? "info" : "danger"} now={(timeLeft / 90) * 100} style={{ height: '8px', width: '200px' }} />
          </div>
        </Card.Body>
      </Card>

      {/* MAP & ROUTE*/}
      <Row className="g-4 mb-4">
        
        {/* Colonna Mappa */}
        <Col lg={8}>
          <Card className="h-100 shadow-sm border-0 bg-light">
            <Card.Body className="text-center p-3 d-flex flex-column justify-content-center">
              <img 
                src="/hide_map.png" 
                alt="Mappa con sole fermate" 
                className="img-fluid rounded shadow-sm border border-3 border-white mx-auto" 
                style={{ maxHeight: '320px', objectFit: 'contain' }}
              />
            </Card.Body>
          </Card>
        </Col>

        {/* current path*/}
        <Col lg={4}>
          <Card className="h-100 shadow-sm border-0 d-flex flex-column">
            <Card.Body className="d-flex flex-column">
              <h5 className="mb-3"><i className="bi bi-signpost-split me-2 text-primary"></i>Your Route</h5>
              
              <div className="bg-light p-3 rounded flex-grow-1 mb-3 border overflow-auto" style={{ maxHeight: '200px' }}>
                {selectedSegments.length === 0 ? (
                  <div className="text-center text-muted h-100 d-flex flex-column justify-content-center align-items-center">
                    <i className="bi bi-geo-alt fs-2 mb-2 opacity-50"></i>
                    <p className="mb-0 small">Select segments from the board below.</p>
                  </div>
                ) : (
                  <ol className="ps-3 mb-0 small">
                    {selectedSegments.map((seg, idx) => (
                      <li key={idx} className="mb-2 pb-1 border-bottom border-secondary-subtle">
                        <strong>{getStationName(seg.station_a_id)}</strong> &harr; <strong>{getStationName(seg.station_b_id)}</strong>
                      </li>
                    ))}
                  </ol>
                )}
              </div>

              <div className="d-grid mt-auto">
                <Button 
                  variant="success" 
                  size="lg" 
                  className="rounded-pill fw-bold shadow-sm"
                  onClick={() => onSubmitRoute(selectedSegments, startStation, destStation)}
                  disabled={selectedSegments.length === 0}
                >
                  <i className="bi bi-train-front-fill me-2"></i> Submit Route
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

      </Row>

      {/* CONTROL BOARD (segments) */}
      <Card className="shadow-sm border-0 mb-4 bg-white">
        <Card.Body>
          <h5 className="mb-3"><i className="bi bi-grid-3x3-gap-fill me-2 text-secondary"></i>Available Segments</h5>
          
          <Row className="g-2">
            {segments.map(seg => {
              const isSelected = selectedSegments.find(s => s.id === seg.id);
              return (
                <Col xs={12} sm={6} md={4} lg={3} key={seg.id}>
                  <Button 
                    variant={isSelected ? "primary" : "outline-secondary"}
                    onClick={() => toggleSegment(seg)}
                    className="w-100 text-start rounded-3 px-3 py-2 border-2 shadow-sm d-flex align-items-center"
                    style={{ transition: 'all 0.2s', fontSize: '0.9rem' }}
                  >
                    {isSelected ? <i className="bi bi-check-circle-fill me-2 fs-5"></i> : <i className="bi bi-circle me-2 text-muted"></i>}
                    <span className={isSelected ? "fw-bold" : ""}>
                      {getStationName(seg.station_a_id)} &harr; {getStationName(seg.station_b_id)}
                    </span>
                  </Button>
                </Col>
              );
            })}
          </Row>
        </Card.Body>
      </Card>

    </div>
  );
}

export default PlanningPhase;