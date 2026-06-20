import sqlite from 'sqlite3';
import crypto from 'crypto';

// db connection
const db = new sqlite.Database('database.sqlite', (err) => {
  if (err) throw err;
});

// --- authentication functions ---

export const getUser = (username, password) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM users WHERE username = ?';
    db.get(sql, [username], (err, row) => {
      if (err) { 
        reject(err); 
      }
      else if (row === undefined) { 
        resolve(false); 
      }
      else {
        const user = { id: row.id, username: row.username };
        
      
        crypto.scrypt(password, row.salt, 32, function(err, hashedPassword) {
          if (err) reject(err);
          if(!crypto.timingSafeEqual(Buffer.from(row.password, 'hex'), hashedPassword)) {
            resolve(false);
          } else {
            resolve(user);
          }
        });
      }
    });
  });
};

export const getUserById = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM users WHERE id = ?';
    db.get(sql, [id], (err, row) => {
      if (err) { reject(err); }
      else if (row === undefined) { resolve({ error: 'User not found.' }); }
      else {
        const user = { id: row.id, username: row.username };
        resolve(user);
      }
    });
  });
};

// --- game funcitons ---

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
    const sql = 'INSERT INTO games (user_id, score, date) VALUES (?, ?, ?)';
    const date = new Date().toISOString();
    db.run(sql, [userId, score, date], function (err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
  });
};

export const getRanking = () => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT users.username, MAX(games.score) as best_score 
      FROM games 
      JOIN users ON games.user_id = users.id 
      GROUP BY users.id 
      ORDER BY best_score DESC
    `;
    db.all(sql, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};