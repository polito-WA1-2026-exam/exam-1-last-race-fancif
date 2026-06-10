import sqlite3 from 'sqlite3';

//open db connection
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Errore di connessione al database:', err.message);
    throw err;
  }
  console.log('Connesso al database SQLite.');
});

export default db;