import { drawFromStock, attemptMove, undo, hint, ctx, cardWidth, cardHeight, scale, tableau, foundations, stock, waste, selectedCards } from './game.js';
import { renderBoard } from './render.js';

export function handleMouseDown(e) {
    const pos = getMousePos(e);
    handleClick(pos);
}

export function handleTouchStart(e) {
    e.preventDefault();
    const pos = getTouchPos(e);
    handleClick(pos);
    if (isInBounds(pos, 20, 100, cardWidth / scale, cardHeight / scale)) {
        navigator.vibrate?.(50);
    }
}

export function handleKeyDown(e) {
    if (e.key === 'z' && e.ctrlKey) {
        undo();
        return;
    }
    if (e.key === 'h') {
        hint();
        return;
    }
    // Stubbed: Tab, Space, Arrows for navigation
}

function getMousePos(e) {
    const rect = ctx.canvas.getBoundingClientRect();
    return {x: (e.clientX - rect.left) / scale, y: (e.clientY - rect.top) / scale};
}

function getTouchPos(e) {
    const rect = ctx.canvas.getBoundingClientRect();
    return {x: (e.touches[0].clientX - rect.left) / scale, y: (e.touches[0].clientY - rect.top) / scale};
}

function handleClick(pos) {
    // Stock
    if (isInBounds(pos, 20, 100, cardWidth / scale, cardHeight / scale)) {
        drawFromStock();
        return;
    }
    // Waste
    if (waste.length > 0 && isInBounds(pos, 120, 100, cardWidth / scale, cardHeight / scale)) {
        selectedCards = {pileType: 'waste', pileIndex: 0, cardIndex: waste.length - 1, cards: [waste[waste.length - 1]]};
        renderBoard();
        return;
    }
    // Tableau
    for (let i = 0; i < 7; i++) {
        const pile = tableau[i];
        for (let j = 0; j < pile.length; j++) {
            if (pile[j].faceUp && isInBounds(pos, 20 + i * 100, 250 + j * 20, cardWidth / scale, cardHeight / scale)) {
                selectedCards = {pileType: 'tableau', pileIndex: i, cardIndex: j, cards: pile.slice(j)};
                renderBoard();
                document.getElementById('aria-announcer').textContent = `Selected ${pile[j].rank} of ${pile[j].suit}`;
                return;
            }
        }
    }
    // Buttons
    if (isInBounds(pos, 600, 20, 100, 40)) {
        undo();
        return;
    }
    if (isInBounds(pos, 700, 20, 100, 40)) {
        hint();
        return;
    }
    if (isInBounds(pos, 600, 70, 100, 40)) {
        newGame();
        return;
    }
}

function isInBounds(pos, x, y, w, h) {
    return pos.x > x && pos.x < x + w && pos.y > y && pos.y < y + h;
}
