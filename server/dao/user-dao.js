import db from '../db.js';
import crypto from 'crypto';

// Verifica che username e password siano corretti
export const getUser = (username, password) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM users WHERE username = ?';
    db.get(sql, [username], (err, row) => {
      if (err) {
        reject(err);
      } else if (row === undefined) {
        resolve(false); // user not found
      } else {
        // verify pw
        const user = { id: row.id, username: row.username };
        const salt = row.salt;
        
        crypto.scrypt(password, salt, 32, (err, hashedPassword) => {
          if (err) reject(err);
          const passwordHex = Buffer.from(row.hash, 'hex');
          if (!crypto.timingSafeEqual(passwordHex, hashedPassword)) {
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
      if (err) {
        reject(err);
      } else if (row === undefined) {
        resolve({ error: 'Utente non trovato.' });
      } else {
        const user = { id: row.id, username: row.username };
        resolve(user);
      }
    });
  });
};