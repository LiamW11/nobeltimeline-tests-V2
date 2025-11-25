// UPDATED dnd.js with long-press logic (NEW CODE MARKED WITH "// NEW")

export function wireDnD(root) {
    const list = root.querySelector("#sortable-list");
    if (!list) return;

    // --- SHARED VARIABLES ---
    let dragElement = null;
    let touchClone = null;

    // NEW: Long-press / scroll detection variables
    let touchStartY = 0; // NEW
    let touchStartX = 0; // NEW
    let longPressTimer = null; // NEW
    let dragging = false; // NEW

    const LONG_PRESS_MS = 100; // NEW
    const MOVE_THRESHOLD = 10; // NEW

    // ---------------- PC DRAG HANDLERS (unchanged) ----------------
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


    // ---------------- MOBILE TOUCH HANDLERS (REPLACED WITH NEW) ----------------

    list.addEventListener("touchstart", (e) => {
        const card = e.target.closest(".draggable");
        if (!card) return; // Låt scroll fungera som vanligt

        dragElement = card; // NEW

        touchStartY = e.touches[0].clientY; // NEW
        touchStartX = e.touches[0].clientX; // NEW
        dragging = false; // NEW

        // NEW: Starta en long-press timer (100 ms)
        longPressTimer = setTimeout(() => {
            startDrag(card, e.touches[0].clientX, e.touches[0].clientY); // NEW
        }, LONG_PRESS_MS);
    }, { passive: true }); // NEW: Låt scroll fungera!


    list.addEventListener("touchmove", (e) => {
        if (!dragElement) return;

        const touch = e.touches[0];
        const dy = Math.abs(touch.clientY - touchStartY); // NEW
        const dx = Math.abs(touch.clientX - touchStartX); // NEW

        // NEW: Avbryt long-press om användaren försöker scrolla
        if (!dragging && (dy > MOVE_THRESHOLD || dx > MOVE_THRESHOLD)) {
            clearTimeout(longPressTimer); // NEW
            dragElement = null; // NEW
            return; // NEW — Scroll fortsätter
        }

        // NEW: Aktiv drag startad
        if (dragging) {
            e.preventDefault();

            touchClone.style.top = touch.clientY - dragElement.offsetHeight / 2 + "px";

            const elBelow = document.elementFromPoint(touch.clientX, touch.clientY);
            const over = elBelow?.closest(".draggable");

            if (over && over !== dragElement) {
                const rect = over.getBoundingClientRect();
                const before = (touch.clientY - rect.top) < rect.height / 2;

                if (before) {
                    over.parentNode.insertBefore(dragElement, over);
                } else {
                    over.parentNode.insertBefore(dragElement, over.nextSibling);
                }
            }
        }
    }, { passive: false }); // NEW: För att kunna stoppa scroll när draggin är aktiv


    list.addEventListener("touchend", () => {
        clearTimeout(longPressTimer); // NEW

        if (dragging) {
            dragElement.style.opacity = "1";
            touchClone.remove();
        }

        dragging = false; // NEW
        dragElement = null;
        touchClone = null;
    });


    // ---------------- NEW Helper Function for Drag Start ----------------
    function startDrag(card, clientX, clientY) {
        dragging = true; // NEW

        card.style.opacity = "0.3"; // NEW

        touchClone = card.cloneNode(true); // NEW
        touchClone.style.position = "fixed";
        touchClone.style.width = card.offsetWidth + "px";
        touchClone.style.opacity = "0.8";
        touchClone.style.pointerEvents = "none";
        touchClone.style.zIndex = "1000";
        touchClone.style.left = card.getBoundingClientRect().left + "px";
        touchClone.style.top = clientY - (card.offsetHeight / 2) + "px";

        document.body.appendChild(touchClone); // NEW
    }
}


// --- UNCHANGED ---
export function readUserOrder(root) {
    return [...root.querySelectorAll("#sortable-list > .draggable")] 
        .map((element) => Number(element.dataset.id));
}
