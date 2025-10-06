const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;

// Paddle settings
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 80;
const PADDLE_SPEED = 6;

// Ball settings
const BALL_SIZE = 14;
let ballX = CANVAS_WIDTH / 2 - BALL_SIZE / 2;
let ballY = CANVAS_HEIGHT / 2 - BALL_SIZE / 2;
let ballSpeedX = 5;
let ballSpeedY = 3;

// Player paddle
let leftPaddleY = CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2;

// AI paddle
let rightPaddleY = CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2;

// Score
let leftScore = 0;
let rightScore = 0;

// Mouse control for left paddle
canvas.addEventListener('mousemove', function(e) {
    const rect = canvas.getBoundingClientRect();
    let mouseY = e.clientY - rect.top;
    leftPaddleY = mouseY - PADDLE_HEIGHT / 2;
    // Clamp between top and bottom
    leftPaddleY = Math.max(0, Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, leftPaddleY));
});

function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
}

function drawNet() {
    ctx.strokeStyle = "#fff";
    ctx.setLineDash([8, 12]);
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2, 0);
    ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawScore() {
    ctx.font = "32px monospace";
    ctx.fillStyle = "#fff";
    ctx.fillText(leftScore, CANVAS_WIDTH / 4, 40);
    ctx.fillText(rightScore, CANVAS_WIDTH * 3 / 4, 40);
}

function draw() {
    drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, "#222");
    drawNet();
    drawScore();
    // Left paddle
    drawRect(0, leftPaddleY, PADDLE_WIDTH, PADDLE_HEIGHT, "#fff");
    // Right paddle (AI)
    drawRect(CANVAS_WIDTH - PADDLE_WIDTH, rightPaddleY, PADDLE_WIDTH, PADDLE_HEIGHT, "#fff");
    // Ball
    drawCircle(ballX + BALL_SIZE / 2, ballY + BALL_SIZE / 2, BALL_SIZE / 2, "#fff");
}

function resetBall() {
    ballX = CANVAS_WIDTH / 2 - BALL_SIZE / 2;
    ballY = CANVAS_HEIGHT / 2 - BALL_SIZE / 2;
    ballSpeedX = (Math.random() > 0.5 ? 1 : -1) * 5;
    ballSpeedY = (Math.random() > 0.5 ? 1 : -1) * (2 + Math.random() * 3);
}

function updateBall() {
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    // Top and bottom collision
    if (ballY <= 0 || ballY + BALL_SIZE >= CANVAS_HEIGHT) {
        ballSpeedY *= -1;
        ballY = Math.max(0, Math.min(CANVAS_HEIGHT - BALL_SIZE, ballY));
    }

    // Left paddle collision
    if (
        ballX <= PADDLE_WIDTH &&
        ballY + BALL_SIZE > leftPaddleY &&
        ballY < leftPaddleY + PADDLE_HEIGHT
    ) {
        ballSpeedX *= -1;
        ballX = PADDLE_WIDTH;
        // Add effect based on paddle movement
        let intersectY = (ballY + BALL_SIZE / 2) - (leftPaddleY + PADDLE_HEIGHT / 2);
        ballSpeedY += intersectY * 0.15;
    }

    // Right paddle collision (AI)
    if (
        ballX + BALL_SIZE >= CANVAS_WIDTH - PADDLE_WIDTH &&
        ballY + BALL_SIZE > rightPaddleY &&
        ballY < rightPaddleY + PADDLE_HEIGHT
    ) {
        ballSpeedX *= -1;
        ballX = CANVAS_WIDTH - PADDLE_WIDTH - BALL_SIZE;
        let intersectY = (ballY + BALL_SIZE / 2) - (rightPaddleY + PADDLE_HEIGHT / 2);
        ballSpeedY += intersectY * 0.15;
    }

    // Left wall: AI scores
    if (ballX < 0) {
        rightScore++;
        resetBall();
    }
    // Right wall: Player scores
    if (ballX + BALL_SIZE > CANVAS_WIDTH) {
        leftScore++;
        resetBall();
    }
}

function updateAIPaddle() {
    // Simple AI: move paddle towards ballY
    let aiCenter = rightPaddleY + PADDLE_HEIGHT / 2;
    if (aiCenter < ballY + BALL_SIZE / 2 - 10) {
        rightPaddleY += PADDLE_SPEED;
    } else if (aiCenter > ballY + BALL_SIZE / 2 + 10) {
        rightPaddleY -= PADDLE_SPEED;
    }
    // Clamp
    rightPaddleY = Math.max(0, Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, rightPaddleY));
}

function gameLoop() {
    updateBall();
    updateAIPaddle();
    draw();
    requestAnimationFrame(gameLoop);
}

resetBall();
gameLoop();