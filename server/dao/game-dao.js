import db from '../db.js';


export const getStations = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM stations';
    db.all(sql, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};


export const getLines = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM lines';
    db.all(sql, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};


export const getSegments = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM segments';
    db.all(sql, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};


export const getEvents = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM events';
    db.all(sql, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};


export const saveGame = (userId, score) => {
  return new Promise((resolve, reject) => {
    
    const finalScore = score < 0 ? 0 : score;
    const date = new Date().toISOString();
    
    const sql = 'INSERT INTO games (user_id, score, date) VALUES (?, ?, ?)';
    db.run(sql, [userId, finalScore, date], function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, score: finalScore });
    });
  });
};

export const getRanking = () => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT u.username, MAX(g.score) as best_score 
      FROM games g 
      JOIN users u ON g.user_id = u.id 
      GROUP BY u.id 
      ORDER BY best_score DESC
    `;
    db.all(sql, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};