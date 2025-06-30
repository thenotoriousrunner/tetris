const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');

const GRID_SIZE = 30;
const GRID_WIDTH = 10;
const GRID_HEIGHT = 20;

canvas.width = GRID_WIDTH * GRID_SIZE;
canvas.height = GRID_HEIGHT * GRID_SIZE;

let grid = [];
for (let y = 0; y < GRID_HEIGHT; y++) {
    grid[y] = [];
    for (let x = 0; x < GRID_WIDTH; x++) {
        grid[y][x] = 0; // 0 represents an empty cell
    }
}

let score = 0;
let currentShape = null;
let nextShape = null;
let gameInterval = null;
let dropInterval = 1000; // Time in milliseconds to drop the shape

// Function to draw a single square cell
function drawSquare(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * GRID_SIZE, y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
    ctx.strokeStyle = '#000';
    ctx.strokeRect(x * GRID_SIZE, y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
}

// Tetris shapes definition (coordinates are relative to the shape's top-left bounding box)
const TETROMINOES = [
    [[0, 0], [1, 0], [2, 0], [3, 0]], // I
    [[0, 0], [0, 1], [1, 1], [2, 1]], // J
    [[2, 0], [0, 1], [1, 1], [2, 1]], // L
    [[0, 0], [1, 0], [0, 1], [1, 1]], // O
    [[1, 0], [2, 0], [0, 1], [1, 1]], // S
    [[1, 0], [0, 1], [1, 1], [2, 1]], // T
    [[0, 0], [1, 0], [1, 1], [2, 1]]  // Z
];

const COLORS = [
    'cyan', // I
    'blue', // J
    'orange', // L
    'yellow', // O
    'green', // S
    'purple', // T
    'red'   // Z
];

// Function to get a random shape
function getRandomShape() {
    const randomIndex = Math.floor(Math.random() * TETROMINOES.length);
    const shape = TETROMINOES[randomIndex];
    const color = COLORS[randomIndex];
    // Initial position (top center)
    const startPos = { x: Math.floor(GRID_WIDTH / 2) - Math.ceil(shape[0].length / 2), y: 0 };
    return { shape, color, pos: startPos };
}

// Function to draw a shape
function drawShape(shape) {
    shape.shape.forEach(block => {
        drawSquare(shape.pos.x + block[0], shape.pos.y + block[1], shape.color);
    });
}

// Function to draw the game grid
function drawGrid() {
    for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            drawSquare(x, y, grid[y][x] ? grid[y][x] : '#eee'); // Draw occupied cells with their color, empty in light grey
        }
    }
}

// Basic game loop structure (will be filled in later)
function gameLoop() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawGrid();
    if (currentShape) {
        drawShape(currentShape);
    }
    // More drawing and game logic will go here

    scoreDisplay.innerText = score;
}

// Start the game
function startGame() {
    grid = []; // Reset grid
    for (let y = 0; y < GRID_HEIGHT; y++) {
        grid[y] = [];
        for (let x = 0; x < GRID_WIDTH; x++) {
            grid[y][x] = 0;
        }
    }
    score = 0;
    currentShape = getRandomShape();
    nextShape = getRandomShape(); // Optional: for showing next shape

    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, 50); // Game loop for drawing and updates

    // Drop interval
    if (dropIntervalId) clearInterval(dropIntervalId);
    dropIntervalId = setInterval(dropShape, dropInterval);
}

// Function to check for collision
function checkCollision(shape, offsetX, offsetY) {
    for (const block of shape.shape) {
        const x = shape.pos.x + block[0] + offsetX;
        const y = shape.pos.y + block[1] + offsetY;

        // Check grid boundaries
        if (x < 0 || x >= GRID_WIDTH || y >= GRID_HEIGHT) {
            return true; // Collision with wall or bottom
        }
        // Check if cell is already occupied (and not the current shape's block)
        if (y >= 0 && grid[y][x] !== 0) {
             // Need a way to check if the occupied cell is *not* part of the current shape
             // For simplicity initially, we'll just check if it's not empty
             return true;
        }
    }
    return false; // No collision
}

// Function to lock the shape in the grid
function lockShape(shape) {
    shape.shape.forEach(block => {
        const x = shape.pos.x + block[0];
        const y = shape.pos.y + block[1];
        if (y >= 0) { // Only lock if within the grid height
            grid[y][x] = shape.color; // Mark the grid cell with the shape's color
        }
    });
    // After locking, check for completed lines and get a new shape
    checkLines(); // Will implement later
    currentShape = getRandomShape();
    // Check for game over (if new shape collides immediately)
    if (checkCollision(currentShape, 0, 0)) {
        gameOver(); // Will implement later
    }
}

