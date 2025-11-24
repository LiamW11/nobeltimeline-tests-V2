export function wireDnD(root) {
    const list = root.querySelector("#sortable-list");
    if (!list) return;

    let dragElement = null;
    let touchClone = null;
    let touchStartY = 0;
    let touchStartX = 0;
    let isTouchActive = false;
    
    // NYA variabler för scroll-detection
    let touchStartTime = 0;
    let hasMoved = false;
    let dragTimeout = null;
    const DRAG_DELAY = 150; // millisekunder innan drag aktiveras
    const MOVE_THRESHOLD = 10; // pixlar som krävs för att det ska räknas som movement

    // För PC
    list.addEventListener("dragstart", (element) => {
        const currentCard = element.target.closest(".draggable");
        if (!currentCard) return;
        dragElement = currentCard;
    });

    list.addEventListener("dragover", (element) => {
        element.preventDefault();
        const over = element.target.closest(".draggable");
        if (!over || over === dragElement) return;
        const rect = over.getBoundingClientRect();
        const before = (element.clientY - rect.top) < rect.height / 2;
        if (before) {
            over.parentNode.insertBefore(dragElement, over);
        } else {
            over.parentNode.insertBefore(dragElement, over.nextSibling);
        }
    });

    // För mobil - UPPDATERAD touchstart
    list.addEventListener("touchstart", (element) => {
        const currentCard = element.target.closest(".draggable");
        if (!currentCard) return;
        
        if (isTouchActive) {
            element.preventDefault();
            return;
        }
        
        // Spara startposition och tid
        touchStartY = element.touches[0].clientY;
        touchStartX = element.touches[0].clientX;
        touchStartTime = Date.now();
        hasMoved = false;
        
        // Sätt en timeout som aktiverar drag efter DRAG_DELAY
        dragTimeout = setTimeout(() => {
            // Aktivera endast om användaren inte har scrollat
            if (!hasMoved) {
                element.preventDefault();
                isTouchActive = true;
                dragElement = currentCard;
                
                // Skapa visuell klon
                touchClone = currentCard.cloneNode(true);
                touchClone.style.position = "fixed";
                touchClone.style.width = currentCard.offsetWidth + "px";
                touchClone.style.opacity = "0.8";
                touchClone.style.pointerEvents = "none";
                touchClone.style.zIndex = "1000";
                touchClone.style.left = currentCard.getBoundingClientRect().left + "px";
                touchClone.style.top = element.touches[0].clientY - (currentCard.offsetHeight / 2) + "px";
                document.body.appendChild(touchClone);
                
                currentCard.style.opacity = "0.3";
            }
        }, DRAG_DELAY);
        
    }, { passive: true }); // VIKTIGT: passive: true för att tillåta scroll

    // NY touchmove - kolla om användaren scrollar
    list.addEventListener("touchmove", (element) => {
        // Om drag är aktivt, stoppa scroll och hantera drag
        if (isTouchActive) {
            element.preventDefault();
            
            if (!dragElement || !touchClone) return;
            
            const touch = element.touches[0];
            touchClone.style.top = touch.clientY - (dragElement.offsetHeight / 2) + "px";
            
            const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
            const over = elementBelow?.closest(".draggable");
            
            if (over && over !== dragElement) {
                const rect = over.getBoundingClientRect();
                const before = (touch.clientY - rect.top) < rect.height / 2;
                if (before) {
                    over.parentNode.insertBefore(dragElement, over);
                } else {
                    over.parentNode.insertBefore(dragElement, over.nextSibling);
                }
            }
            return;
        }
        
        // Om drag inte är aktiverat än, kolla om användaren scrollar
        if (!isTouchActive && dragTimeout) {
            const touch = element.touches[0];
            const deltaY = Math.abs(touch.clientY - touchStartY);
            const deltaX = Math.abs(touch.clientX - touchStartX);
            
            // Om användaren har rört sig mer än threshold, avbryt drag
            if (deltaY > MOVE_THRESHOLD || deltaX > MOVE_THRESHOLD) {
                hasMoved = true;
                clearTimeout(dragTimeout);
                dragTimeout = null;
            }
            return;
        }
    }, { passive: false });

    // UPPDATERAD touchend
    list.addEventListener("touchend", () => {
        // Rensa timeout om den finns
        if (dragTimeout) {
            clearTimeout(dragTimeout);
            dragTimeout = null;
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
        hasMoved = false;
    });
    
    // UPPDATERAD touchcancel
    list.addEventListener("touchcancel", () => {
        if (dragTimeout) {
            clearTimeout(dragTimeout);
            dragTimeout = null;
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
        hasMoved = false;
    });
}

export function readUserOrder(root) {
    return [...root.querySelectorAll("#sortable-list > .draggable")]
    .map((element) => Number(element.dataset.id)); 
}