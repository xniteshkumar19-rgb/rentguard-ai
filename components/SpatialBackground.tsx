'use client';

import { useEffect, useRef, useCallback } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type SpatialVariant =
  | 'dashboard'
  | 'new_inspection'
  | 'history'
  | 'deposit_report'
  | 'listing'
  | 'reviews'
  | 'admin';

interface RoomRect {
  x: number; y: number; w: number; h: number;
  doorSide: 'left' | 'right' | 'top' | 'bottom';
  doorPos: number;
  windowSide: 'left' | 'right' | 'top' | 'bottom' | null;
  windowPos: number;
  depth: number; // 0-1, perspective depth
}

interface InspectionNode {
  x: number; y: number;
  radius: number;
  scanRing: number;   // 0–1 expansion
  lit: number;        // 0–1 glow
  kind: 'primary' | 'secondary' | 'micro';
  depth: number;      // 0=far, 1=near
}

interface DataEdge {
  a: number; b: number;
  baseAlpha: number;
  pulse: number;      // 0–1 animated data pulse position
  pulseDir: number;   // +1 or -1
}

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  alpha: number; radius: number;
  life: number; maxLife: number;
  depth: number;
}

interface LightSource {
  x: number; y: number;
  radius: number;
  rgb: [number, number, number];
  intensity: number;
}

