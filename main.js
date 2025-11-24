// kopplar ihop data, spel-logik, drag and drop och användargränssnittet
import { renderStart } from "./ui.js";
import { loadNobelData } from "./data.js";
import { countBy, setDifficulty } from "./game2.js";
import { shuffle } from "./data.js";
import { renderBoard } from "./ui.js";
import { wireDnD } from "./dnd.js";
import { setPools, submitAndScore, showScore } from "./game2.js";
import { readUserOrder } from "./dnd.js";
import { saveLastScore } from "./storage.js";
import { gameState } from "./game2.js";
import { startTimer } from "./game2.js";
import { stopTimer } from "./game2.js";
import { renderLeaderboard } from "./ui.js";
import { addToLeaderboard } from "./storage.js";

// huvudelementet där spelet ritas upp 
const app = document.getElementById("app");
// visa startskärmen
renderStart(app);
// visa leaderboard direkt när sidan laddas
renderLeaderboard();

// ladda nobeldata i bakgrunden 
loadNobelData().then((list) => console.log("Antal pristagare:", list.length));

// lyssna på custom event som triggas när spelaren väljer svårighetsgrad
document.addEventListener("difficulty:selected", async (e) => {
    // hämta alla möjliga nobelpristagare 
  const all = await loadNobelData();

  const level = e.detail.level;
  setDifficulty(level);

  // hur många kort ska användas för vald svårighetsgrad
  const count = countBy(level);

  // välj ut ett antal slumpade pristagare
  const pool = shuffle(all).slice(0, count);

  // rita ut spelbrädet med dessa pristagare
  renderBoard(app, pool);

  // aktivera drag and drop på listan 
  wireDnD(app);

  // spara poolen och den korrekta ordningen i gameState
  setPools(pool);

  // starta timern för denna svårighetsgrad
  startTimer(level);

  // koppla knappen "kolla ordning" så att den rättar spelet 
  app.querySelector("#submit").addEventListener("click", () => {
    // läs av den ordning som spelaren har sorterat fram
    const order = readUserOrder(app);

    // beräkna poäng och hur många som är rätt 
    const { score, correctCount } = submitAndScore(order);
    saveLastScore({ score, correctCount, total: pool.length, ts: Date.now() });

    // hämta in namn från fältet ovanför spelet 
    const playerName =
      document.getElementById("nameInput").value.trim() || "Anonym";

      // bygg upp ett resultatobjekt som sparas på leaderboarden
    const entry = {
      name: playerName,
      score: Math.round(score),
      correctCount,
      total: pool.length,
      timeLeft: gameState.timeLeft,
      ts: Date.now(),
    };
    // stoppa timern nu när rundan är klar 
    stopTimer();

    // uppdatera leaderboarden och spara senaste resultatet
    if(score > 0){
    addToLeaderboard(entry);
    saveLastScore(entry);
    }
    renderLeaderboard();

    // skapa en snabb uppslagskarta från id till pristagare
    const laureateMap = {};
    pool.forEach((l) => (laureateMap[l.id] = l));

    // Bygg upp HTML för resultatskärmen 
    let resultHTML = `
        <section class="max-w-3xl mx-auto">
        <div class="text-center mb-2 -mt-6">
        <h2 class="text-2xl text-white font-bold mb-2">Resultat</h2>
        <p class="text-white mb-4">Rätt: ${correctCount}/${pool.length} • Poäng: <span class="score-display">${score}</span> • ${
              gameState.timeLeft <= 0 ? "Tiden tog slut" : `Tid kvar: ${gameState.timeLeft}`}</p>
        <button id="again" class="text-[#002952] hover:bg-[#A38A5F] py-4 text-base w-2/4 md:w-auto restart-btn">Spela igen</button>
        <p id="time-multiplier" class="text-2xl font-bold text-center text-white py-2">Extrapoäng baserat på tid: ${gameState.timeBonus}</p>
        </div>
        <div class="space-y-3">
        `;

        // lägg till ett kort i resultatlistan för varje placerad pristagare
    order.forEach((placedId, index) => {
      const laureate = laureateMap[placedId];
      const correctId = gameState.orderCorrect[index];
      const isCorrect = placedId === correctId;

      resultHTML += `
            <div class="card p-2 bg-[#142845]/95 rounded-lg ${
              isCorrect ? "ring-correct" : "ring-wrong"
            }">
                <div class="flex items-center justify-between gap-4">
                    <div class="flex-1">
                        <h4 class="text-white font-bold">${laureate.name}</h4>
                        <p class="text-sm text-white/60">${
                          laureate.category
                        }</p>
                    </div>
                    <div class="text-right">
                        <p class="text-sm text-white/60">${isCorrect ? `+${showScore()} Poäng` : "-25 Poäng"}</p>
                        <p class="text-2xl font-bold ${
                          isCorrect ? "text-green-600" : "text-red-600"
                        }">${laureate.year}</p>
                    </div>
                </div>
            </div>`;
    });

    resultHTML += `
        </div>
        </section>`;

        // visa resultatskärmen istället för spelet 
    app.innerHTML = resultHTML;
    // restart-knappen laddar om sidan och börjar om från startskärmen
    app
      .querySelector("#again")
      .addEventListener("click", () => location.reload());
  });
});
