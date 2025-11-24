// hanterar all lagring i localstorage: senaste resultat och leaderboard

const KEY = "nobel-timeline-last-score";
const LEADERBOARD_KEY = "nobel-timeline-leaderboard";

// spara senaste resultatet så det går att läsa upp senare om man vill
export const saveLastScore = (o) =>
  localStorage.setItem(KEY, JSON.stringify(o));

// hämta senaste sparade resultatet (eller null om inget finns)
export const getLastScore = () =>
  JSON.parse(localStorage.getItem(KEY) || "null");

// hämta leaderboarden, returnera en tom lista om ingen finns sparad
export const getLeaderboard = () => {
  const data = localStorage.getItem(LEADERBOARD_KEY);
  return data ? JSON.parse(data) : [];
};

// lägg till en ny post i leaderboarden
// sorterar sedan på score och sparar endast de 10 bästa
export const addToLeaderboard = (entry) => {
  const leaderboard = getLeaderboard();

  // lägg till det nya resultatet
  leaderboard.push(entry);

  // sortera med högsta poäng först 
  leaderboard.sort((a, b) => b.score - a.score);

  // Behåll endast de 10 bästa resultaten 
  const top10 = leaderboard.slice(0, 10);

  // spara tillbaka till lcoalstorage
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(top10));
  return top10;
};
