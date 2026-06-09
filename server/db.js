import sqlite3 from  'sqlite3';

// Apre la connessione al database SQLite
const db = new sqlite.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Errore di connessione al database:', err.message);
    throw err;
  }
  console.log('Connesso al database SQLite.');
});

module.exports = db;