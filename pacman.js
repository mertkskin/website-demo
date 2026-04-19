const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const tile = 20;
const cols = 21;
const rows = 21;
const state = { playing: true, message: '' };

const maze = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1,0,1],
    [1,3,1,1,0,1,0,1,0,0,0,1,0,1,0,1,1,0,1,3,1],
    [1,0,0,0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,0,0,0,0,0,0,0,1,0,1,1,0,1,0,1],
    [1,0,0,0,0,1,0,1,1,1,1,1,0,1,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,0,1,0,0,0,1,0,1,0,1,1,0,1,0,1],
    [1,0,0,0,0,0,0,1,0,1,0,1,0,1,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,0,1,0,1,0,1,0,1,0,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,0,1,0,1,0,1,0,1,0,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,1,0,1,0,1,0,1,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,0,1,0,0,0,1,0,1,0,1,1,0,1,0,1],
    [1,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,1,1,1,1,1,1,1,1,0,1,1,0,1,0,1],
    [1,3,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,3,1],
    [1,0,1,1,0,1,0,1,0,1,0,1,0,1,0,1,1,0,1,0,1],
    [1,0,0,0,0,1,0,1,0,0,0,1,0,1,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,0,1,0,1],
    [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

const player = { x: 1, y: 1, dir: 'right', nextDir: 'right', color: '#ffeb00' };
const ghost = { x: 10, y: 10, dir: 'left', color: '#ff4f8f' };

function drawCircle(x, y, color, radius, dir) {
    const px = x * tile + tile / 2;
    const py = y * tile + tile / 2;
    ctx.fillStyle = color;
    ctx.beginPath();
    const start = dir === 'left' ? 0.3 : dir === 'right' ? 0.8 : dir === 'up' ? 1.8 : 0.8;
    const end = dir === 'left' ? 2.0 : dir === 'right' ? 5.0 : dir === 'up' ? 4.7 : 5.0;
    ctx.arc(px, py, radius, start, end, false);
    ctx.lineTo(px, py);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    const eyeX = px + (dir === 'left' ? -5 : dir === 'right' ? 5 : 0);
    const eyeY = py + (dir === 'down' ? 2 : dir === 'up' ? -5 : -5);
    ctx.arc(eyeX, eyeY, 3, 0, Math.PI * 2);
    ctx.fill();
}

function drawGhost(x, y, color) {
    const px = x * tile;
    const py = y * tile;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(px + tile / 2, py + tile / 2 - 2, 10, Math.PI, 0);
    ctx.lineTo(px + tile - 3, py + tile - 2);
    ctx.quadraticCurveTo(px + tile / 2, py + tile + 6, px + 3, py + tile - 2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(px + 10, py + 8, 3, 0, Math.PI * 2);
    ctx.arc(px + 16, py + 8, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(px + 10, py + 8, 1.5, 0, Math.PI * 2);
    ctx.arc(px + 16, py + 8, 1.5, 0, Math.PI * 2);
    ctx.fill();
}

function canMove(x, y) {
    return maze[y] && maze[y][x] !== 1;
}

function step(position, direction) {
    const next = { x: position.x, y: position.y };
    if (direction === 'left') next.x -= 1;
    if (direction === 'right') next.x += 1;
    if (direction === 'up') next.y -= 1;
    if (direction === 'down') next.y += 1;
    return next;
}

function collectPellet() {
    const value = maze[player.y][player.x];
    if (value === 0 || value === 3) {
        maze[player.y][player.x] = 2;
    }
}

function pelletsRemaining() {
    return maze.flat().filter(cell => cell === 0 || cell === 3).length;
}

function handleInput(event) {
    const keys = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' };
    if (keys[event.key]) {
        player.nextDir = keys[event.key];
    }
}

function movePlayer() {
    const next = step(player, player.nextDir);
    if (canMove(next.x, next.y)) {
        player.dir = player.nextDir;
    }
    const target = step(player, player.dir);
    if (canMove(target.x, target.y)) {
        player.x = target.x;
        player.y = target.y;
    }
}

function moveGhost() {
    const directions = ['left', 'right', 'up', 'down'];
    const choices = directions
        .map(dir => ({ dir, pos: step(ghost, dir) }))
        .filter(item => canMove(item.pos.x, item.pos.y));
    if (!choices.length) return;
    choices.sort((a, b) => distance(a.pos, player) - distance(b.pos, player));
    const best = choices.slice(0, 2);
    const pick = best[Math.floor(Math.random() * best.length)];
    ghost.dir = pick.dir;
    const next = step(ghost, ghost.dir);
    ghost.x = next.x;
    ghost.y = next.y;
}

function distance(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function checkCollision() {
    if (player.x === ghost.x && player.y === ghost.y) {
        state.playing = false;
        state.message = 'Game Over';
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const cell = maze[y][x];
            const px = x * tile;
            const py = y * tile;
            if (cell === 1) {
                ctx.fillStyle = '#1a1aff';
                ctx.fillRect(px, py, tile, tile);
                ctx.fillStyle = '#0f0f7f';
                ctx.fillRect(px + 4, py + 4, tile - 8, tile - 8);
            } else {
                ctx.fillStyle = '#000';
                ctx.fillRect(px, py, tile, tile);
                if (cell === 0) {
                    ctx.fillStyle = '#ffe66d';
                    ctx.beginPath();
                    ctx.arc(px + tile / 2, py + tile / 2, 3, 0, Math.PI * 2);
                    ctx.fill();
                } else if (cell === 3) {
                    ctx.fillStyle = '#fff';
                    ctx.beginPath();
                    ctx.arc(px + tile / 2, py + tile / 2, 6, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
    }
    drawCircle(player.x, player.y, player.color, 12, player.dir);
    drawGhost(ghost.x, ghost.y, ghost.color);
    if (!state.playing) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = '28px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(state.message, canvas.width / 2, canvas.height / 2);
    }
}

function update() {
    if (!state.playing) {
        draw();
        return;
    }
    movePlayer();
    collectPellet();
    if (pelletsRemaining() === 0) {
        state.playing = false;
        state.message = 'You Win!';
    }
    moveGhost();
    checkCollision();
    draw();
}

function resetGame() {
    state.playing = true;
    state.message = '';
    player.x = 1;
    player.y = 1;
    player.dir = 'right';
    player.nextDir = 'right';
    ghost.x = 10;
    ghost.y = 10;
    ghost.dir = 'left';
    const original = [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1,0,1],
        [1,3,1,1,0,1,0,1,0,0,0,1,0,1,0,1,1,0,1,3,1],
        [1,0,0,0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0,0,1],
        [1,0,1,1,0,1,0,0,0,0,0,0,0,1,0,1,1,0,1,0,1],
        [1,0,0,0,0,1,0,1,1,1,1,1,0,1,0,0,0,0,0,0,1],
        [1,0,1,1,0,1,0,1,0,0,0,1,0,1,0,1,1,0,1,0,1],
        [1,0,0,0,0,0,0,1,0,1,0,1,0,1,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,0,1,0,1,0,1,0,1,0,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,0,1,0,1,0,1,0,1,0,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,1,0,1,0,1,0,1,0,0,0,0,0,0,1],
        [1,0,1,1,0,1,0,1,0,0,0,1,0,1,0,1,1,0,1,0,1],
        [1,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
        [1,0,1,1,0,1,1,1,1,1,1,1,1,1,0,1,1,0,1,0,1],
        [1,3,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,3,1],
        [1,0,1,1,0,1,0,1,0,1,0,1,0,1,0,1,1,0,1,0,1],
        [1,0,0,0,0,1,0,1,0,0,0,1,0,1,0,0,0,0,0,0,1],
        [1,0,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,0,1,0,1],
        [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ];
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            maze[y][x] = original[y][x];
        }
    }
    draw();
}

document.addEventListener('keydown', handleInput);
document.getElementById('restart').addEventListener('click', resetGame);
document.getElementById('playPacman').addEventListener('click', startGame);

function startGame() {
    document.getElementById('playPacman').style.display = 'none';
    document.getElementById('game').style.display = 'block';
    document.getElementById('restart').style.display = 'inline-block';
    resetGame();
    setInterval(update, 120);
}
