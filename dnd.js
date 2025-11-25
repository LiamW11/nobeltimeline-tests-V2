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
    if (!card) return;

    dragElement = card;
    dragging = false;

    touchStartY = e.touches[0].clientY;
    touchStartX = e.touches[0].clientX;

    // NEW: Scroll-blockad flagga
    let scrollBlocked = false;

    // NEW: Starta long-press timer
    longPressTimer = setTimeout(() => {
        scrollBlocked = true;      // Blockera scroll först här
        startDrag(card, touchStartX, touchStartY);
    }, LONG_PRESS_MS);

    // NEW: spara funktionen för move-hanterare
    function handleMove(m) {
        const t = m.touches[0];
        const dy = Math.abs(t.clientY - touchStartY);
        const dx = Math.abs(t.clientX - touchStartX);

        // Om användaren börjar scrolla → avbryt long-press
        if (!dragging && (dy > MOVE_THRESHOLD || dx > MOVE_THRESHOLD)) {
            clearTimeout(longPressTimer);
            list.removeEventListener("touchmove", handleMove);
            dragElement = null;
            return; // Scroll OK
        }

        if (dragging) {
            m.preventDefault(); // NU stoppar vi scroll
            touchClone.style.top = t.clientY - dragElement.offsetHeight / 2 + "px";

            const elBelow = document.elementFromPoint(t.clientX, t.clientY);
            const over = elBelow?.closest(".draggable");

            if (over && over !== dragElement) {
                const rect = over.getBoundingClientRect();
                const before = (t.clientY - rect.top) < rect.height / 2;

                if (before) over.parentNode.insertBefore(dragElement, over);
                else over.parentNode.insertBefore(dragElement, over.nextSibling);
            }
        } else if (scrollBlocked) {
            // Liten anti-scroll-fix om drag precis börjar
            m.preventDefault();
        }
    }

    list.addEventListener("touchmove", handleMove, { passive: false });

    // När touchend sker: städa
    list.addEventListener("touchend", () => {
        clearTimeout(longPressTimer);
        list.removeEventListener("touchmove", handleMove);

        if (dragging) {
            dragElement.style.opacity = "1";
            touchClone.remove();
        }

        dragElement = null;
        touchClone = null;
        dragging = false;
    }, { once: true });

}, { passive: false }); // ← VIKTIGT! Scroll får inte vara helt låst.

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
