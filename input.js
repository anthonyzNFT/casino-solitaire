import { drawFromStock, attemptMove, undo, hint, ctx, cardWidth, cardHeight, scale } from './game.js';
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
        navigator.vibrate?.(50); // Haptic feedback
    }
}

export function handleKeyDown(e) {
    // Stubbed: Tab, Space, Arrows for navigation
    if (e.key === 'z' && e.ctrlKey) undo();
    if (e.key === 'h') hint();
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
    if (isInBounds(pos, 20, 100, cardWidth / scale, cardHeight / scale)) {
        drawFromStock();
        return;
    }
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
    // Handle tableau/foundation clicks
}

function isInBounds(pos, x, y, w, h) {
    return pos.x > x && pos.x < x + w && pos.y > y && pos.y < y + h;
}
