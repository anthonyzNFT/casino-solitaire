import { renderBoard, drawCard, drawButton } from './render.js';
import { handleMouseDown, handleTouchStart, handleKeyDown } from './input.js';
import { shuffle, generateUUID } from './utils.js';
import { playSound, toggleMute } from './audio.js';

export const COLORS = {
    GOLD: '#E6D39E',
    BLACK: '#141414',
    RED: '#FF0000',
    DARK_BLACK: '#000000',
    WHITE: '#FFFFFF',
    GRADIENT_START: '#141414',
    GRADIENT_END: '#332B1A'
};

export const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'];
export const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
export const SUIT_SYMBOLS = { hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠' };

export let canvas, ctx;
export let cardWidth = 80, cardHeight = 120;
export let scale = 1;
let deck = [];
export let tableau = Array(7).fill().map(() => []);
export let foundations = Array(4).fill().map(() => []);
export let stock = [];
export let waste = [];
export let selectedCards = null; // {pileType, pileIndex, cardIndex, cards}
let moves = [];
let score = 0;
let drawMode = 1;
let timed = false;
let startTime = 0;
let hintsEnabled = true;
let autoComplete = false;
let wins = 0, losses = 0, streak = 0;
let rank = 'Bronze Chip';
let reducedMotion = false;

export function init() {
    try {
        canvas = document.getElementById('gameCanvas');
        if (!canvas) throw new Error('Canvas element not found');
        ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Failed to get 2D context');
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('touchstart', handleTouchStart, {passive: false});
        document.addEventListener('keydown', handleKeyDown);
        loadState();
        if (deck.length === 0) newGame();
        requestAnimationFrame(gameLoop);
    } catch (e) {
        console.error('Initialization failed:', e);
        document.getElementById('debug').textContent = `Error: ${e.message}`;
    }
}

function resizeCanvas() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    scale = Math.min(vw / 800, vh / 600);
    canvas.width = 800 * scale;
    canvas.height = 600 * scale;
    cardWidth = 80 * scale;
    cardHeight = 120 * scale;
    renderBoard();
}

function initDeck() {
    deck = [];
    for (let suit of SUITS) {
        for (let rank of RANKS) {
            deck.push({suit, rank, faceUp: false, id: generateUUID()});
        }
    }
}

function newGame() {
    initDeck();
    shuffle(deck);
    tableau = Array(7).fill().map(() => []);
    for (let i = 0; i < 7; i++) {
        for (let j = 0; j <= i; j++) {
            const card = deck.pop();
            card.faceUp = j === i;
            tableau[i].push(card);
        }
    }
    stock = deck;
    waste = [];
    foundations = Array(4).fill().map(() => []);
    score = 0;
    moves = [];
    startTime = Date.now();
    saveState();
    playSound('shuffle');
    renderBoard();
}

export function drawFromStock() {
    if (stock.length === 0) {
        stock = waste.reverse();
        waste = [];
        score -= 2;
    } else {
        const num = Math.min(drawMode, stock.length);
        for (let i = 0; i < num; i++) {
            const card = stock.pop();
            card.faceUp = true;
            waste.push(card);
        }
    }
    playSound('flip');
    saveMove();
    renderBoard();
}

export function attemptMove(pos) {
    if (!selectedCards) return;
    // Try tableau
    for (let i = 0; i < 7; i++) {
        const x = (20 + i * 100) * scale;
        const y = 250 * scale;
        if (isInBounds(pos, x / scale, y / scale, cardWidth / scale, cardHeight / scale)) {
            const card = selectedCards.cards[0];
            const targetPile = tableau[i];
            if (canPlaceOnTableau(card, targetPile)) {
                tableau[selectedCards.pileIndex].splice(selectedCards.cardIndex);
                targetPile.push(...selectedCards.cards);
                score += 5;
                if (tableau[selectedCards.pileIndex].length > 0) {
                    tableau[selectedCoins pileIndex][tableau[selectedCards.pileIndex].length - 1].faceUp = true;
                }
                document.getElementById('aria-announcer').textContent = `Moved ${card.rank} of ${card.suit} to tableau ${i + 1}`;
            } else {
                navigator.vibrate?.(50); // Haptic feedback for invalid move
            }
        }
    }
    // Try foundations
    for (let i = 0; i < 4; i++) {
        const x = (220 + i * 100) * scale;
        const y = 100 * scale;
        if (isInBounds(pos, x / scale, y / scale, cardWidth / scale, cardHeight / scale)) {
            const card = selectedCards.cards[0];
            const targetPile = foundations[i];
            if (canPlaceOnFoundation(card, targetPile)) {
                tableau[selectedCards.pileIndex].splice(selectedCards.cardIndex);
                targetPile.push(card);
                score += 10;
                if (tableau[selectedCards.pileIndex].length > 0) {
                    tableau[selectedCards.pileIndex][tableau[selectedCards.pileIndex].length - 1].faceUp = true;
                }
                document.getElementById('aria-announcer').textContent = `Moved ${card.rank} of ${card.suit} to foundation ${i + 1}`;
            } else {
                navigator.vibrate?.(50);
            }
        }
    }
    selectedCards = null;
    saveMove();
    if (checkWin()) handleWin();
    renderBoard();
}

