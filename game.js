import { renderBoard, drawCard, drawButton } from './render.js';
import { handleMouseDown, handleTouchStart, handleKeyDown } from './input.js';
import { shuffle, generateUUID } from './utils.js';
import { playSound, toggleMute } from './audio.js';

const COLORS = {
    GOLD: '#E6D39E',
    BLACK: '#141414',
    RED: '#FF0000',
    DARK_BLACK: '#000000',
    WHITE: '#FFFFFF',
    GRADIENT_START: '#141414',
    GRADIENT_END: '#332B1A'
};

const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const SUIT_SYMBOLS = { hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠' };

let canvas, ctx;
let cardWidth = 80, cardHeight = 120;
let scale = 1;
let deck = [];
let tableau = Array(7).fill().map(() => []);
let foundations = Array(4).fill().map(() => []);
let stock = [];
let waste = [];
let selectedCards = null;
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
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('touchstart', handleTouchStart, {passive: false});
    document.addEventListener('keydown', handleKeyDown);
    loadState();
    if (deck.length === 0) newGame();
    requestAnimationFrame(gameLoop);
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
    // Stubbed: Validate and move cards
    if (selectedCards) {
        // Check drop zone, validate move, update score
        selectedCards = null;
        saveMove();
        if (checkWin()) handleWin();
    }
    renderBoard();
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
    }
}

export function hint() {
    if (hintsEnabled) {
        // Stubbed: Pulse valid move
    }
}

function updateRank() {
    const winRate = wins / (wins + losses) * 100;
    if (winRate > 90) rank = 'Gold Baron';
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
        Object.assign(window, data);
    }
}

function gameLoop() {
    // Animation updates
    requestAnimationFrame(gameLoop);
}

export { COLORS, SUITS, RANKS, SUIT_SYMBOLS, cardWidth, cardHeight, scale, tableau, foundations, stock, waste, selectedCards, ctx };
