import sqlite from 'sqlite3';
import crypto from 'crypto';

const db = new sqlite.Database('./database.sqlite');

// Funzione helper per creare le password
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 32).toString('hex');
  return { salt, hash };
}

const users = [
  { username: 'mario', password: 'password' },
  { username: 'luigi', password: 'password' },
  { username: 'peach', password: 'password' }
];

db.serialize(() => {
  // 1. Creazione Tabelle
  db.run(`DROP TABLE IF EXISTS games`);
  db.run(`DROP TABLE IF EXISTS events`);
  db.run(`DROP TABLE IF EXISTS segments`);
  db.run(`DROP TABLE IF EXISTS lines`);
  db.run(`DROP TABLE IF EXISTS stations`);
  db.run(`DROP TABLE IF EXISTS users`);

  db.run(`CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    salt TEXT,
    hash TEXT
  )`);

  db.run(`CREATE TABLE stations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    is_interchange BOOLEAN
  )`);

  db.run(`CREATE TABLE lines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE
  )`);

  db.run(`CREATE TABLE segments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    station_a_id INTEGER,
    station_b_id INTEGER,
    line_id INTEGER,
    FOREIGN KEY(station_a_id) REFERENCES stations(id),
    FOREIGN KEY(station_b_id) REFERENCES stations(id),
    FOREIGN KEY(line_id) REFERENCES lines(id)
  )`);

  db.run(`CREATE TABLE events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    description TEXT,
    effect INTEGER
  )`);

  db.run(`CREATE TABLE games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    score INTEGER,
    date TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

  // 2. Inserimento Utenti
  const stmtUser = db.prepare('INSERT INTO users (username, salt, hash) VALUES (?, ?, ?)');
  users.forEach(u => {
    const { salt, hash } = hashPassword(u.password);
    stmtUser.run(u.username, salt, hash);
  });
  stmtUser.finalize();

  // 3. Inserimento Linee
  const lines = ['Linea Rossa', 'Linea Blu', 'Linea Verde', 'Linea Gialla'];
  const stmtLine = db.prepare('INSERT INTO lines (name) VALUES (?)');
  lines.forEach(l => stmtLine.run(l));
  stmtLine.finalize();

  // 4. Inserimento Stazioni (12 totali, 3 interscambi)
  const stations = [
    { name: 'Centrale', int: 1 },         // 1 - Interscambio
    { name: 'Porta Velaria', int: 1 },    // 2 - Interscambio
    { name: 'Fontana Oscura', int: 1 },   // 3 - Interscambio
    { name: 'Crocevia del Falco', int: 0 },// 4
    { name: 'Piazza Lanterne', int: 0 },  // 5
    { name: 'Borgo Sereno', int: 0 },     // 6
    { name: 'Viale Mosaici', int: 0 },    // 7
    { name: 'Torre Cinerea', int: 0 },    // 8
    { name: 'Campo Eco', int: 0 },        // 9
    { name: 'Stazione Nord', int: 0 },    // 10
    { name: 'Piazza Ovest', int: 0 },     // 11
    { name: 'Giardini Est', int: 0 }      // 12
  ];
  const stmtStation = db.prepare('INSERT INTO stations (name, is_interchange) VALUES (?, ?)');
  stations.forEach(s => stmtStation.run(s.name, s.int));
  stmtStation.finalize();

  // 5. Inserimento Segmenti
  const segments = [
    // Rossa (1-2, 2-4, 4-5)
    [1, 2, 1], [2, 4, 1], [4, 5, 1],
    // Blu (1-3, 3-6, 6-7)
    [1, 3, 2], [3, 6, 2], [6, 7, 2],
    // Verde (2-3, 3-8, 8-9)
    [2, 3, 3], [3, 8, 3], [8, 9, 3],
    // Gialla (1-10, 10-11, 11-12)
    [1, 10, 4], [10, 11, 4], [11, 12, 4]
  ];
  const stmtSegment = db.prepare('INSERT INTO segments (station_a_id, station_b_id, line_id) VALUES (?, ?, ?)');
  segments.forEach(seg => stmtSegment.run(seg[0], seg[1], seg[2]));
  stmtSegment.finalize();

  // 6. Inserimento 8 Eventi (effetti da -4 a +4)
  const events = [
    { desc: 'Viaggio tranquillo', eff: 0 },
    { desc: 'Carrozza affollata', eff: -1 },
    { desc: 'Passeggero gentile', eff: 1 },
    { desc: 'Ritardo del treno', eff: -2 },
    { desc: 'Trovata una moneta', eff: 2 },
    { desc: 'Binario sbagliato', eff: -3 },
    { desc: 'Biglietto fortunato', eff: 3 },
    { desc: 'Controllore severo', eff: -4 }
  ];
  const stmtEvent = db.prepare('INSERT INTO events (description, effect) VALUES (?, ?)');
  events.forEach(e => stmtEvent.run(e.desc, e.eff));
  stmtEvent.finalize();

  // 7. Inserimento Partite (2 utenti hanno giocato)
  const stmtGame = db.prepare('INSERT INTO games (user_id, score, date) VALUES (?, ?, ?)');
  stmtGame.run(1, 15, new Date().toISOString());
  stmtGame.run(1, 8, new Date().toISOString());
  stmtGame.run(2, 22, new Date().toISOString());
  stmtGame.finalize();

  console.log("Database popolato con successo!");
});

db.close();