function isInBounds(pos, x, y, w, h) {
    return pos.x > x && pos.x < x + w && pos.y > y && pos.y < y + h;
}

function canPlaceOnTableau(card, pile) {
    if (pile.length === 0) return card.rank === 'K';
    const top = pile[pile.length - 1];
    const rankIndex = RANKS.indexOf(card.rank);
    const topRankIndex = RANKS.indexOf(top.rank);
    const isOppositeColor = (card.suit === 'hearts' || card.suit === 'diamonds') !== (top.suit === 'hearts' || top.suit === 'diamonds');
    return isOppositeColor && rankIndex === topRankIndex - 1;
}

function canPlaceOnFoundation(card, pile) {
    if (pile.length === 0) return card.rank === 'A';
    const top = pile[pile.length - 1];
    const rankIndex = RANKS.indexOf(card.rank);
    const topRankIndex = RANKS.indexOf(top.rank);
    return card.suit === top.suit && rankIndex === topRankIndex + 1;
}

function checkWin() {
    return foundations.every(p => p.length === 13);
}

function handleWin() {
    wins++;
    streak++;
    losses = 0;
    updateRank();
    if (!reducedMotion) animateConfetti();
    playSound('win');
    document.getElementById('aria-announcer').textContent = 'Congratulations! You won!';
}

function animateConfetti() {
    // Stubbed particle animation
}

function saveMove() {
    moves.push(JSON.stringify({tableau, foundations, stock, waste, score}));
    if (moves.length > 20) moves.shift();
}

export function undo() {
    if (moves.length > 0) {
        const prev = JSON.parse(moves.pop());
        tableau = prev.tableau;
        foundations = prev.foundations;
        stock = prev.stock;
        waste = prev.waste;
        score = prev.score;
        renderBoard();
        document.getElementById('aria-announcer').textContent = 'Undo performed';
    }
}

export function hint() {
    if (hintsEnabled) {
        // Stubbed: Pulse valid move
        document.getElementById('aria-announcer').textContent = 'Hint: Check available moves';
    }
}

function updateRank() {
    const winRate = wins / (wins + losses) * 100;
    if (winRate > 90) rank = 'Gold Baron';
    else if (winRate > 50) rank = 'Silver Dealer';
    // etc.
}

function saveState() {
    localStorage.setItem('casinoSocietySolitaire', JSON.stringify({
        tableau, foundations, stock, waste, score, wins, losses, streak, rank, drawMode, timed, muted, reducedMotion
    }));
}

function loadState() {
    const saved = localStorage.getItem('casinoSocietySolitaire');
    if (saved) {
        const data = JSON.parse(saved);
        tableau = data.tableau || tableau;
        foundations = data.foundations || foundations;
        stock = data.stock || stock;
        waste = data.waste || waste;
        score = data.score || 0;
        wins = data.wins || 0;
        losses = data.losses || 0;
        streak = data.streak || 0;
        rank = data.rank || 'Bronze Chip';
        drawMode = data.drawMode || 1;
        timed = data.timed || false;
        muted = data.muted || false;
        reducedMotion = data.reducedMotion || false;
    }
}

function gameLoop() {
    // Animation updates
    requestAnimationFrame(gameLoop);
}
