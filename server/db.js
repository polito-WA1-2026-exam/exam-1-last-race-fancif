import sqlite3 from 'sqlite3';

//open db connection
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
    throw err;
  }
  console.log('Connected to database');
});

export default db;