interface Scene {
  rooms: RoomRect[];
  nodes: InspectionNode[];
  edges: DataEdge[];
  lights: LightSource[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Variant configs
// ─────────────────────────────────────────────────────────────────────────────

interface VariantConfig {
  canvasOpacity: number;
  accentRgb: [number, number, number];
  scanEnabled: boolean;
  scanPeriod: number;         // seconds per sweep
  roomCount: number;
  networkMode: boolean;
  particles: boolean;
  geoIntensity: number;
  wallExtrude: number;        // wall height in px (2.5D effect)
  atmoTop: string;
  atmoBottom: string;
  lightCount: number;
}

const V: Record<SpatialVariant, VariantConfig> = {
  dashboard: {
    canvasOpacity: 0.62,
    accentRgb: [201, 154, 75],
    scanEnabled: true, scanPeriod: 14,
    roomCount: 7, networkMode: false, particles: true,
    geoIntensity: 1.0, wallExtrude: 8,
    atmoTop: 'rgba(201,154,75,0.055)', atmoBottom: 'rgba(75,156,147,0.02)',
    lightCount: 3,
  },
  new_inspection: {
    canvasOpacity: 0.68,
    accentRgb: [75, 156, 147],
    scanEnabled: true, scanPeriod: 9,
    roomCount: 5, networkMode: false, particles: false,
    geoIntensity: 1.3, wallExtrude: 10,
    atmoTop: 'rgba(75,156,147,0.06)', atmoBottom: 'rgba(75,156,147,0.01)',
    lightCount: 2,
  },
  history: {
    canvasOpacity: 0.44,
    accentRgb: [201, 154, 75],
    scanEnabled: false, scanPeriod: 20,
    roomCount: 5, networkMode: false, particles: false,
    geoIntensity: 0.72, wallExtrude: 6,
    atmoTop: 'rgba(201,154,75,0.03)', atmoBottom: 'transparent',
    lightCount: 1,
  },
  deposit_report: {
    canvasOpacity: 0.48,
    accentRgb: [201, 154, 75],
    scanEnabled: false, scanPeriod: 20,
    roomCount: 5, networkMode: false, particles: false,
    geoIntensity: 0.78, wallExtrude: 7,
    atmoTop: 'rgba(201,154,75,0.032)', atmoBottom: 'transparent',
    lightCount: 1,
  },
  listing: {
    canvasOpacity: 0.55,
    accentRgb: [218, 172, 96],
    scanEnabled: false, scanPeriod: 20,
    roomCount: 8, networkMode: false, particles: true,
    geoIntensity: 0.92, wallExtrude: 9,
    atmoTop: 'rgba(218,172,96,0.05)', atmoBottom: 'rgba(201,154,75,0.015)',
    lightCount: 3,
  },
  reviews: {
    canvasOpacity: 0.50,
    accentRgb: [152, 188, 138],
    scanEnabled: false, scanPeriod: 20,
    roomCount: 6, networkMode: false, particles: false,
    geoIntensity: 0.82, wallExtrude: 7,
    atmoTop: 'rgba(152,188,138,0.04)', atmoBottom: 'rgba(75,156,147,0.015)',
    lightCount: 2,
  },
  admin: {
    canvasOpacity: 0.58,
    accentRgb: [193, 85, 61],
    scanEnabled: true, scanPeriod: 11,
    roomCount: 3, networkMode: true, particles: true,
    geoIntensity: 0.68, wallExtrude: 5,
    atmoTop: 'rgba(193,85,61,0.045)', atmoBottom: 'rgba(193,85,61,0.01)',
    lightCount: 2,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Seeded pseudo-random (stable geometry across renders)
// ─────────────────────────────────────────────────────────────────────────────

function mkRand(seed: number) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

// ─────────────────────────────────────────────────────────────────────────────
// Scene builder
// ─────────────────────────────────────────────────────────────────────────────

function buildScene(W: number, H: number, variant: SpatialVariant, mobile: boolean): Scene {
  const cfg = V[variant];
  const rng = mkRand(variant.length * 37 + Math.round(W / 100) * 7);
  const roomCount = mobile ? Math.max(2, Math.floor(cfg.roomCount * 0.5)) : cfg.roomCount;

  // Floor plan occupies lower centre, angled to look like architectural view
  const planW = Math.min(W * 0.76, 840);
  const planH = Math.min(H * 0.52, 400);
  const planX = (W - planW) * 0.40;
  const planY = H * 0.34;

  const sides = ['left', 'right', 'top', 'bottom'] as const;

  // Build rooms via recursive bisection
  const rooms: RoomRect[] = [];
  const queue = [{ x: planX, y: planY, w: planW, h: planH, depth: 0 }];
  while (rooms.length < roomCount && queue.length > 0) {
    const cell = queue.shift()!;
    const min = 88;
    if (cell.depth >= 3 || (cell.w < min * 2 && cell.h < min * 2)) {
      const dy = (cell.y - planY) / planH; // 0=top=far, 1=bottom=near
      rooms.push({
        x: cell.x, y: cell.y, w: cell.w, h: cell.h,
        doorSide: sides[Math.floor(rng() * 4)],
        doorPos: 0.28 + rng() * 0.44,
        windowSide: rng() > 0.38 ? sides[Math.floor(rng() * 4)] : null,
        windowPos: 0.22 + rng() * 0.56,
        depth: 1 - dy, // near rooms at bottom of plan = depth 1
      });
      continue;
    }
    const h = cell.w > cell.h;
    if (h && cell.w >= min * 2) {
      const s = cell.w * (0.36 + rng() * 0.28);
      queue.push({ x: cell.x, y: cell.y, w: s, h: cell.h, depth: cell.depth + 1 });
      queue.push({ x: cell.x + s, y: cell.y, w: cell.w - s, h: cell.h, depth: cell.depth + 1 });
    } else if (!h && cell.h >= min * 2) {
      const s = cell.h * (0.36 + rng() * 0.28);
      queue.push({ x: cell.x, y: cell.y, w: cell.w, h: s, depth: cell.depth + 1 });
      queue.push({ x: cell.x, y: cell.y + s, w: cell.w, h: cell.h - s, depth: cell.depth + 1 });
    } else {
      const dy = (cell.y - planY) / planH;
      rooms.push({
        x: cell.x, y: cell.y, w: cell.w, h: cell.h,
        doorSide: sides[Math.floor(rng() * 4)],
        doorPos: 0.28 + rng() * 0.44,
        windowSide: null, windowPos: 0.5,
        depth: 1 - dy,
      });
    }
  }

  // Nodes
  const maxNodes = mobile ? 5 : (cfg.networkMode ? 18 : 10);
  const nodes: InspectionNode[] = [];
  for (const r of rooms) {
    if (nodes.length >= maxNodes) break;
    nodes.push({
      x: r.x + r.w * 0.5 + (rng() - 0.5) * r.w * 0.32,
      y: r.y + r.h * 0.5 + (rng() - 0.5) * r.h * 0.32,
      radius: 2.2 + rng() * 2.2, scanRing: 0, lit: 0,
      kind: 'primary', depth: r.depth,
    });
  }
  const extraCount = mobile ? 2 : (cfg.networkMode ? 10 : 4);
  for (let i = 0; i < extraCount; i++) {
    const dy = rng();
    nodes.push({
      x: planX + rng() * planW, y: planY + dy * planH,
      radius: 1.2 + rng() * 1.6, scanRing: 0, lit: 0,
      kind: i < 2 ? 'secondary' : 'micro', depth: 1 - dy,
    });
  }

  // Edges
  const edges: DataEdge[] = [];
  const maxEdge = mobile ? 4 : (cfg.networkMode ? 20 : 9);
  const maxDist = cfg.networkMode ? 300 : 190;
  for (let i = 0; i < nodes.length && edges.length < maxEdge; i++) {
    for (let j = i + 1; j < nodes.length && edges.length < maxEdge; j++) {
      const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
      if (Math.sqrt(dx * dx + dy * dy) < maxDist && rng() > (cfg.networkMode ? 0.22 : 0.52)) {
        edges.push({ a: i, b: j, baseAlpha: 0.10 + rng() * 0.08, pulse: rng(), pulseDir: rng() > 0.5 ? 1 : -1 });
      }
    }
  }

  // Lights
  const lights: LightSource[] = [];
  const [ar, ag, ab] = cfg.accentRgb;
  const lightPositions = [
    [W * 0.25, H * 0.22], [W * 0.72, H * 0.18], [W * 0.5, H * 0.55],
    [W * 0.15, H * 0.6], [W * 0.85, H * 0.5],
  ];
  for (let i = 0; i < Math.min(cfg.lightCount, lightPositions.length); i++) {
    lights.push({
      x: lightPositions[i][0], y: lightPositions[i][1],
      radius: W * 0.28 + rng() * W * 0.15,
      rgb: [ar, ag, ab],
      intensity: 0.032 + rng() * 0.018,
    });
  }

  return { rooms, nodes, edges, lights };
}

// ─────────────────────────────────────────────────────────────────────────────
// Isometric/perspective helpers
// ─────────────────────────────────────────────────────────────────────────────

// Slight vertical squeeze + skew to give a subtle top-down-angled feel
function toIso(x: number, y: number, W: number, H: number, px: number, py: number) {
  // px, py = parallax offset (-1 to +1 range)
  const cx = W / 2, cy = H / 2;
  const dx = (x - cx) * 0.98 + px * 6;
  const dy = (y - cy) * 0.88 + py * 4;
  return { x: cx + dx, y: cy + dy };
}

// ─────────────────────────────────────────────────────────────────────────────
// Drawing utilities
// ─────────────────────────────────────────────────────────────────────────────

function drawScene(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  t: number,
  scene: Scene,
  particles: Particle[],
  variant: SpatialVariant,
  mobile: boolean,
  px: number, py: number, // parallax -1..+1
) {
  const cfg = V[variant];
  const [ar, ag, ab] = cfg.accentRgb;
  const geo = cfg.geoIntensity;

  ctx.clearRect(0, 0, W, H);

  // ── 0. Deep atmospheric gradient ─────────────────────────────────────────
  // Far atmosphere (top)
  const atmoGrad = ctx.createLinearGradient(0, 0, 0, H);
  atmoGrad.addColorStop(0, cfg.atmoTop);
  atmoGrad.addColorStop(0.55, 'transparent');
  atmoGrad.addColorStop(1, cfg.atmoBottom);
  ctx.fillStyle = atmoGrad;
  ctx.fillRect(0, 0, W, H);

  // ── 1. Volumetric light sources ───────────────────────────────────────────
  for (const light of scene.lights) {
    const gx = ctx.createRadialGradient(light.x, light.y, 0, light.x, light.y, light.radius);
    gx.addColorStop(0, `rgba(${light.rgb[0]},${light.rgb[1]},${light.rgb[2]},${light.intensity})`);
    gx.addColorStop(0.45, `rgba(${light.rgb[0]},${light.rgb[1]},${light.rgb[2]},${light.intensity * 0.4})`);
    gx.addColorStop(1, 'transparent');
    ctx.fillStyle = gx;
    ctx.fillRect(0, 0, W, H);
  }

  // ── 2. Floor-plan geometry with 2.5D wall extrusion ─────────────────────
  const extrude = cfg.wallExtrude;
  // Sort rooms back-to-front by depth (far first)
  const sortedRooms = [...scene.rooms].sort((a, b) => a.depth - b.depth);

  for (const room of sortedRooms) {
    const { x: rx, y: ry } = toIso(room.x, room.y, W, H, px, py);
    const { x: rx2, y: ry2 } = toIso(room.x + room.w, room.y + room.h, W, H, px, py);
    const rw = rx2 - rx, rh = ry2 - ry;
    const depthFade = 0.4 + room.depth * 0.6;
    const wallAlpha = geo * depthFade;

    // Wall side face (west side, slightly darker for 3D effect)
    if (extrude > 0) {
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx, ry - extrude * room.depth);
      ctx.lineTo(rx, ry2 - extrude * room.depth);
      ctx.lineTo(rx, ry2);
      ctx.closePath();
      ctx.fillStyle = `rgba(${ar},${ag},${ab},${wallAlpha * 0.06})`;
      ctx.fill();

      // Wall top face
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx2, ry);
      ctx.lineTo(rx2, ry - extrude * room.depth);
      ctx.lineTo(rx, ry - extrude * room.depth);
      ctx.closePath();
      ctx.fillStyle = `rgba(${ar},${ag},${ab},${wallAlpha * 0.09})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(${ar},${ag},${ab},${wallAlpha * 0.16})`;
      ctx.lineWidth = 0.6;
      ctx.stroke();
    }

    // Floor fill
    ctx.fillStyle = `rgba(20,23,26,${0.14 * wallAlpha})`;
    ctx.fillRect(rx, ry, rw, rh);

    // Room border — thicker / brighter for near rooms
    ctx.strokeStyle = `rgba(${ar},${ag},${ab},${0.12 * wallAlpha})`;
    ctx.lineWidth = 0.6 + room.depth * 0.6;
    ctx.strokeRect(rx + 0.5, ry + 0.5, rw - 1, rh - 1);

    // Interior dashed cross-measurement
    ctx.strokeStyle = `rgba(${ar},${ag},${ab},${0.05 * wallAlpha})`;
    ctx.lineWidth = 0.5;
    ctx.setLineDash([2, 10]);
    ctx.beginPath();
    ctx.moveTo(rx + rw * 0.5, ry + 4);
    ctx.lineTo(rx + rw * 0.5, ry + rh - 4);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(rx + 4, ry + rh * 0.5);
    ctx.lineTo(rx + rw - 4, ry + rh * 0.5);
    ctx.stroke();
    ctx.setLineDash([]);

    // Corner survey ticks
    if (!mobile && room.depth > 0.3) {
      ctx.strokeStyle = `rgba(${ar},${ag},${ab},${0.22 * wallAlpha})`;
      ctx.lineWidth = 0.8;
      const tick = 7;
      const corners: [number, number, number, number][] = [
        [rx, ry, 1, 1], [rx + rw, ry, -1, 1],
        [rx, ry + rh, 1, -1], [rx + rw, ry + rh, -1, -1],
      ];
      for (const [cx2, cy2, sx, sy] of corners) {
        ctx.beginPath();
        ctx.moveTo(cx2 + sx * tick, cy2); ctx.lineTo(cx2, cy2); ctx.lineTo(cx2, cy2 + sy * tick);
        ctx.stroke();
      }
    }

    // Door opening
    if (room.depth > 0.2) {
      const doorLen = Math.min(rw, rh) * 0.18;
      ctx.strokeStyle = `rgba(${ar},${ag},${ab},${0.22 * wallAlpha})`;
      ctx.lineWidth = 1;
      if (room.doorSide === 'bottom') {
        const dx = rx + rw * room.doorPos;
        ctx.clearRect(dx - doorLen / 2, ry + rh - 1, doorLen, 3);
        ctx.beginPath();
        ctx.arc(dx - doorLen / 2, ry + rh, doorLen, -Math.PI / 2, 0);
        ctx.stroke();
      } else if (room.doorSide === 'right') {
        const dy = ry + rh * room.doorPos;
        ctx.clearRect(rx + rw - 1, dy - doorLen / 2, 3, doorLen);
        ctx.beginPath();
        ctx.arc(rx + rw, dy - doorLen / 2, doorLen, Math.PI / 2, Math.PI);
        ctx.stroke();
      }
    }

    // Window
    if (room.windowSide && !mobile && room.depth > 0.4) {
      const winLen = Math.min(rw, rh) * 0.22;
      ctx.strokeStyle = `rgba(${ar},${ag},${ab},${0.32 * wallAlpha})`;
      ctx.lineWidth = 2;
      if (room.windowSide === 'top') {
        const wx = rx + rw * room.windowPos;
        ctx.beginPath();
        ctx.moveTo(wx - winLen / 2, ry); ctx.lineTo(wx + winLen / 2, ry);
        ctx.stroke();
        // Window glass sheen
        ctx.strokeStyle = `rgba(${ar},${ag},${ab},${0.1 * wallAlpha})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(wx - winLen * 0.15, ry); ctx.lineTo(wx - winLen * 0.15, ry + 4);
        ctx.stroke();
      } else if (room.windowSide === 'left') {
        const wy = ry + rh * room.windowPos;
        ctx.beginPath();
        ctx.moveTo(rx, wy - winLen / 2); ctx.lineTo(rx, wy + winLen / 2);
        ctx.stroke();
      }
    }
  }

  // ── 3. Data edges ────────────────────────────────────────────────────────
  for (const edge of scene.edges) {
    const na = scene.nodes[edge.a], nb = scene.nodes[edge.b];
    if (!na || !nb) continue;
    const { x: ax, y: ay } = toIso(na.x, na.y, W, H, px, py);
    const { x: bx, y: by } = toIso(nb.x, nb.y, W, H, px, py);
    const litBoost = (na.lit + nb.lit) * 0.1;
    const alpha = edge.baseAlpha + litBoost;

    ctx.strokeStyle = `rgba(${ar},${ag},${ab},${alpha})`;
    ctx.lineWidth = 0.5;
    ctx.setLineDash(cfg.networkMode ? [4, 7] : [2, 14]);
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
    ctx.setLineDash([]);

    // Animated data pulse dot (admin / scan active)
    if (cfg.networkMode || cfg.scanEnabled) {
      const px2 = ax + (bx - ax) * edge.pulse;
      const py2 = ay + (by - ay) * edge.pulse;
      ctx.beginPath();
      ctx.arc(px2, py2, 1.8, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${ar},${ag},${ab},${alpha * 2.2})`;
      ctx.fill();
    }
  }

  // ── 4. Inspection nodes ──────────────────────────────────────────────────
  for (const node of scene.nodes) {
    const { x: nx, y: ny } = toIso(node.x, node.y, W, H, px, py);
    const depthFade = 0.3 + node.depth * 0.7;
    const baseAlpha = (node.kind === 'primary' ? 0.6 : node.kind === 'secondary' ? 0.38 : 0.22) * depthFade;
    const glow = baseAlpha + node.lit * 0.5;

    // Halo for lit nodes
    if (node.lit > 0.1) {
      const halo = ctx.createRadialGradient(nx, ny, 0, nx, ny, node.radius * 5 + node.lit * 8);
      halo.addColorStop(0, `rgba(${ar},${ag},${ab},${node.lit * 0.15})`);
      halo.addColorStop(1, 'transparent');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(nx, ny, node.radius * 5 + node.lit * 8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Core dot
    ctx.beginPath();
    ctx.arc(nx, ny, node.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${ar},${ag},${ab},${glow})`;
    ctx.fill();

    // Outer ring
    ctx.beginPath();
    ctx.arc(nx, ny, node.radius + 2.5, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${ar},${ag},${ab},${glow * 0.3})`;
    ctx.lineWidth = 0.7;
    ctx.stroke();

    // Expanding scan ring
    if (node.scanRing > 0) {
      const ringR = node.radius + node.scanRing * 22;
      const ringAlpha = Math.max(0, (1 - node.scanRing) * 0.5);
      ctx.beginPath();
      ctx.arc(nx, ny, ringR, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${ar},${ag},${ab},${ringAlpha})`;
      ctx.lineWidth = 0.9;
      ctx.stroke();
    }
  }

  // ── 5. AI scan sweep ─────────────────────────────────────────────────────
  if (cfg.scanEnabled) {
    const phase = (t % cfg.scanPeriod) / cfg.scanPeriod;
    // Diagonal scan: moves from top-left to bottom-right
    const scanX = -W * 0.15 + phase * W * 1.35;
    const scanY = -H * 0.1 + phase * H * 1.25;

    // Diagonal line gradient
    const angle = Math.atan2(1, 1); // 45°
    const len = Math.sqrt(W * W + H * H);
    const sx = W / 2 + Math.cos(angle + Math.PI / 2) * len;
    const sy = H / 2 + Math.sin(angle + Math.PI / 2) * len;
    const ex = W / 2 - Math.cos(angle + Math.PI / 2) * len;
    const ey = H / 2 - Math.sin(angle + Math.PI / 2) * len;

    const scanGrad = ctx.createLinearGradient(sx, sy, ex, ey);
    const p = phase;
    const w = 0.06; // scan width as fraction of gradient
    scanGrad.addColorStop(Math.max(0, p - w * 2), 'transparent');
    scanGrad.addColorStop(Math.max(0, p - w), `rgba(${ar},${ag},${ab},0.0)`);
    scanGrad.addColorStop(Math.max(0, p - w * 0.2), `rgba(${ar},${ag},${ab},0.07)`);
    scanGrad.addColorStop(p, `rgba(${ar},${ag},${ab},0.11)`);
    scanGrad.addColorStop(Math.min(1, p + w * 0.2), `rgba(${ar},${ag},${ab},0.07)`);
    scanGrad.addColorStop(Math.min(1, p + w), 'transparent');
    scanGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = scanGrad;
    ctx.fillRect(0, 0, W, H);

    // Activate nodes near scan line
    for (const node of scene.nodes) {
      const { x: nx, y: ny } = toIso(node.x, node.y, W, H, px, py);
      const distToScan = Math.abs((nx + ny - scanX - scanY) / Math.sqrt(2));
      if (distToScan < 50) {
        node.lit = Math.max(node.lit, 1 - distToScan / 50);
        node.scanRing = Math.max(0.001, node.scanRing > 0 ? node.scanRing : 0.001);
      }
    }
  }

  // ── 6. Depth-aware particles ──────────────────────────────────────────────
  if (cfg.particles && !mobile) {
    for (const p of particles) {
      const { x: ppx, y: ppy } = toIso(p.x, p.y, W, H, px, py);
      const depthScale = 0.4 + p.depth * 0.6;
      const lifeAlpha = p.life / p.maxLife;
      ctx.beginPath();
      ctx.arc(ppx, ppy, p.radius * depthScale, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${ar},${ag},${ab},${p.alpha * lifeAlpha * depthScale})`;
      ctx.fill();
    }
  }

  // ── 7. Peripheral vignette ────────────────────────────────────────────────
  const vign = ctx.createRadialGradient(W / 2, H / 2, H * 0.18, W / 2, H / 2, W * 0.78);
  vign.addColorStop(0, 'transparent');
  vign.addColorStop(1, 'rgba(11,13,12,0.88)');
  ctx.fillStyle = vign;
  ctx.fillRect(0, 0, W, H);
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function SpatialBackground({ variant }: { variant: SpatialVariant }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);
  const sceneRef = useRef<Scene | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const variantRef = useRef(variant);
  const mobileRef = useRef(false);
  const parallaxRef = useRef({ x: 0, y: 0 }); // current parallax offset
  const parallaxTargetRef = useRef({ x: 0, y: 0 });
  const pausedRef = useRef(false);

  variantRef.current = variant;

  const spawnParticle = useCallback((W: number, H: number): Particle => ({
    x: W * 0.18 + Math.random() * W * 0.64,
    y: H * 0.28 + Math.random() * H * 0.52,
    vx: (Math.random() - 0.5) * 0.10,
    vy: -0.04 - Math.random() * 0.07,
    alpha: 0.07 + Math.random() * 0.10,
    radius: 0.7 + Math.random() * 1.1,
    life: 0, maxLife: 220 + Math.random() * 220,
    depth: Math.random(),
  }), []);

  // Rebuild particles for a variant
  const rebuildParticles = useCallback((W: number, H: number, vari: SpatialVariant) => {
    if (V[vari].particles && !mobileRef.current) {
      particlesRef.current = Array.from({ length: 30 }, () => {
        const p = spawnParticle(W, H);
        p.life = Math.random() * p.maxLife;
        return p;
      });
    } else {
      particlesRef.current = [];
    }
  }, [spawnParticle]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const W = window.innerWidth, H = window.innerHeight;
      mobileRef.current = W <= 768;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sceneRef.current = buildScene(W, H, variantRef.current, mobileRef.current);
      rebuildParticles(W, H, variantRef.current);
    };

    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(document.documentElement);

    // Cursor parallax (desktop only)
    const onMouseMove = (e: MouseEvent) => {
      if (mobileRef.current || prefersReduced) return;
      parallaxTargetRef.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      };
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    // Visibility API: pause when tab is hidden
    const onVisibility = () => { pausedRef.current = document.hidden; };
    document.addEventListener('visibilitychange', onVisibility);

    const tick = (now: number) => {
      if (pausedRef.current) { rafRef.current = requestAnimationFrame(tick); return; }
      if (!startRef.current) startRef.current = now;
      const t = (now - startRef.current) / 1000;
      const W = window.innerWidth, H = window.innerHeight;

      if (!sceneRef.current) sceneRef.current = buildScene(W, H, variantRef.current, mobileRef.current);
      const scene = sceneRef.current;

      // Smooth parallax lerp
      const lx = parallaxTargetRef.current.x, ly = parallaxTargetRef.current.y;
      parallaxRef.current.x += (lx - parallaxRef.current.x) * 0.035;
      parallaxRef.current.y += (ly - parallaxRef.current.y) * 0.035;
      const { x: pxOff, y: pyOff } = parallaxRef.current;

      // Decay node states
      for (const node of scene.nodes) {
        node.lit = Math.max(0, node.lit - 0.006);
        if (node.scanRing > 0) {
          node.scanRing = Math.min(1, node.scanRing + 0.016);
          if (node.scanRing >= 1) node.scanRing = 0;
        }
      }

      // Advance edge pulses
      for (const edge of scene.edges) {
        edge.pulse += edge.pulseDir * 0.004;
        if (edge.pulse >= 1) { edge.pulse = 1; edge.pulseDir = -1; }
        if (edge.pulse <= 0) { edge.pulse = 0; edge.pulseDir = 1; }
      }

      // Tick particles
      const particles = particlesRef.current;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy; p.life++;
        if (p.life > p.maxLife) particles[i] = spawnParticle(W, H);
      }

      canvas.style.opacity = String(V[variantRef.current].canvasOpacity);
      drawScene(ctx, W, H, t, scene, particles, variantRef.current, mobileRef.current, pxOff, pyOff);

      rafRef.current = requestAnimationFrame(tick);
    };

    if (prefersReduced) {
      sceneRef.current = buildScene(window.innerWidth, window.innerHeight, variant, mobileRef.current);
      canvas.style.opacity = String(V[variant].canvasOpacity * 0.75);
      drawScene(ctx, window.innerWidth, window.innerHeight, 0, sceneRef.current, [], variant, mobileRef.current, 0, 0);
    } else {
      rafRef.current = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Variant change → rebuild scene + particles
  useEffect(() => {
    const W = window.innerWidth, H = window.innerHeight;
    sceneRef.current = buildScene(W, H, variant, mobileRef.current);
    rebuildParticles(W, H, variant);
  }, [variant, rebuildParticles]);

  return (
    <div className="rg-spatial-wrap" aria-hidden="true" data-variant={variant}>
      <canvas ref={canvasRef} className="rg-spatial-canvas" />
    </div>
  );
}
