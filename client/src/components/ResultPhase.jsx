import { Card, Button } from 'react-bootstrap';

function ResultPhase({ coins, onPlayAgain }) {
  return (
    <Card className="mt-4 text-center border-success">
      <Card.Body>
        <h2>Game Over</h2>
        {coins > 0 ? (
          <>
            <h3 className="text-success mt-3">Congratulations!</h3>
            <p className="lead">You successfully reached your destination.</p>
            <h1 className="display-4 text-warning">🪙 {coins}</h1>
            <p className="text-muted">Your score has been safely stored.</p>
          </>
        ) : (
          <>
            <h3 className="text-danger mt-3">Mission Failed</h3>
            <p className="lead">Your route was invalid, or you ran out of luck and coins!</p>
            <h1 className="display-4 text-muted">🪙 0</h1>
            <p className="text-muted">Your score of 0 has been recorded.</p>
          </>
        )}
        <div className="mt-4">
          <Button variant="primary" size="lg" onClick={onPlayAgain}>
            Play Again
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}

export default ResultPhase;