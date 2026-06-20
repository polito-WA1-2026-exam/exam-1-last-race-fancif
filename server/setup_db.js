import sqlite from 'sqlite3';
import crypto from 'crypto';

const db = new sqlite.Database('./database.sqlite');

// create pw helper
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 32).toString('hex');
  return { salt, hash };
}

const users = [
  { username: 'mario', password: 'password' },
  { username: 'luigi', password: 'password123' },
  { username: 'francesco', password: 'abc123password' }
];

db.serialize(() => {
  //create tables
  db.run(`DROP TABLE IF EXISTS games`);
  db.run(`DROP TABLE IF EXISTS events`);
  db.run(`DROP TABLE IF EXISTS segments`);
  db.run(`DROP TABLE IF EXISTS lines`);
  db.run(`DROP TABLE IF EXISTS stations`);
  db.run(`DROP TABLE IF EXISTS users`);

  db.run(`CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    salt TEXT NOT NULL,
    password TEXT NOT NULL
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

  //insert users
  const stmtUser = db.prepare('INSERT INTO users (username, salt, password) VALUES (?, ?, ?)');
  users.forEach(u => {
    const { salt, hash } = hashPassword(u.password);
    stmtUser.run(u.username, salt, hash);
  });
  stmtUser.finalize();

  //insert lines
  const lines = ['Red Line', 'Blue Line', 'Green Line', 'Yellow Line'];
  const stmtLine = db.prepare('INSERT INTO lines (name) VALUES (?)');
  lines.forEach(l => stmtLine.run(l));
  stmtLine.finalize();

  // insert stations
  const stations = [
    { name: 'Central', int: 1 },              // 1 Interchange
    { name: 'Velaria Gate', int: 1 },         // 2 Interchange
    { name: 'Dark Fountain', int: 1 },        // 3 Interchange
    { name: 'Falcon Crossroads', int: 0 },    // 4
    { name: 'Lantern Square', int: 0 },       // 5
    { name: 'Serene Borough', int: 0 },       // 6
    { name: 'Mosaic Avenue', int: 0 },        // 7
    { name: 'Ash Tower', int: 0 },            // 8
    { name: 'Echo Field', int: 0 },           // 9
    { name: 'North Station', int: 0 },        // 10
    { name: 'West Square', int: 0 },          // 11
    { name: 'East Gardens', int: 0 }          // 12
  ];
  const stmtStation = db.prepare('INSERT INTO stations (name, is_interchange) VALUES (?, ?)');
  stations.forEach(s => stmtStation.run(s.name, s.int));
  stmtStation.finalize();

  //insert segments
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

  //insert events
  const events = [
    { desc: 'Smooth journey', eff: 0 },
    { desc: 'Crowded carriage', eff: -1 },
    { desc: 'Kind passenger', eff: 1 },
    { desc: 'Train delay', eff: -2 },
    { desc: 'Found a coin', eff: 2 },
    { desc: 'Wrong platform', eff: -3 },
    { desc: 'Lucky ticket', eff: 3 },
    { desc: 'Strict inspector', eff: -4 }
  ];
  const stmtEvent = db.prepare('INSERT INTO events (description, effect) VALUES (?, ?)');
  events.forEach(e => stmtEvent.run(e.desc, e.eff));
  stmtEvent.finalize();

  // insert games
  const stmtGame = db.prepare('INSERT INTO games (user_id, score, date) VALUES (?, ?, ?)');
  stmtGame.run(1, 15, new Date().toISOString());
  stmtGame.run(1, 8, new Date().toISOString());
  stmtGame.run(2, 22, new Date().toISOString());
  stmtGame.finalize();

  console.log("Database populated successfully");
});

db.close();