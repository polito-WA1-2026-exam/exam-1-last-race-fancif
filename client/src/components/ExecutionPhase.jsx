import { useState, useEffect } from 'react';
import { Card, Button, Badge, Alert, ListGroup } from 'react-bootstrap';

function ExecutionPhase({ stations, route, mission, events, onFinish }) {
  const [isValid, setIsValid] = useState(null);
  const [coins, setCoins] = useState(20);
  const [stepLogs, setStepLogs] = useState([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionDone, setExecutionDone] = useState(false);

  // run validation 
  useEffect(() => {
    const validateRoute = () => {
      if (!route || route.length === 0) return false;

      let currentStationId = mission.start.id;
      let currentLineId = null;
      const usedSegments = new Set();

      for (let i = 0; i < route.length; i++) {
        const seg = route[i];

        // rule: rach segment may be selected only once
        if (usedSegments.has(seg.id)) return false;
        usedSegments.add(seg.id);

        // Rule: continuity 
        let nextStationId;
        if (seg.station_a_id === currentStationId) {
          nextStationId = seg.station_b_id;
        } else if (seg.station_b_id === currentStationId) {
          nextStationId = seg.station_a_id;
        } else {
          return false; // broken link: route is not continuous
        }

        // rule:line changes only at interchange stations
        if (currentLineId !== null && currentLineId !== seg.line_id) {
          const currentStationObj = stations.find(s => s.id === currentStationId);
          if (!currentStationObj || (currentStationObj.is_interchange !== 1 && currentStationObj.is_interchange !== true)) {
            return false; // illegal transfer
          }
        }

        // Move forward
        currentStationId = nextStationId;
        currentLineId = seg.line_id;
      }

      // Rule: Must end at the assigned destination
      if (currentStationId !== mission.dest.id) return false;

      return true;
    };

    const valid = validateRoute();
    setIsValid(valid);

    if (!valid) {
      // invalid route
      setCoins(0);
      setExecutionDone(true);
    } else {

      setIsExecuting(true);
    }
  }, [route, mission, stations]);


  useEffect(() => {
    if (isExecuting) {
      let currentStep = 0;
      let currentCoins = 20;

      const intervalId = setInterval(() => {
        if (currentStep >= route.length) {
          clearInterval(intervalId);
          setIsExecuting(false);
          setExecutionDone(true);
          return;
        }

        // Process one segment
        const segment = route[currentStep];
        // Pick a random event
        const randomEvent = events[Math.floor(Math.random() * events.length)];
        
        currentCoins += randomEvent.effect;

        // Log the step to display it
        const newLog = {
          id: currentStep,
          segment,
          event: randomEvent,
          coinsAfter: currentCoins
        };

        setStepLogs(prev => [...prev, newLog]);
        setCoins(currentCoins);

        currentStep++;
      }, 1500);

      return () => clearInterval(intervalId);
    }
  }, [isExecuting, route, events]);

  const getStationName = (id) => {
    const station = stations.find(s => s.id === id);
    return station ? station.name : 'Unknown';
  };

  if (isValid === null) return <p>Validating route...</p>;

  return (
    <Card className="mt-4 border-info">
      <Card.Header as="h4" className="bg-info text-white">Execution Phase</Card.Header>
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5>Coins: <Badge bg={coins > 0 ? "warning" : "danger"} text="dark">{coins} 🪙</Badge></h5>
        </div>

        {!isValid ? (
          <Alert variant="danger">
            <Alert.Heading>Invalid Route!</Alert.Heading>
            <p>Your route was either incomplete, disconnected, or involved an illegal line transfer. You lost all your coins!</p>
          </Alert>
        ) : (
          <ListGroup className="mb-4">
            {stepLogs.map(log => (
              <ListGroup.Item key={log.id} variant={log.event.effect >= 0 ? "success" : "danger"}>
                <strong>{getStationName(log.segment.station_a_id)} &harr; {getStationName(log.segment.station_b_id)}</strong>
                <br />
                Event: {log.event.description} <em>({log.event.effect > 0 ? '+' : ''}{log.event.effect} coins)</em>
              </ListGroup.Item>
            ))}
            {isExecuting && (
              <ListGroup.Item className="text-center text-muted">
                <em>Traveling to next station...</em>
              </ListGroup.Item>
            )}
          </ListGroup>
        )}

        {executionDone && (
          <div className="d-grid">
            <Button variant="primary" size="lg" onClick={() => onFinish(coins)}>
              See Final Result
            </Button>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}

export default ExecutionPhase;