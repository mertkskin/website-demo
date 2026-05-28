/**
 * Map Generator Game
 * Procedural 2D terrain generation with player movement
 */

class MapGenerator {
  constructor(width = 100, height = 100, seed = 0) {
    this.width = width;
    this.height = height;
    this.seed = seed;
    this.perlin = new PerlinNoise(seed);
    this.map = this.generateMap();
  }

  /**
   * Generate the height map using Perlin noise
   */
  generateMap() {
    const map = [];
    const scale = 0.08; // Controls zoom level of noise

    for (let y = 0; y < this.height; y++) {
      map[y] = [];
      for (let x = 0; x < this.width; x++) {
        // Use FBM for natural-looking terrain
        const value = this.perlin.fbm(x * scale, y * scale, 4, 0.5, 2.0);
        map[y][x] = value;
      }
    }

    return map;
  }

  /**
   * Get biome type based on noise value
   */
  getBiome(value) {
    if (value < 0.25) return 'water';
    if (value < 0.35) return 'sand';
    if (value < 0.55) return 'grass';
    if (value < 0.65) return 'forest';
    if (value < 0.80) return 'mountain';
    return 'snow';
  }

  /**
   * Get biome at specific coordinates
   */
  getBiomeAt(x, y) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return 'water';
    }
    const value = this.map[y][x];
    return this.getBiome(value);
  }
}

/**
 * Game State and Renderer
 */
class MapGeneratorGame {
  constructor() {
    this.mapWidth = 100;
    this.mapHeight = 100;
    this.seed = Math.floor(Math.random() * 1000000);
    this.generator = null;
    this.playerX = 50;
    this.playerY = 50;
    this.tileSize = 8; // Starting tile size in pixels
    this.minTileSize = 4;
    this.maxTileSize = 20;

    this.setupEventListeners();
    this.generateNewMap();
    this.render();
  }

