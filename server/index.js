import express from "express";
import morgan from "morgan";
import cors from "cors";
import session from "express-session";
import passport from 'passport';
import LocalStrategy from 'passport-local';
import * as dao from './dao.js';

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
      const user = await dao.getUser(username, password);
      if (!user) {
        return done(null, false, { message: 'Username o password errati.' });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await dao.getUserById(id);
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
    res.end();
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

app.get('/api/stations', isLoggedIn, async (req, res) => {
  try {
    const stations = await dao.getStations();
    res.json(stations);
  } catch (err) {
    res.status(500).json({ error: 'Errore nel recupero delle stazioni' });
  }
});

app.get('/api/lines', isLoggedIn, async (req, res) => {
  try {
    const lines = await dao.getLines();
    res.json(lines);
  } catch (err) {
    res.status(500).json({ error: 'Errore nel recupero delle linee' });
  }
});

app.get('/api/segments', isLoggedIn, async (req, res) => {
  try {
    const segments = await dao.getSegments();
    res.json(segments);
  } catch (err) {
    res.status(500).json({ error: 'Errore nel recupero dei segmenti' });
  }
});

app.get('/api/events', isLoggedIn, async (req, res) => {
  try {
    const events = await dao.getEvents();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: 'Errore nel recupero degli eventi' });
  }
});

app.post('/api/games', isLoggedIn, async (req, res) => {
  try {
    const newGameId = await dao.saveGame(req.user.id, req.body.score);
    res.status(201).json({ id: newGameId });
  } catch (err) {
    res.status(500).json({ error: 'Errore nel salvataggio della partita' });
  }
});

app.get('/api/ranking', isLoggedIn, async (req, res) => {
  try {
    const ranking = await dao.getRanking();
    res.json(ranking);
  } catch (err) {
    res.status(500).json({ error: 'Errore nel recupero della classifica' });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});