// Function to check and clear completed lines
function checkLines() {
    let linesCleared = 0;
    for (let y = GRID_HEIGHT - 1; y >= 0; y--) {
        // Check if the row is full (no 0s)
        const isRowFull = grid[y].every(cell => cell !== 0);

        if (isRowFull) {
            // Remove the full row
            grid.splice(y, 1);
            // Add a new empty row at the top
            grid.unshift(Array(GRID_WIDTH).fill(0));
            linesCleared++;
            y++; // Re-check the same new row at this index
        }
    }
    if (linesCleared > 0) {
        score += linesCleared * 100; // Basic scoring
        // Increase difficulty (optional)
        // dropInterval = Math.max(50, dropInterval - (linesCleared * 10));
        // clearInterval(dropIntervalId);
        // dropIntervalId = setInterval(dropShape, dropInterval);
    }
}

// Function for game over
function gameOver() {
    clearInterval(gameInterval);
    clearInterval(dropIntervalId);
    ctx.fillStyle = 'black';
    ctx.globalAlpha = 0.75;
    ctx.fillRect(0, canvas.height / 3, canvas.width, canvas.height / 5);
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2);
    // Could add a restart button or message here
}

// Function to drop the shape down
let dropIntervalId = null;
function dropShape() {
    if (currentShape) {
        if (!checkCollision(currentShape, 0, 1)) {
            currentShape.pos.y += 1; // Move down
        } else {
            lockShape(currentShape); // Cannot move down, lock it
        }
    }
}

// Basic game loop structure (will be filled in later)
function gameLoop() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawGrid();
    if (currentShape) {
        drawShape(currentShape);
    }
    // More drawing and game logic will go here

    scoreDisplay.innerText = score;
}

startGame(); // Call to start the game

// Handle keyboard input
document.addEventListener('keydown', (e) => {
    if (!currentShape) return; // Don't move if no shape is falling

    let moved = false;
    switch (e.key) {
        case 'ArrowLeft':
            if (!checkCollision(currentShape, -1, 0)) {
                currentShape.pos.x -= 1;
                moved = true;
            }
            break;
        case 'ArrowRight':
            if (!checkCollision(currentShape, 1, 0)) {
                currentShape.pos.x += 1;
                moved = true;
            }
            break;
        case 'ArrowDown':
            if (!checkCollision(currentShape, 0, 1)) {
                currentShape.pos.y += 1;
                moved = true;
            } else {
                lockShape(currentShape);
            }
            // Speed up drop when down arrow is held
            if (dropIntervalId) clearInterval(dropIntervalId);
            dropIntervalId = setInterval(dropShape, 50); // Faster drop
            break;
        case 'ArrowUp':
            // Rotation logic
            const rotatedShape = rotateShape(currentShape);
            if (!checkCollision(rotatedShape, 0, 0)) {
                currentShape = rotatedShape;
                moved = true;
            }
            break;
    }

    if (moved) {
        // Redraw the grid and shape after movement
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGrid();
        drawShape(currentShape);
    }
});

// Function to rotate a shape (90 degrees clockwise)
function rotateShape(shape) {
    // Rotation matrix for 90 degrees clockwise: [[0, -1], [1, 0]]
    // New x = original y * 0 + original x * 1 = original x
    // New y = original y * -1 + original x * 0 = -original y
    // This is rotation around (0,0). We need to rotate around the center of the shape.
    // A common way for Tetris is to rotate around the second block of the shape definition (for I, L, J, T) or the center (O, S, Z).
    // A simpler approach for basic rotation is to find the center of the bounding box and rotate relative to that.
    // Let's implement a rotation that works reasonably for most shapes by rotating around the first block as a pivot for simplicity.
    // A better approach for Tetris requires defining rotation points for each shape.
    // For this simple version, let's use a common pivot logic, like rotating around the second block of the shape array.

    // Find the pivot point (e.g., the second block)
    const pivot = shape.shape[1]; // Using the second block as pivot

    const newShapeBlocks = shape.shape.map(block => {
        // Translate block so pivot is at origin
        const translatedX = block[0] - pivot[0];
        const translatedY = block[1] - pivot[1];

        // Rotate 90 degrees clockwise
        const rotatedX = -translatedY;
        const rotatedY = translatedX;

        // Translate block back
        const finalX = rotatedX + pivot[0];
        const finalY = rotatedY + pivot[1];

        return [finalX, finalY];
    });

    // Create a new shape object with the rotated blocks and the original position and color
    const rotatedShape = { shape: newShapeBlocks, color: shape.color, pos: { ...shape.pos } };

    return rotatedShape;
}

document.addEventListener('keyup', (e) => {
    // Reset drop speed when down arrow is released
    if (e.key === 'ArrowDown') {
        if (dropIntervalId) clearInterval(dropIntervalId);
        dropIntervalId = setInterval(dropShape, dropInterval); // Normal drop speed
    }
});