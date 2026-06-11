import express from "express";
import morgan from "morgan";
import cors from "cors";
import session from "express-session";
import passport from 'passport';
import LocalStrategy from 'passport-local';
import * as userDao from './dao/user-dao.js';
import * as gameDao from './dao/game-dao.js';

const app = express();
const port = 3001;

app.use(morgan('dev'));
app.use(express.json());

const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
};
app.use(cors(corsOptions));

//passport config
passport.use(new LocalStrategy(
  async function(username, password, done) {
    try {
      const user = await userDao.getUser(username, password);
      if (!user) {
        return done(null, false, { message: 'Username o password errati.' });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

// save user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// get the user session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await userDao.getUserById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});


app.use(session({
  secret: 'segreto_esame_web_app', 
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } 
}));


app.use(passport.initialize());
app.use(passport.session());


//AUTH routes
//login
app.post('/api/sessions', function(req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json(info); // 401 Unauthorized se sbaglia credenziali
    }
    // req.login è fornito da Passport per creare la sessione
    req.login(user, (err) => {
      if (err) return next(err);
      return res.json(req.user); // Ritorna l'utente loggato (senza password!)
    });
  })(req, res, next);
});

//check login
app.get('/api/sessions/current', (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json(req.user);
  } else {
    res.status(401).json({ error: 'Utente non autenticato' });
  }
});

//logout
app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => {
    res.end(); // Risponde con 200 OK vuoto quando il logout ha successo
  });
});


// block session if not logged
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: 'Non autorizzato: devi fare il login' });
};


//games data API

// getstations
app.get('/api/stations', isLoggedIn, async (req, res) => {
  try {
    const stations = await gameDao.getStations();
    res.json(stations);
  } catch (err) {
    res.status(500).json({ error: 'Errore nel recupero delle stazioni' });
  }
});

// get lines
app.get('/api/lines', isLoggedIn, async (req, res) => {
  try {
    const lines = await gameDao.getLines();
    res.json(lines);
  } catch (err) {
    res.status(500).json({ error: 'Errore nel recupero delle linee' });
  }
});

// get segments
app.get('/api/segments', isLoggedIn, async (req, res) => {
  try {
    const segments = await gameDao.getSegments();
    res.json(segments);
  } catch (err) {
    res.status(500).json({ error: 'Errore nel recupero dei segmenti' });
  }
});

// get events
app.get('/api/events', isLoggedIn, async (req, res) => {
  try {
    const events = await gameDao.getEvents();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: 'Errore nel recupero degli eventi' });
  }
});

// save result
app.post('/api/games', isLoggedIn, async (req, res) => {
  try {
    const { score } = req.body;
    
    // Validazione base richiesta dalle specifiche
    if (score === undefined || typeof score !== 'number') {
      return res.status(400).json({ error: 'Punteggio mancante o non valido' });
    }

    const result = await gameDao.saveGame(req.user.id, score);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: 'Errore nel salvataggio della partita' });
  }
});

//get laderboard
app.get('/api/ranking', isLoggedIn, async (req, res) => {
  try {
    const ranking = await gameDao.getRanking();
    res.json(ranking);
  } catch (err) {
    res.status(500).json({ error: 'Errore nel recupero della classifica' });
  }
});


app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});