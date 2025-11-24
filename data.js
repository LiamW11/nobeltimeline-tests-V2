
// ansvarar för att hämta och blanda nobelpristagare
export async function loadNobelData() {
    // hämta JSON-filen med alla nobelpristagare
    const res = await fetch('starter-kit/nobel-data.json');
    const json = await res.json();

    // vi returnerar endast listan med pristagare
    // format: [{id, name, year, category, imageUrl}]
    return json.laureates; 
}

// fisher yater shuffle
export function shuffle(array) {
    // vi går igenom listan baklänges och byter plats på två element åt gången
    for (let i =array.length - 1; i > 0; i--) {
    // här skapar vi ett slumpmässigt index j, 
    // Math.floor gör talet helt, 
    // Math.random() get ett ral mellan 0 och 1
    // Math.random() * (i + 1), skapa ett slumpmässigt tal mellan 0 och i
        const j = Math.floor(Math.random() * (i + 1));
        // destructuring
        // det innebär, 
        // ta elementet på plats i,
        // ta elementet på plats j,
        // byt plats på dem
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}