  /**
   * Setup all event listeners
   */
  setupEventListeners() {
    document.addEventListener('keydown', (e) => this.handleKeyDown(e));

    const generateBtn = document.getElementById('generate-btn');
    const randomBtn = document.getElementById('random-btn');
    const seedInput = document.getElementById('seed-input');
    const mapContainer = document.getElementById('map');
    const sizeSelect = document.getElementById('size-select');
    const sizeBtn = document.getElementById('size-btn');
    const customSizeInput = document.getElementById('custom-size-input');

    generateBtn.addEventListener('click', () => this.generateFromSeed());
    randomBtn.addEventListener('click', () => this.generateRandomMap());
    seedInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.generateFromSeed();
      }
    });

    // Size selection handling
    sizeSelect.addEventListener('change', (e) => {
      if (e.target.value === 'custom') {
        customSizeInput.style.display = 'inline-block';
        customSizeInput.focus();
      } else {
        customSizeInput.style.display = 'none';
      }
    });

    sizeBtn.addEventListener('click', () => this.handleSizeChange());
    customSizeInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.handleSizeChange();
      }
    });

    // Scroll zoom functionality
    mapContainer.addEventListener('wheel', (e) => this.handleScroll(e));
  }

  /**
   * Handle map size change
   */
  handleSizeChange() {
    const sizeSelect = document.getElementById('size-select');
    const customSizeInput = document.getElementById('custom-size-input');
    let newSize;

    if (sizeSelect.value === 'custom') {
      const customValue = parseInt(customSizeInput.value, 10);
      if (isNaN(customValue) || customValue < 50 || customValue > 500) {
        alert('Please enter a valid size between 50 and 500');
        return;
      }
      newSize = customValue;
    } else {
      newSize = parseInt(sizeSelect.value, 10);
    }

    // Update map dimensions
    this.mapWidth = newSize;
    this.mapHeight = newSize;

    // Center player on new map
    this.playerX = Math.floor(newSize / 2);
    this.playerY = Math.floor(newSize / 2);

    // Reset zoom level for new map size
    this.tileSize = Math.max(4, Math.min(8, 1000 / newSize));

    // Generate new map
    this.generateNewMap();
    this.render();
  }

  /**
   * Generate map from current seed
   */
  generateNewMap() {
    this.generator = new MapGenerator(this.mapWidth, this.mapHeight, this.seed);
    // Center player on map when generating new one
    this.playerX = 50;
    this.playerY = 50;
    this.updateUI();
  }

  /**
   * Generate map from seed input
   */
  generateFromSeed() {
    const seedInput = document.getElementById('seed-input');
    const seedValue = seedInput.value.trim();

    if (seedValue === '') {
      alert('Please enter a seed value');
      return;
    }

    this.seed = parseInt(seedValue, 10);
    if (isNaN(this.seed)) {
      alert('Please enter a valid number');
      return;
    }

    this.generateNewMap();
    this.render();
  }

  /**
   * Generate map with random seed
   */
  generateRandomMap() {
    this.seed = Math.floor(Math.random() * 10000000);
    document.getElementById('seed-input').value = this.seed;
    this.generateNewMap();
    this.render();
  }

  /**
   * Handle scroll wheel for zoom
   */
  handleScroll(e) {
    e.preventDefault();

    const direction = e.deltaY > 0 ? 0.9 : 1.1; // Zoom out if scroll down, zoom in if scroll up
    this.tileSize *= direction;
    this.tileSize = Math.max(this.minTileSize, Math.min(this.maxTileSize, this.tileSize));

    this.updateUI();
    this.render();
  }

  /**
   * Handle keyboard input for player movement
   */
  handleKeyDown(e) {
    const key = e.key.toLowerCase();
    let moved = false;

    switch (key) {
      case 'arrowup':
      case 'w':
        if (this.playerY > 0) {
          this.playerY--;
          moved = true;
        }
        e.preventDefault();
        break;
      case 'arrowdown':
      case 's':
        if (this.playerY < this.mapHeight - 1) {
          this.playerY++;
          moved = true;
        }
        e.preventDefault();
        break;
      case 'arrowleft':
      case 'a':
        if (this.playerX > 0) {
          this.playerX--;
          moved = true;
        }
        e.preventDefault();
        break;
      case 'arrowright':
      case 'd':
        if (this.playerX < this.mapWidth - 1) {
          this.playerX++;
          moved = true;
        }
        e.preventDefault();
        break;
    }

    if (moved) {
      this.updateUI();
      this.render();
    }
  }

  /**
   * Update UI information
   */
  updateUI() {
    const currentBiome = this.generator.getBiomeAt(this.playerX, this.playerY);
    const value = this.generator.map[this.playerY][this.playerX];
    const zoomPercent = Math.round((this.tileSize / 8) * 100);

    document.getElementById('player-pos').textContent = `X: ${this.playerX}, Y: ${this.playerY}`;
    document.getElementById('current-biome').textContent =
      currentBiome.charAt(0).toUpperCase() + currentBiome.slice(1);
    document.getElementById('current-seed').textContent = this.seed;
    document.getElementById('noise-value').textContent = value.toFixed(3);
    document.getElementById('zoom-level').textContent = `${zoomPercent}%`;
  }

  /**
   * Render the map
   */
  render() {
    const mapContainer = document.getElementById('map');
    mapContainer.innerHTML = '';
    mapContainer.style.gridTemplateColumns = `repeat(${this.mapWidth}, ${this.tileSize}px)`;

    for (let y = 0; y < this.mapHeight; y++) {
      for (let x = 0; x < this.mapWidth; x++) {
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.style.width = `${this.tileSize}px`;
        tile.style.height = `${this.tileSize}px`;

        const biome = this.generator.getBiomeAt(x, y);
        tile.classList.add(biome);

        // Highlight player tile
        if (x === this.playerX && y === this.playerY) {
          tile.classList.add('player');
        }

        mapContainer.appendChild(tile);
      }
    }
  }
}

/**
 * Initialize game when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
  new MapGeneratorGame();
});
