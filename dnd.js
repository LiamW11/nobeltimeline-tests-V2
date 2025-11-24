export function wireDnD(root) {
    // Hämta listan med sorterbara element från DOM:en som skapas i renderboard från ui.js
    const list = root.querySelector("#sortable-list");
    if (!list) return;

    // Variabel som håller elementet som dras för tillfället
    let dragElement = null;
    // Variabel som håller den visuella klonen när man touchar på mobil
    let touchClone = null;
    // Variabel som lagrar startpositionen för touch
    let touchStartY = 0;
    // Variabel som spårar om en touch redan är aktiv
    let isTouchActive = false;
    // NY: Timer för att kolla om användaren hållit in i 100ms
    let holdTimer = null;
    // NY: Flagga för om drag är aktiverat (efter 100ms)
    let dragEnabled = false;
    // NY: Spara touch-position för att kolla om användaren rört sig
    let touchStartX = 0;

    
    //För pc
    list.addEventListener("dragstart", (element) => {
        // Hitta närmaste .draggable element (om användaren klickar på t.ex. en bild inuti)
        const currentCard = element.target.closest(".draggable");
        // Om inget draggable element hittades, gör ingenting
        if (!currentCard) return;
        // Spara det element som dras
        dragElement = currentCard;
    });

    // Lyssnare för när användaren drar över ett annat element
    list.addEventListener("dragover", (element) => {
        // Förhindra standardbeteendet (annars fungerar inte drop)
        element.preventDefault();
        // Hitta det element som musen är över
        const over = element.target.closest(".draggable");
        // Om inget element hittades eller om det är samma element som dras, gör ingenting
        if (!over || over === dragElement) return;
        // Hämta elementets position och storlek
        const rect = over.getBoundingClientRect();
        // Kolla om musen är i övre halvan av elementet (då ska vi placera före)
        // before blir true eller false beroende på ifall det man drar är över eller under hälften av det hovrar över
        const before = (element.clientY - rect.top) < rect.height / 2;
        // Om musen är i övre halvan, sätt in det dragna elementet före
        if (before) {
            over.parentNode.insertBefore(dragElement, over);
        } else {
            // Annars sätt in det efter
            over.parentNode.insertBefore(dragElement, over.nextSibling);
        }
    });

    //För mobil
    // Lyssnare för när användaren börjar röra skärmen
    list.addEventListener("touchstart", (element) => {
        // Hitta närmaste .draggable element
        const currentCard = element.target.closest(".draggable");
        // Om inget draggable element hittades, gör ingenting (tillåt scroll)
        if (!currentCard) return;
        
        // Kontrollera om en touch redan är aktiv
        if (isTouchActive) {
            element.preventDefault();
            return; // Ignorera nya touches
        }
        
        // NY: Starta inte drag direkt, vänta på timer
        dragEnabled = false;
        
        // Markera att en touch nu är aktiv
        isTouchActive = true;
        
        // Spara det element som ska flyttas
        dragElement = currentCard;
        // Spara startpositionen för touch
        const touch = element.touches[0];
        touchStartY = touch.clientY;
        touchStartX = touch.clientX;
        
        // NY: Starta en timer som aktiverar drag efter 100ms
        holdTimer = setTimeout(() => {
            // Efter 100ms, aktivera drag
            dragEnabled = true;
            
            // Förhindra default nu (så scroll inte startar)
            element.preventDefault();
            
            // Skapa en visuell klon av elementet som följer fingret
            touchClone = currentCard.cloneNode(true);
            touchClone.style.position = "fixed";
            touchClone.style.width = currentCard.offsetWidth + "px";
            touchClone.style.opacity = "0.8";
            touchClone.style.pointerEvents = "none";
            touchClone.style.zIndex = "1000";
            touchClone.style.left = currentCard.getBoundingClientRect().left + "px";
            touchClone.style.top = touch.clientY - (currentCard.offsetHeight / 2) + "px";
            document.body.appendChild(touchClone);
            
            // Gör originalelementet genomskinligt
            currentCard.style.opacity = "0.3";
        }, 100);
    }, { passive: true }); // passive: true för bättre scroll-prestanda

    // Lyssnare för när användaren rör fingret över skärmen
    list.addEventListener("touchmove", (element) => {
        const touch = element.touches[0];
        
        // NY: Om drag inte är aktiverat ännu, kolla om användaren rört sig för mycket
        if (!dragEnabled && holdTimer) {
            const moveX = Math.abs(touch.clientX - touchStartX);
            const moveY = Math.abs(touch.clientY - touchStartY);
            
            // Om användaren rört sig mer än 10px, avbryt drag (användaren scrollar)
            if (moveX > 10 || moveY > 10) {
                clearTimeout(holdTimer);
                holdTimer = null;
                dragElement = null;
                isTouchActive = false;
                return;
            }
            return; // Vänta på att timer ska aktivera drag
        }
        
        // Om inget element dras eller drag inte är aktiverat, gör ingenting
        if (!dragElement || !touchClone || !dragEnabled) return;
        
        element.preventDefault();
        
        // Uppdatera klonens Y-position så den följer fingret
        touchClone.style.top = touch.clientY - (dragElement.offsetHeight / 2) + "px";
        
        // Hitta vilket element som finns under fingret
        const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
        const over = elementBelow?.closest(".draggable");
        
        // Om vi hittat ett draggable element och det inte är samma som dras
        if (over && over !== dragElement) {
            const rect = over.getBoundingClientRect();
            const before = (touch.clientY - rect.top) < rect.height / 2;
            
            if (before) {
                over.parentNode.insertBefore(dragElement, over);
            } else {
                over.parentNode.insertBefore(dragElement, over.nextSibling);
            }
        }
    }, { passive: false });

    // Lyssnare för när användaren lyfter fingret från skärmen
    list.addEventListener("touchend", () => {
        // NY: Rensa timer om den fortfarande är aktiv
        if (holdTimer) {
            clearTimeout(holdTimer);
            holdTimer = null;
        }
        
        // Om det finns ett draget element
        if (dragElement) {
            dragElement.style.opacity = "1";
            dragElement = null;
        }
        // Om det finns en klon
        if (touchClone) {
            touchClone.remove();
            touchClone = null;
        }
        // Återställ alla flaggor
        isTouchActive = false;
        dragEnabled = false;
    });
    
    // Lyssnare för touchcancel
    list.addEventListener("touchcancel", () => {
        // NY: Rensa timer
        if (holdTimer) {
            clearTimeout(holdTimer);
            holdTimer = null;
        }
        
        if (dragElement) {
            dragElement.style.opacity = "1";
            dragElement = null;
        }
        if (touchClone) {
            touchClone.remove();
            touchClone = null;
        }
        isTouchActive = false;
        dragEnabled = false;
    });
}

// Funktion som läser användarens slutgiltiga sortering och returnerar en array med ID:n
export function readUserOrder(root) {
    return [...root.querySelectorAll("#sortable-list > .draggable")]
    .map((element) => Number(element.dataset.id)); 
}