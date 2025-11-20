// Border Blaster - Tiny Build
// Core gameplay loop for a simple tile-based RPG that can be extended later.

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Tile/grid settings
const tileSize = 64; // 10x10 grid on a 640px canvas
const gridWidth = 10;
const gridHeight = 10;

// Countries represented on the grid. Each tile holds a country code or null for ocean/void.
// Keep these lightweight so the map can be swapped out for a full continent later.
const countries = {
  EG: { name: 'Egypt', color: '#f1c40f', fact: 'Home to the Nile River and pyramids.' },
  KE: { name: 'Kenya', color: '#16a085', fact: 'Famed for safaris and the Great Rift Valley.' },
  TZ: { name: 'Tanzania', color: '#2980b9', fact: 'Mount Kilimanjaro touches the sky here.' },
  MA: { name: 'Morocco', color: '#e67e22', fact: 'Spice markets and labyrinthine medinas.' },
  ZA: { name: 'South Africa', color: '#9b59b6', fact: 'Table Mountain watches over Cape Town.' },
  XX: { name: 'Open Sea', color: '#b2bec3', fact: 'Splash zone — upgrade to add islands!' }
};

// Simplified 10x10 grid for the tiny build.
// Layout loosely positions countries north-to-south for quick recognition.
const mapGrid = [
  ['MA','MA','MA','MA','MA','MA','MA','EG','EG','EG'],
  ['MA','MA','MA','MA','MA','MA','MA','EG','EG','EG'],
  ['XX','MA','MA','MA','MA','MA','KE','EG','EG','EG'],
  ['XX','XX','MA','MA','MA','KE','KE','EG','EG','EG'],
  ['XX','XX','XX','KE','KE','KE','KE','EG','EG','EG'],
  ['XX','XX','XX','KE','KE','TZ','TZ','TZ','EG','EG'],
  ['XX','XX','XX','KE','TZ','TZ','TZ','TZ','EG','EG'],
  ['XX','XX','XX','KE','TZ','TZ','TZ','TZ','ZA','ZA'],
  ['XX','XX','XX','XX','TZ','TZ','TZ','ZA','ZA','ZA'],
  ['XX','XX','XX','XX','TZ','TZ','ZA','ZA','ZA','ZA']
];

// Player state and movement flags.
const player = {
  x: 1,
  y: 1,
  color: '#34495e'
};

const movement = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
  w: false,
  a: false,
  s: false,
  d: false
};

// NPCs are placed on the grid and auto-chat when the player is adjacent.
const npcs = [
  { name: 'Cairo Courier', x: 8, y: 1, country: 'EG', dialog: 'Desert winds whisper secrets of the Nile.' },
  { name: 'Marrakesh DJ', x: 2, y: 2, country: 'MA', dialog: 'Spinning pop hits and serving mint tea refills!' },
  { name: 'Serengeti Guide', x: 5, y: 5, country: 'TZ', dialog: 'Lions ahead! Well, plushy lion mascots for now.' },
  { name: 'Nairobi Hacker', x: 6, y: 3, country: 'KE', dialog: 'Building apps that track flamingo dance parties.' },
  { name: 'Cape Town Surfer', x: 8, y: 8, country: 'ZA', dialog: 'Ready to ride the data wave and real waves.' }
];

const hudCountry = document.getElementById('hudCountry');
const hudMessage = document.getElementById('hudMessage');

// Update HUD with the current tile's country name and fact.
function updateCountryHUD() {
  const code = getCountryCode(player.x, player.y);
  const info = countries[code] || countries.XX;
  hudCountry.textContent = info.name;
  hudMessage.textContent = info.fact;
}

// Get the country code for a given tile, clamping to the map bounds.
function getCountryCode(x, y) {
  if (y < 0 || y >= gridHeight || x < 0 || x >= gridWidth) return 'XX';
  return mapGrid[y][x] || 'XX';
}

// Handle key presses for movement.
window.addEventListener('keydown', (event) => {
  if (movement.hasOwnProperty(event.key)) {
    movement[event.key] = true;
  }
});

window.addEventListener('keyup', (event) => {
  if (movement.hasOwnProperty(event.key)) {
    movement[event.key] = false;
  }
});

// Attempt to move the player by dx/dy if the destination is inside the grid.
function tryMove(dx, dy) {
  const newX = player.x + dx;
  const newY = player.y + dy;
  if (newX >= 0 && newX < gridWidth && newY >= 0 && newY < gridHeight) {
    player.x = newX;
    player.y = newY;
    updateCountryHUD();
    checkNPCInteraction();
  }
}

// Process movement flags each frame.
function handleMovement() {
  if (movement.ArrowUp || movement.w) tryMove(0, -1);
  else if (movement.ArrowDown || movement.s) tryMove(0, 1);
  else if (movement.ArrowLeft || movement.a) tryMove(-1, 0);
  else if (movement.ArrowRight || movement.d) tryMove(1, 0);
}

// Draw the tile map, grid lines, player, and NPCs.
function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawTiles();
  drawGridLines();
  drawNPCs();
  drawPlayer();
}

// Draw each tile with its country color.
function drawTiles() {
  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      const code = getCountryCode(x, y);
      const info = countries[code];
      ctx.fillStyle = info ? info.color : countries.XX.color;
      ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
    }
  }
}

// Subtle grid overlay for clarity.
function drawGridLines() {
  ctx.strokeStyle = 'rgba(0,0,0,0.05)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= gridWidth; i++) {
    ctx.beginPath();
    ctx.moveTo(i * tileSize, 0);
    ctx.lineTo(i * tileSize, canvas.height);
    ctx.stroke();
  }
  for (let j = 0; j <= gridHeight; j++) {
    ctx.beginPath();
    ctx.moveTo(0, j * tileSize);
    ctx.lineTo(canvas.width, j * tileSize);
    ctx.stroke();
  }
}

// NPC markers are simple circles for the prototype.
function drawNPCs() {
  npcs.forEach((npc) => {
    ctx.fillStyle = '#2ecc71';
    ctx.beginPath();
    ctx.arc(npc.x * tileSize + tileSize / 2, npc.y * tileSize + tileSize / 2, tileSize / 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('NPC', npc.x * tileSize + tileSize / 2, npc.y * tileSize + tileSize / 2 + 4);
  });
}

// Player marker.
function drawPlayer() {
  ctx.fillStyle = player.color;
  ctx.beginPath();
  ctx.arc(player.x * tileSize + tileSize / 2, player.y * tileSize + tileSize / 2, tileSize / 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fff';
  ctx.font = '14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('You', player.x * tileSize + tileSize / 2, player.y * tileSize + tileSize / 2 + 5);
}

// Trigger NPC dialog when the player is adjacent (4-directional).
function checkNPCInteraction() {
  const npc = npcs.find((n) => Math.abs(n.x - player.x) + Math.abs(n.y - player.y) === 1);
  if (npc) {
    hudMessage.textContent = `${npc.name}: ${npc.dialog}`;
  }
}

// Game loop manages movement and rendering.
function gameLoop() {
  handleMovement();
  render();
  requestAnimationFrame(gameLoop);
}

// Initialize HUD and start the loop.
updateCountryHUD();
render();
requestAnimationFrame(gameLoop);
