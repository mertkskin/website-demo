const canvas = document.getElementById('raceTrack');
const ctx = canvas.getContext('2d');
const trackWidth = canvas.width;
const trackHeight = canvas.height;
const centerX = trackWidth / 2;

let horses = [];
let raceTime = 0;
let raceInterval;
let timeLeft;
let timerInterval;
let raceStarted = false;
let showFinishLine = false;
let finishLineShowTime = 10; // Show finish line in last 10 seconds
let backgroundScroll = 0; // Track background position - always moves right

class Horse {
    constructor(name, lane, color) {
        this.name = name;
        this.lane = lane;
        this.color = color;
        this.x = 30; // Start from left (starting line)
        this.y = lane * 60 + 30;
        this.stamina = 100;
        this.speed = 0;
        this.direction = 0; // -1 = left, 0 = neutral, 1 = right
        this.finished = false;
        this.finishTime = 0;
    }

    update(finishX) {
        if (this.finished) return;

        // Stamina affects movement
        const staminaPercent = this.stamina / 100;
        
        // Higher stamina = more likely to move right (catching up)
        // Lower stamina = more likely to move left (falling behind)
        if (staminaPercent > 0.6) {
            this.speed = Math.random() * 1.5 + 0.5; // 0.5-2 pixels right (slower)
            this.direction = 1;
        } else if (staminaPercent > 0.3) {
            this.speed = (Math.random() - 0.5) * 2; // Random left/right (slower)
            this.direction = Math.sign(this.speed) || 0;
        } else {
            this.speed = -(Math.random() * 1.5 + 0.5); // 0.5-2 pixels left (slower)
            this.direction = -1;
        }

        this.x += this.speed;

        // Keep horses within screen boundaries
        const maxX = finishX - 10; // Keep away from finish line area
        const minX = 20;
        
        if (this.x > maxX) this.x = maxX;
        if (this.x < minX) this.x = minX;

        // Lose stamina over time (increased depletion)
        this.stamina -= 0.08;

        // Ensure stamina doesn't go below 0
        if (this.stamina < 0) this.stamina = 0;

        // Check if finished (only when finish line is shown and horse reaches it)
        if (showFinishLine && this.x >= finishX && !this.finished) {
            this.finished = true;
            this.finishTime = raceTime - timeLeft;
        }
    }

    draw() {
        // Draw horse as a rectangle
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - 20, this.y - 12, 40, 24);

        // Draw name
        ctx.fillStyle = '#fff';
        ctx.font = '11px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.name, this.x, this.y - 18);

        // Draw stamina bar
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x - 20, this.y + 16, 40, 4);
        ctx.fillStyle = this.stamina > 50 ? '#0f0' : this.stamina > 25 ? '#ff0' : '#f00';
        ctx.fillRect(this.x - 20, this.y + 16, (this.stamina / 100) * 40, 4);
    }
}

function initHorses() {
    const names = [
        document.getElementById('horse1').value || 'Horse 1',
        document.getElementById('horse2').value || 'Horse 2',
        document.getElementById('horse3').value || 'Horse 3',
        document.getElementById('horse4').value || 'Horse 4',
        document.getElementById('horse5').value || 'Horse 5',
        document.getElementById('horse6').value || 'Horse 6'
    ];
    const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];

    horses = [];
    for (let i = 0; i < 6; i++) {
        horses.push(new Horse(names[i], i, colors[i]));
    }
}

