// hanterar spelstat, poängräkning och timer-logik för Nobel timeline spelet
export const gameState = {
  // vilken svårighetsgrad spelaren har valt: "easy, "medium" eller "hard"
  difficulty: null,

  // id för setInterval som används för timern
  timerInterval: null,

  // antal sekunder kvar på timern
  timeLeft: 0,
  // extrapoäng som spelaren får baserat på hur mycket tid som är kvar
  timeBonus: 0,
};

// spara vilken svårighetsgrad spelaren har valt
export function setDifficulty(level) {
  gameState.difficulty = level;
}

// bestäm antal kort soms ka användas beroende på svårighetsgrad
export function countBy(level) {
return 8;
}
// spara vilka nobelpristagare som används i denna omgång, och räkna ut den korrekta ordningen baserad på årtal
export function setPools(laureates) {
  gameState.pool = laureates;

  // skapa en lista med id:n i korrekt kronologisk ordning
  // vi sorterar på year och plockar sedan ut id för varje pristagare
  gameState.orderCorrect = [...laureates]
  // används för att sortera listan
    .sort((a, b) => a.year - b.year)
  // används för att omvandla en lista till en ny lista,
  // för varje objekt x i listan
  // ta ut ENDAST id
  // bygg en helt ny lista med id-värden
    .map((x) => x.id);
}

// räkna ut spelarens poäng baserat på rätt placeringar, fel placeringar och tid
export function submitAndScore(userIds) {
  // poäng per rätt svar beroende på svårighetsgrad
  const per = 100;

  // räkna antal rätt placerade kort 
  // räkna antal fel placerade kort
  // (jämför användarens ordning med den korrekta ordningen)
  // .filter() går igenom varje element i listan userIds, 
  // "är användarens id på plats i samma som det korrekta id:t på plats i"
  let correct = userIds.filter(
    (id, i) => id === gameState.orderCorrect[i]
  ).length;
  let incorrect = userIds.length - correct;

  const basePoints = correct * per;

  // tidsbonus beräknas som en procentandel baserat på timeLeft
  // Math.round, för att få ett heltal
  // exempel: om timeLeft är 50, blir det 50 % av baspoängen
  const timeBonus = Math.round(basePoints * (gameState.timeLeft / 100));

  // total poäng = baspoäng + tidsbonus - avdrag för fel
  let score = basePoints + timeBonus - incorrect * 25;

  // poängen får inte bli negativ
  if (score < 0) score = 0;

  // uppdatera global spelstat
  gameState.score = score;
  gameState.finished = true;
  gameState.timeBonus = timeBonus;

  return { correctCount: correct, score, timeBonus };
}

// returnerar hur många poäng varje rätt svar är värt för aktuell svårighetsgrad
// används när vi visar "+100 Poäng" (eller motsvarande) på resultatkortet
export function showScore() {
  const per = 100;
  return per;
}

// starta timern baserat på svårigjetsgrad
export function startTimer(difficulty) {
  const timeLeftEl = document.getElementById("timer");

  // sätt starttid beroende på svårighetsgrad
  if (difficulty === "play") gameState.timeLeft = 45;

  
  // setInterval() kör en funktion upprepade gånger med ett visst intervall
  gameState.timerInterval = setInterval(() => {
    if (gameState.timeLeft <= 0) {
        // om tiden tagit slut, stoppa timern och trigga en inlämning automatiskt
      stopTimer();
      document.querySelector("#submit").click();
      return;
    }
    // uppdatera texten på skärmen 
    timeLeftEl.textContent = `Tid kvar: ${gameState.timeLeft}`;

    // räkna ned en sekund 
    gameState.timeLeft--;
  }, 1000);
}

// stoppa timern och rensa intervallet 
export function stopTimer() {
  clearInterval(gameState.timerInterval);
  gameState.timerInterval = null;
}
