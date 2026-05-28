/**
 * Perlin Noise implementation with seed support
 * Generates coherent noise for procedural terrain generation
 */
class PerlinNoise {
  constructor(seed = 0) {
    this.seed = seed;
    this.permutation = this.buildPermutation(seed);
    // Duplicate the permutation table
    this.p = [...this.permutation, ...this.permutation];
  }

  /**
   * Build permutation table based on seed
   */
  buildPermutation(seed) {
    const p = [];
    for (let i = 0; i < 256; i++) {
      p[i] = i;
    }
    
    // Shuffle using seeded random (Fisher-Yates)
    const random = this.seededRandom(seed);
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [p[i], p[j]] = [p[j], p[i]];
    }
    
    return p;
  }

  /**
   * Seeded random number generator
   */
  seededRandom(seed) {
    return function() {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
  }

  /**
   * Fade function (smoothstep)
   */
  fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  /**
   * Linear interpolation
   */
  lerp(t, a, b) {
    return a + t * (b - a);
  }

  /**
   * Gradient function
   */
  grad(hash, x, y) {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 8 ? y : x;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  /**
   * 2D Perlin noise
   */
  noise(x, y) {
    const xi = Math.floor(x) & 255;
    const yi = Math.floor(y) & 255;

    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);

    const u = this.fade(xf);
    const v = this.fade(yf);

    const aa = this.p[this.p[xi] + yi];
    const ab = this.p[this.p[xi] + yi + 1];
    const ba = this.p[this.p[xi + 1] + yi];
    const bb = this.p[this.p[xi + 1] + yi + 1];

    const x1 = this.lerp(u, this.grad(aa, xf, yf), this.grad(ba, xf - 1, yf));
    const x2 = this.lerp(u, this.grad(ab, xf, yf - 1), this.grad(bb, xf - 1, yf - 1));
    const result = this.lerp(v, x1, x2);

    // Normalize to 0-1 range
    return (result + 1) / 2;
  }

  /**
   * Fractional Brownian Motion - multiple octaves of noise
   * Creates more natural terrain by layering noise
   */
  fbm(x, y, octaves = 4, persistence = 0.5, lacunarity = 2.0) {
    let value = 0;
    let amplitude = 1;
    let frequency = 1;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
      value += this.noise(x * frequency, y * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= lacunarity;
    }

    return value / maxValue;
  }
}
