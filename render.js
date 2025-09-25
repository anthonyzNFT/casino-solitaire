import { COLORS, SUITS, RANKS, SUIT_SYMBOLS, cardWidth, cardHeight, scale, tableau, foundations, stock, waste, ctx } from './game.js';

export function renderBoard() {
    const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
    gradient.addColorStop(0, COLORS.GRADIENT_START);
    gradient.addColorStop(1, COLORS.GRADIENT_END);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.font = `${40 * scale}px serif`;
    ctx.fillStyle = COLORS.GOLD;
    ctx.fillText('CS', 20 * scale, 50 * scale);

    ctx.font = `${16 * scale}px sans-serif`;
    ctx.fillText('Join the Elite. Master the Deck.', 20 * scale, 70 * scale);

    drawPile(stock, 20 * scale, 100 * scale, false);
    drawPile(waste, 120 * scale, 100 * scale, true);
    for (let i = 0; i < 4; i++) {
        drawFoundation(i, (220 + i * 100) * scale, 100 * scale);
    }
    for (let i = 0; i < 7; i++) {
        drawTableau(i, (20 + i * 100) * scale, 250 * scale);
    }

    ctx.fillText(`Score: ${score}`, 20 * scale, 80 * scale);
    drawButton('Undo', 600 * scale, 20 * scale, 100 * scale, 40 * scale);
    drawButton('Hint', 700 * scale, 20 * scale, 100 * scale, 40 * scale);
    drawButton('New Game', 600 * scale, 70 * scale, 100 * scale, 40 * scale);
}

export function drawCard(card, x, y, faceUp) {
    ctx.fillStyle = COLORS.WHITE;
    ctx.fillRect(x, y, cardWidth, cardHeight);
    ctx.strokeStyle = COLORS.BLACK;
    ctx.strokeRect(x, y, cardWidth, cardHeight);

    if (faceUp) {
        const color = (card.suit === 'hearts' || card.suit === 'diamonds') ? COLORS.RED : COLORS.DARK_BLACK;
        ctx.fillStyle = color;
        ctx.font = `${20 * scale}px sans-serif`;
        ctx.fillText(card.rank + SUIT_SYMBOLS[card.suit], x + 10 * scale, y + 25 * scale);
        ctx.fillStyle = COLORS.GOLD + '33';
        ctx.fillText('CS', x + cardWidth / 2, y + cardHeight / 2);
    } else {
        ctx.fillStyle = COLORS.GOLD;
        ctx.beginPath();
        ctx.arc(x + cardWidth / 2, y + cardHeight / 2, 20 * scale, 0, 2 * Math.PI);
        ctx.fill();
    }
}

function drawPile(pile, x, y, showTopOnly) {
    if (pile.length === 0) {
        ctx.strokeRect(x, y, cardWidth, cardHeight);
        return;
    }
    if (showTopOnly) {
        drawCard(pile[pile.length - 1], x, y, true);
    } else {
        drawCard({faceUp: false}, x, y, false);
    }
}

function drawFoundation(index, x, y) {
    if (foundations[index].length === 0) {
        ctx.strokeRect(x, y, cardWidth, cardHeight);
    } else {
        drawCard(foundations[index][foundations[index].length - 1], x, y, true);
    }
}

function drawTableau(index, x, y) {
    const pile = tableau[index];
    for (let i = 0; i < pile.length; i++) {
        drawCard(pile[i], x, y + i * 20 * scale, pile[i].faceUp);
    }
}

export function drawButton(text, x, y, w, h) {
    ctx.fillStyle = COLORS.GOLD;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = COLORS.BLACK;
    ctx.font = `${16 * scale}px sans-serif`;
    ctx.fillText(text, x + 10 * scale, y + 25 * scale);
}
