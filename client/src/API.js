const SERVER_URL = 'http://localhost:3001/api';


const getJson = (httpResponsePromise) => {
  return new Promise((resolve, reject) => {
    httpResponsePromise
      .then((response) => {
        if (response.ok) {

          response.json()
            .then((json) => resolve(json))
            .catch(() => resolve({})); 
        } else {

          response.json()
            .then((obj) => reject(obj))
            .catch(() => reject({ error: 'Errore generico del server' }));
        }
      })
      .catch((err) => reject({ error: 'Impossibile comunicare con il server' }));
  });
};


const logIn = async (credentials) => {
  const response = await fetch(`${SERVER_URL}/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    // include credentials to save cookies
    credentials: 'include', 
    body: JSON.stringify(credentials),
  });
  return getJson(Promise.resolve(response));
};


const getUserInfo = async () => {
  const response = await fetch(`${SERVER_URL}/sessions/current`, {
    credentials: 'include',
  });
  return getJson(Promise.resolve(response));
};


const logOut = async () => {
  const response = await fetch(`${SERVER_URL}/sessions/current`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return getJson(Promise.resolve(response));
};



const getStations = async () => {
  const response = await fetch(`${SERVER_URL}/stations`, { credentials: 'include' });
  return getJson(Promise.resolve(response));
};

const getLines = async () => {
  const response = await fetch(`${SERVER_URL}/lines`, { credentials: 'include' });
  return getJson(Promise.resolve(response));
};

const getSegments = async () => {
  const response = await fetch(`${SERVER_URL}/segments`, { credentials: 'include' });
  return getJson(Promise.resolve(response));
};

const getEvents = async () => {
  const response = await fetch(`${SERVER_URL}/events`, { credentials: 'include' });
  return getJson(Promise.resolve(response));
};

const saveGame = async (score) => {
  const response = await fetch(`${SERVER_URL}/games`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ score }),
  });
  return getJson(Promise.resolve(response));
};

const getRanking = async () => {
  const response = await fetch(`${SERVER_URL}/ranking`, { credentials: 'include' });
  return getJson(Promise.resolve(response));
};



const API = { logIn, getUserInfo, logOut, getStations, getLines, getSegments, getEvents, saveGame, getRanking };
export default API;