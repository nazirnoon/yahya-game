// Initialize canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game objects and variables
let platforms = [];
let coins = [];
let player;
let gravity = 0.5;
let score = 0;
let playerImage = new Image();
let platformImage = new Image();
let background = new Image();

// Camera variables
let cameraX = 0;
let cameraY = 0;

// Platform variables
const platformWidth = 120;
const platformHeight = 20;
const platformGap = 100; 
const minPlatformY = canvas.height * 0.45; // Adjust to raise the lowest platform
const maxPlatformY = canvas.height * 0.75; // Adjust to lower the highest platform
let lastPlatformX = canvas.width;

const coinSize = 15; // Size of the coin, adjust as needed
const coinOffsetY = -30; // Vertical offset from the platform (negative to place above)


// Preload images
function loadImages() {
    playerImage.src = 'character.png'; 
    platformImage.src = 'ground.jpeg'; 
    background.src = 'sky.jpeg'; 

    background.onload = () => {
        startGame();
    }
}

// Initialize game objects and start the game
function startGame() {
    platforms = [];  // Clear existing platforms
    coins = [];      // Clear existing coins
    score = 0;       // Reset score
    cameraX = 0;
    cameraY = 0;

    // Reset player settings
    player = {
        x: 50,
        y: 0,
        width: 72,
        height: 98,
        speedY: 0,
        speedX: 0,
        jumpPower: -15,
        onGround: false,
        movingLeft: false,
        movingRight: false
    };

    // Initialize platforms and coins
    initPlatforms();
    lastPlatformX = 200; // Reset this to ensure platforms start generating from the beginning

    requestAnimationFrame(updateGameArea);
}
function initPlatforms() {
    platforms = [];
    coins = []; // Clear previous coins
    const initialX = 50;
    const initialY = 250;
    platforms.push({ x: initialX, y: initialY, width: 120, height: 20 });
    // Place a coin on each platform
    lastPlatformX = initialX + 120 + platformGap; // Prepare for next platform generation
}



// Game loop function
function updateGameArea() {
  clearCanvas();
  movePlayer();
  generatePlatforms();
  removePlatforms();
  updateCamera();
  drawBackground();
  drawPlayer();
  drawPlatforms();
  checkPlatformCollision();
  checkCoinCollision();
  drawCoins();
  drawScore();

  if (player.y > canvas.height) {
      gameOver();
  } else {
      requestAnimationFrame(updateGameArea);
  }
}

// Function to handle "Game Over" state and restart
function gameOver() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#fff';
  ctx.font = '36px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Game Over', canvas.width / 2  , canvas.height / 2 -40 );
  ctx.font = '30px Arial';  // Slightly smaller font size for the score
  ctx.fillText('Score: ' + score, canvas.width / 2, canvas.height / 2);  // Position the score below the "Game Over" message
  ctx.fillText('Press R to Restart', canvas.width / 2, canvas.height / 2 + 40);
  
  
  document.addEventListener('keydown', function restartGame(e) {
    if (e.key === 'r') {
      document.removeEventListener('keydown', restartGame);
      startGame();
    }
  });
}

// Clear the canvas
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Move the player
function movePlayer() {
    if (player.movingLeft) {
        player.x -= 4;
    }
    if (player.movingRight) {
        player.x += 4;
    }


    player.y += player.speedY;
    player.speedY += gravity;
}

// Draw the player
function drawPlayer() {
    if (playerImage.complete) {
        ctx.drawImage(playerImage, player.x - cameraX, player.y, player.width, player.height);
    }
}

// Generate new platforms and place a coin on each
function generatePlatforms() {
    while (lastPlatformX < cameraX + canvas.width + platformWidth) {
        const platformY = Math.random() * (maxPlatformY - minPlatformY) + minPlatformY;
        platforms.push({ x: lastPlatformX, y: platformY, width: platformWidth, height: platformHeight });
        // Add a coin for each new platform
        coins.push({
            x: lastPlatformX + platformWidth / 2,
            y: platformY - 30,
            size: 15
        });
        lastPlatformX += platformWidth + platformGap;
    }
}




// Remove platforms that are out of view
function removePlatforms() {
    platforms = platforms.filter(platform => platform.x + platform.width >= cameraX);
}

// Draw the platforms
function drawPlatforms() {
    platforms.forEach(platform => {
        if (platformImage.complete) {
            ctx.drawImage(platformImage, platform.x - cameraX, platform.y, platform.width, platform.height);
        }
    });
}

// Update camera position
function updateCamera() {
    cameraX = Math.max(0, player.x - canvas.width / 2);
}

// Draw background
function drawBackground() {
    if (background.complete) {
        const bgWidth = background.width;
        const bgHeight = background.height;
        const startX = -cameraX % bgWidth;
        for (let i = 0; i <= canvas.width / bgWidth + 1; i++) {
            ctx.drawImage(background, startX + i * bgWidth, 0, bgWidth, canvas.height);
        }
    }
}

// Check for collision with platforms
function checkPlatformCollision() {
    player.onGround = false;
    platforms.forEach(platform => {
        const horizontalOverlap = player.x < platform.x + platform.width && player.x + player.width > platform.x;
        const verticalOverlap = player.y + player.height <= platform.y && player.y + player.height + player.speedY > platform.y;
        if (horizontalOverlap && verticalOverlap) {
            player.onGround = true;
            player.y = platform.y - player.height;
            player.speedY = 0;
        }
    });
}
// Check for collision with coins
function checkCoinCollision() {
    for (let i = coins.length - 1; i >= 0; i--) {
        const coin = coins[i];
        const dx = (player.x + player.width / 2) - coin.x;
        const dy = (player.y + player.height / 2) - coin.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < coin.size + Math.max(player.width, player.height) / 2) {
            score += 10;
            coins.splice(i, 1); // Remove the coin after it has been collected
        }
    }
}





// Draw the coins
function drawCoins() {
    coins.forEach(coin => {
        ctx.fillStyle = 'gold';
        ctx.beginPath();
        ctx.arc(coin.x - cameraX, coin.y, coin.size, 0, Math.PI * 2, true); // Ensure to use the coin's size
        ctx.fill();
    });
}


// Draw the score
function drawScore() {
    ctx.fillStyle = '#FFF';  // Bright white color for visibility
    ctx.font = '32px Arial';  // Larger font size for better visibility
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText("Score: " + score, 20, 60);  // Make sure these coordinates are visible on your canvas
}


// Keyboard controls
document.addEventListener("keydown", function (e) {
    switch (e.key) {
        case "ArrowLeft":
        case "a":
            player.movingLeft = true;
            break;
        case "ArrowRight":
        case "d":
            player.movingRight = true;
            break;
        case " ":
            if (player.onGround) {
                player.speedY = player.jumpPower;
                player.onGround = false;
            }
            break;
    }
});

document.addEventListener("keyup", function (e) {
    switch (e.key) {
        case "ArrowLeft":
        case "a":
            player.movingLeft = false;
            break;
        case "ArrowRight":
        case "d":
            player.movingRight = false;
            break;
    }
});

// Load assets and start the game
loadImages();
