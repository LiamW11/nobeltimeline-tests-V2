export function wireDnD(root) {
    const list = root.querySelector("#sortable-list");
    if (!list) return;

    let dragElement = null;
    let touchClone = null;
    let touchStartY = 0;
    let touchStartX = 0;
    let isTouchActive = false;
    
    // Variabler för scroll-detection
    let dragTimeout = null;
    let potentialDragCard = null;
    const DRAG_DELAY = 150; // 300ms fördröjning
    const MOVE_THRESHOLD = 10; // 10px rörelse avbryter drag

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

    // För mobil - touchstart UTAN preventDefault
    list.addEventListener("touchstart", (element) => {
        const currentCard = element.target.closest(".draggable");
        
        // Om inte på ett kort, gör ingenting
        if (!currentCard) return;
        
        // Om redan en touch är aktiv, blockera
        if (isTouchActive) {
            element.preventDefault();
            return;
        }
        
        // VIKTIGT: INTE preventDefault här - tillåt scroll!
        
        // Spara startposition
        const touch = element.touches[0];
        touchStartY = touch.clientY;
        touchStartX = touch.clientX;
        potentialDragCard = currentCard;
        
        // Sätt en timeout som aktiverar drag efter DRAG_DELAY
        dragTimeout = setTimeout(() => {
            // Aktivera endast om touch fortfarande är på samma kort
            if (potentialDragCard && !isTouchActive) {
                isTouchActive = true;
                dragElement = potentialDragCard;
                
                // Skapa visuell klon
                touchClone = dragElement.cloneNode(true);
                touchClone.style.position = "fixed";
                touchClone.style.width = dragElement.offsetWidth + "px";
                touchClone.style.opacity = "0.8";
                touchClone.style.pointerEvents = "none";
                touchClone.style.zIndex = "1000";
                touchClone.style.left = dragElement.getBoundingClientRect().left + "px";
                
                // Använd nuvarande touch position, inte start position
                const currentTouch = document.elementFromPoint(touchStartX, touchStartY);
                if (currentTouch) {
                    touchClone.style.top = touchStartY - (dragElement.offsetHeight / 2) + "px";
                }
                
                document.body.appendChild(touchClone);
                dragElement.style.opacity = "0.3";
                
                // Vibrering som feedback
                if (navigator.vibrate) {
                    navigator.vibrate(50);
                }
            }
        }, DRAG_DELAY);
        
    }, { passive: true }); // passive: true - tillåt scroll!

    // touchmove - detektera rörelse och hantera drag
    list.addEventListener("touchmove", (element) => {
        const touch = element.touches[0];
        
        // Om drag är aktivt, förhindra scroll och hantera drag
        if (isTouchActive && dragElement && touchClone) {
            element.preventDefault();
            
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
        
        // Om vi väntar på drag-aktivering, kolla om användaren scrollar
        if (dragTimeout && potentialDragCard) {
            const deltaY = Math.abs(touch.clientY - touchStartY);
            const deltaX = Math.abs(touch.clientX - touchStartX);
            
            // Om användaren har rört sig, avbryt drag
            if (deltaY > MOVE_THRESHOLD || deltaX > MOVE_THRESHOLD) {
                clearTimeout(dragTimeout);
                dragTimeout = null;
                potentialDragCard = null;
            }
        }
    }, { passive: false }); // passive: false för att kunna stoppa scroll när drag är aktivt

    // touchend - rensa allt
    list.addEventListener("touchend", () => {
        // Rensa timeout
        if (dragTimeout) {
            clearTimeout(dragTimeout);
            dragTimeout = null;
        }
        
        potentialDragCard = null;
        
        // Om drag var aktivt, återställ
        if (dragElement) {
            dragElement.style.opacity = "1";
            dragElement = null;
        }
        if (touchClone) {
            touchClone.remove();
            touchClone = null;
        }
        
        // Återställ alla variabler
        isTouchActive = false;
        touchStartY = 0;
        touchStartX = 0;
    });
    
    // touchcancel - samma som touchend
    list.addEventListener("touchcancel", () => {
        if (dragTimeout) {
            clearTimeout(dragTimeout);
            dragTimeout = null;
        }
        
        potentialDragCard = null;
        
        if (dragElement) {
            dragElement.style.opacity = "1";
            dragElement = null;
        }
        if (touchClone) {
            touchClone.remove();
            touchClone = null;
        }
        
        isTouchActive = false;
        touchStartY = 0;
        touchStartX = 0;
    });
}

export function readUserOrder(root) {
    return [...root.querySelectorAll("#sortable-list > .draggable")]
    .map((element) => Number(element.dataset.id)); 
}