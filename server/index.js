// imports
import express from "express";
import morgan from "morgan";
import cors from "cors";
import session from "express-session";
// import db from "./db.js"; // Lo de-commenteremo quando faremo le API

// init express
const app = express(); // Nota: di solito si usa express() senza "new"
const port = 3001;

// --- MIDDLEWARE ---
app.use(morgan('dev')); // Logga le richieste nel terminale
app.use(express.json()); // Permette di leggere i body in JSON

// Configurazione CORS (Fondamentale per il pattern "due server")
const corsOptions = {
  origin: 'http://localhost:5173', // La porta di default di Vite/React
  credentials: true, // Permette l'invio dei cookie di sessione
};
app.use(cors(corsOptions));

// Configurazione Sessione (Richiesta dalle specifiche per Passport.js)
app.use(session({
  secret: 'segreto_esame_web_app', 
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Deve essere false in locale (non usiamo HTTPS)
}));

// --- ROUTES ---
// Route di test
app.get('/api/test', (req, res) => {
  res.json({ message: 'Il server Express funziona correttamente!' });
});

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});