function drawTrack() {
    ctx.clearRect(0, 0, trackWidth, trackHeight);

    // Draw background sky
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, trackWidth, trackHeight / 3);

    // Draw background grass
    ctx.fillStyle = '#2ecc71';
    ctx.fillRect(0, trackHeight / 3, trackWidth, trackHeight * 2 / 3);

    // Draw scrolling landscape (trees) for depth effect
    const treeSpacing = 150;
    const treeSize = 40;
    for (let i = -2; i < (trackWidth / treeSpacing) + 2; i++) {
        const treeX = (i * treeSpacing) - (backgroundScroll % treeSpacing);
        const treeY = trackHeight / 4;

        // Draw tree trunk
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(treeX + 15, treeY + 20, 10, 30);

        // Draw tree foliage
        ctx.fillStyle = '#228B22';
        ctx.beginPath();
        ctx.arc(treeX + 20, treeY, treeSize / 2, 0, Math.PI * 2);
        ctx.fill();
    }

    // Draw lanes
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    for (let i = 0; i < 7; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * 60 - 10);
        ctx.lineTo(trackWidth, i * 60 - 10);
        ctx.stroke();
    }

    // Draw starting line on the left
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(25, 0);
    ctx.lineTo(25, trackHeight);
    ctx.stroke();
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('START', 25, trackHeight - 10);

    // Draw finish line only in last seconds
    const finishX = trackWidth - 60;
    if (showFinishLine) {
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(finishX, 0);
        ctx.lineTo(finishX, trackHeight);
        ctx.stroke();

        // Draw checkered pattern for finish
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('FINISH', finishX, trackHeight / 2);
    }

    // Draw horses
    horses.forEach(horse => horse.draw());

    // Draw timer
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Time: ${timeLeft}s`, 10, 30);

    // Draw status
    ctx.font = '14px Arial';
    if (!showFinishLine) {
        ctx.fillText('Racing...', 10, 55);
    } else {
        ctx.fillText('FINISH LINE VISIBLE!', 10, 55);
    }
}

function updateRace(finishX) {
    // Always scroll background to the right (continuous motion illusion)
    backgroundScroll += 3; // Constant rightward scrolling

    horses.forEach(horse => horse.update(finishX));
    drawTrack();

    // Check if all horses finished or time up
    const finishedHorses = horses.filter(h => h.finished).length;
    if (finishedHorses === 6 || timeLeft <= 0) {
        endRace();
    }
}

function startRace() {
    raceTime = parseInt(document.getElementById('raceTime').value) || 60;
    timeLeft = raceTime;
    finishLineShowTime = Math.max(10, Math.floor(raceTime * 0.2)); // Show for last 20% or 10 sec
    showFinishLine = false;

    document.getElementById('setup').style.display = 'none';
    document.getElementById('raceTrack').style.display = 'block';

    initHorses();
    drawTrack();

    raceStarted = true;

    timerInterval = setInterval(() => {
        timeLeft--;
        
        // Show finish line when time reaches threshold
        if (timeLeft <= finishLineShowTime && !showFinishLine) {
            showFinishLine = true;
        }
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
        }
    }, 1000);

    const finishX = canvas.width - 60;
    raceInterval = setInterval(() => {
        updateRace(finishX);
    }, 50);
}

function endRace() {
    clearInterval(raceInterval);
    clearInterval(timerInterval);

    // Sort horses by finish position
    horses.sort((a, b) => {
        if (a.finished && b.finished) {
            return a.finishTime - b.finishTime;
        } else if (a.finished) {
            return -1;
        } else if (b.finished) {
            return 1;
        } else {
            return b.x - a.x; // Closer to right (finish) first
        }
    });

    const standings = document.getElementById('standings');
    standings.innerHTML = '';
    horses.forEach((horse, index) => {
        const li = document.createElement('li');
        const status = horse.finished ? '✓ Finished' : 'Did not finish';
        li.textContent = `${index + 1}. ${horse.name} (${status})`;
        standings.appendChild(li);
    });

    document.getElementById('raceTrack').style.display = 'none';
    document.getElementById('results').style.display = 'block';
}

function newRace() {
    document.getElementById('results').style.display = 'none';
    document.getElementById('setup').style.display = 'block';
    raceStarted = false;
    showFinishLine = false;
}

document.getElementById('startRace').addEventListener('click', startRace);
document.getElementById('newRace').addEventListener('click', newRace);