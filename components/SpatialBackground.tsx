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

interface Node {
  x: number;
  y: number;
  radius: number;
  scanRing: number;   // 0 = unlit, > 0 = ring expanding
  lit: number;        // 0–1 glow intensity
  kind: 'primary' | 'secondary' | 'micro';
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  radius: number;
  life: number;
  maxLife: number;
}

interface Connection {
  a: number;   // node index
  b: number;
  alpha: number;
}

interface RoomRect {
  x: number;
  y: number;
  w: number;
  h: number;
  doorSide: 'left' | 'right' | 'top' | 'bottom';
  doorPos: number;   // 0–1 along side
  windowSide: 'left' | 'right' | 'top' | 'bottom' | null;
  windowPos: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Variant configs
// ─────────────────────────────────────────────────────────────────────────────

interface VariantConfig {
  /** Overall canvas opacity multiplier */
  canvasOpacity: number;
  /** Brass accent (R,G,B) — matched to --rg-brass: #c99a4b */
  accentRgb: [number, number, number];
  /** Whether to show AI scan sweep */
  scanEnabled: boolean;
  /** Number of main floor-plan rooms drawn */
  roomCount: number;
  /** Whether to show network/data graph lines (admin mode) */
  networkMode: boolean;
  /** Show particles */
  particles: boolean;
  /** Geometric pattern intensity multiplier */
  geoIntensity: number;
  /** Atmosphere colour at top (rgba string) */
  atmoTop: string;
}

const VARIANT_CONFIGS: Record<SpatialVariant, VariantConfig> = {
  dashboard: {
    canvasOpacity: 0.58,
    accentRgb: [201, 154, 75],   // brass
    scanEnabled: true,
    roomCount: 6,
    networkMode: false,
    particles: true,
    geoIntensity: 1.0,
    atmoTop: 'rgba(201,154,75,0.045)',
  },
  new_inspection: {
    canvasOpacity: 0.62,
    accentRgb: [75, 156, 147],   // teal
    scanEnabled: true,
    roomCount: 5,
    networkMode: false,
    particles: false,
    geoIntensity: 1.2,
    atmoTop: 'rgba(75,156,147,0.05)',
  },
  history: {
    canvasOpacity: 0.42,
    accentRgb: [201, 154, 75],
    scanEnabled: false,
    roomCount: 4,
    networkMode: false,
    particles: false,
    geoIntensity: 0.7,
    atmoTop: 'rgba(201,154,75,0.03)',
  },
  deposit_report: {
    canvasOpacity: 0.44,
    accentRgb: [201, 154, 75],
    scanEnabled: false,
    roomCount: 4,
    networkMode: false,
    particles: false,
    geoIntensity: 0.75,
    atmoTop: 'rgba(201,154,75,0.03)',
  },
  listing: {
    canvasOpacity: 0.50,
    accentRgb: [220, 175, 100],  // warm gold
    scanEnabled: false,
    roomCount: 7,
    networkMode: false,
    particles: true,
    geoIntensity: 0.9,
    atmoTop: 'rgba(220,175,100,0.04)',
  },
  reviews: {
    canvasOpacity: 0.46,
    accentRgb: [160, 190, 140],  // warm-green tint
    scanEnabled: false,
    roomCount: 5,
    networkMode: false,
    particles: false,
    geoIntensity: 0.8,
    atmoTop: 'rgba(160,190,140,0.035)',
  },
  admin: {
    canvasOpacity: 0.52,
    accentRgb: [193, 85, 61],    // rust — risk/churn
    scanEnabled: true,
    roomCount: 3,
    networkMode: true,
    particles: true,
    geoIntensity: 0.65,
    atmoTop: 'rgba(193,85,61,0.04)',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Seeded deterministic pseudo-random (so geometry is stable across renders)
// ─────────────────────────────────────────────────────────────────────────────

function seededRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Scene builder
// ─────────────────────────────────────────────────────────────────────────────

function buildScene(
  W: number,
  H: number,
  variant: SpatialVariant,
  isMobile: boolean
): { rooms: RoomRect[]; nodes: Node[]; connections: Connection[] } {
  const rng = seededRand(variant.length * 31 + W);

  const cfg = VARIANT_CONFIGS[variant];
  const roomCount = isMobile ? Math.max(2, Math.floor(cfg.roomCount * 0.55)) : cfg.roomCount;

  // ── Room geometry ─────────────────────────────────────────────────────────
  // Build a loose floor-plan in the lower-centre of the viewport
  // The plan is offset downward and slightly left so it doesn't compete with content
  const planW = Math.min(W * 0.78, 820);
  const planH = Math.min(H * 0.55, 420);
  const planX = (W - planW) * 0.42;
  const planY = H * 0.38;

  const rooms: RoomRect[] = [];
  const sides = ['left', 'right', 'top', 'bottom'] as const;

  // Slice plan into rooms with a simple recursive bisect approach
  const queue: { x: number; y: number; w: number; h: number; depth: number }[] = [
    { x: planX, y: planY, w: planW, h: planH, depth: 0 },
  ];

  while (rooms.length < roomCount && queue.length > 0) {
    const cell = queue.shift()!;
    const minDim = 90;

    if (cell.depth >= 3 || (cell.w < minDim * 2 && cell.h < minDim * 2)) {
      rooms.push({
        x: cell.x,
        y: cell.y,
        w: cell.w,
        h: cell.h,
        doorSide: sides[Math.floor(rng() * 4)],
        doorPos: 0.3 + rng() * 0.4,
        windowSide: rng() > 0.4 ? sides[Math.floor(rng() * 4)] : null,
        windowPos: 0.25 + rng() * 0.5,
      });
      continue;
    }

    const splitH = cell.w > cell.h;
    if (splitH && cell.w >= minDim * 2) {
      const split = cell.w * (0.38 + rng() * 0.24);
      queue.push({ x: cell.x, y: cell.y, w: split, h: cell.h, depth: cell.depth + 1 });
      queue.push({ x: cell.x + split, y: cell.y, w: cell.w - split, h: cell.h, depth: cell.depth + 1 });
    } else if (!splitH && cell.h >= minDim * 2) {
      const split = cell.h * (0.38 + rng() * 0.24);
      queue.push({ x: cell.x, y: cell.y, w: cell.w, h: split, depth: cell.depth + 1 });
      queue.push({ x: cell.x, y: cell.y + split, w: cell.w, h: cell.h - split, depth: cell.depth + 1 });
    } else {
      rooms.push({
        x: cell.x,
        y: cell.y,
        w: cell.w,
        h: cell.h,
        doorSide: sides[Math.floor(rng() * 4)],
        doorPos: 0.3 + rng() * 0.4,
        windowSide: rng() > 0.4 ? sides[Math.floor(rng() * 4)] : null,
        windowPos: 0.25 + rng() * 0.5,
      });
    }
  }

  // ── Nodes ─────────────────────────────────────────────────────────────────
  const nodeCount = isMobile
    ? (cfg.networkMode ? 6 : 4)
    : (cfg.networkMode ? 16 : 8);

  const nodes: Node[] = [];

  // Place primary nodes at room corners/centres
  for (const room of rooms) {
    if (nodes.length >= nodeCount) break;
    nodes.push({
      x: room.x + room.w * 0.5 + (rng() - 0.5) * room.w * 0.3,
      y: room.y + room.h * 0.5 + (rng() - 0.5) * room.h * 0.3,
      radius: 2.5 + rng() * 2,
      scanRing: 0,
      lit: 0,
      kind: 'primary',
    });
  }

  // Extra scattered nodes for admin network / dashboard
  const extras = isMobile ? 2 : (cfg.networkMode ? 8 : 4);
  for (let i = 0; i < extras; i++) {
    nodes.push({
      x: planX + rng() * planW,
      y: planY + rng() * planH,
      radius: 1.5 + rng() * 1.5,
      scanRing: 0,
      lit: 0,
      kind: i < 2 ? 'secondary' : 'micro',
    });
  }

  // ── Connections ────────────────────────────────────────────────────────────
  const connections: Connection[] = [];
  const maxConn = isMobile ? 4 : (cfg.networkMode ? 18 : 8);
  const maxDist = cfg.networkMode ? 280 : 180;

  for (let i = 0; i < nodes.length && connections.length < maxConn; i++) {
    for (let j = i + 1; j < nodes.length && connections.length < maxConn; j++) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < maxDist && rng() > (cfg.networkMode ? 0.25 : 0.55)) {
        connections.push({ a: i, b: j, alpha: 0.12 + rng() * 0.1 });
      }
    }
  }

  return { rooms, nodes, connections };
}

// ─────────────────────────────────────────────────────────────────────────────
// Canvas renderer
// ─────────────────────────────────────────────────────────────────────────────

function drawFrame(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  dpr: number,
  t: number,               // elapsed seconds
  rooms: RoomRect[],
  nodes: Node[],
  connections: Connection[],
  particles: Particle[],
  variant: SpatialVariant,
  isMobile: boolean,
) {
  const cfg = VARIANT_CONFIGS[variant];
  const [ar, ag, ab] = cfg.accentRgb;

  ctx.clearRect(0, 0, W, H);

  // ── 0. Background atmosphere gradient ──────────────────────────────────────
  const grad = ctx.createRadialGradient(W * 0.5, H * 0.2, 0, W * 0.5, H * 0.2, W * 0.65);
  grad.addColorStop(0, cfg.atmoTop);
  grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // ── 1. Floor-plan geometry ─────────────────────────────────────────────────
  const geo = cfg.geoIntensity;

  for (const room of rooms) {
    // Room fill (very dark, barely visible)
    ctx.fillStyle = `rgba(20,23,26,${0.12 * geo})`;
    ctx.fillRect(room.x, room.y, room.w, room.h);

    // Room border
    ctx.strokeStyle = `rgba(${ar},${ag},${ab},${0.11 * geo})`;
    ctx.lineWidth = 0.8;
    ctx.strokeRect(room.x + 0.5, room.y + 0.5, room.w - 1, room.h - 1);

    // Interior measurement line (cross)
    ctx.strokeStyle = `rgba(${ar},${ag},${ab},${0.04 * geo})`;
    ctx.lineWidth = 0.5;
    ctx.setLineDash([3, 9]);
    ctx.beginPath();
    ctx.moveTo(room.x + room.w * 0.5, room.y + 4);
    ctx.lineTo(room.x + room.w * 0.5, room.y + room.h - 4);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(room.x + 4, room.y + room.h * 0.5);
    ctx.lineTo(room.x + room.w - 4, room.y + room.h * 0.5);
    ctx.stroke();
    ctx.setLineDash([]);

    // Door opening
    const doorLen = Math.min(room.w, room.h) * 0.18;
    ctx.strokeStyle = `rgba(${ar},${ag},${ab},${0.2 * geo})`;
    ctx.lineWidth = 1;
    switch (room.doorSide) {
      case 'bottom': {
        const dx = room.x + room.w * room.doorPos;
        ctx.clearRect(dx - doorLen / 2, room.y + room.h - 1, doorLen, 3);
        // Swing arc
        ctx.beginPath();
        ctx.arc(dx - doorLen / 2, room.y + room.h, doorLen, -Math.PI / 2, 0);
        ctx.stroke();
        break;
      }
      case 'right': {
        const dy = room.y + room.h * room.doorPos;
        ctx.clearRect(room.x + room.w - 1, dy - doorLen / 2, 3, doorLen);
        ctx.beginPath();
        ctx.arc(room.x + room.w, dy - doorLen / 2, doorLen, Math.PI / 2, Math.PI);
        ctx.stroke();
        break;
      }
      default: break;
    }

    // Window indication
    if (room.windowSide && !isMobile) {
      const winLen = Math.min(room.w, room.h) * 0.22;
      ctx.strokeStyle = `rgba(${ar},${ag},${ab},${0.28 * geo})`;
      ctx.lineWidth = 2;
      if (room.windowSide === 'top') {
        const wx = room.x + room.w * room.windowPos;
        ctx.beginPath();
        ctx.moveTo(wx - winLen / 2, room.y);
        ctx.lineTo(wx + winLen / 2, room.y);
        ctx.stroke();
      } else if (room.windowSide === 'left') {
        const wy = room.y + room.h * room.windowPos;
        ctx.beginPath();
        ctx.moveTo(room.x, wy - winLen / 2);
        ctx.lineTo(room.x, wy + winLen / 2);
        ctx.stroke();
      }
    }

    // Corner ticks (architectural survey marks)
    if (!isMobile) {
      ctx.strokeStyle = `rgba(${ar},${ag},${ab},${0.18 * geo})`;
      ctx.lineWidth = 0.8;
      const tick = 6;
      const corners = [
        [room.x, room.y], [room.x + room.w, room.y],
        [room.x, room.y + room.h], [room.x + room.w, room.y + room.h],
      ] as [number, number][];
      for (const [cx, cy] of corners) {
        const sx = cx === room.x ? 1 : -1;
        const sy = cy === room.y ? 1 : -1;
        ctx.beginPath();
        ctx.moveTo(cx + sx * tick, cy);
        ctx.lineTo(cx, cy);
        ctx.lineTo(cx, cy + sy * tick);
        ctx.stroke();
      }
    }
  }

  // ── 2. Connection lines ─────────────────────────────────────────────────────
  for (const conn of connections) {
    const na = nodes[conn.a];
    const nb = nodes[conn.b];
    if (!na || !nb) continue;
    const litFactor = (na.lit + nb.lit) * 0.5;
    const alpha = conn.alpha + litFactor * 0.15;
    ctx.strokeStyle = `rgba(${ar},${ag},${ab},${alpha})`;
    ctx.lineWidth = 0.5;
    ctx.setLineDash(cfg.networkMode ? [4, 8] : [2, 12]);
    ctx.beginPath();
    ctx.moveTo(na.x, na.y);
    ctx.lineTo(nb.x, nb.y);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // ── 3. Nodes ────────────────────────────────────────────────────────────────
  for (const node of nodes) {
    const baseAlpha = node.kind === 'primary' ? 0.55 : node.kind === 'secondary' ? 0.35 : 0.2;
    const glow = baseAlpha + node.lit * 0.45;

    // Core dot
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${ar},${ag},${ab},${glow})`;
    ctx.fill();

    // Outer ring (always present, subtle)
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.radius + 2, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${ar},${ag},${ab},${glow * 0.35})`;
    ctx.lineWidth = 0.6;
    ctx.stroke();

    // Expanding scan ring
    if (node.scanRing > 0) {
      const ringR = node.radius + node.scanRing * 18;
      const ringAlpha = Math.max(0, (1 - node.scanRing) * 0.45);
      ctx.beginPath();
      ctx.arc(node.x, node.y, ringR, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${ar},${ag},${ab},${ringAlpha})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }
  }

  // ── 4. AI scan sweep ───────────────────────────────────────────────────────
  if (cfg.scanEnabled) {
    const scanPeriod = variant === 'new_inspection' ? 10 : 15;
    const scanPhase = (t % scanPeriod) / scanPeriod;     // 0–1
    const scanX = -W * 0.1 + scanPhase * W * 1.2;

    // Scan line
    const scanGrad = ctx.createLinearGradient(scanX - 60, 0, scanX + 60, 0);
    scanGrad.addColorStop(0, 'transparent');
    scanGrad.addColorStop(0.4, `rgba(${ar},${ag},${ab},0.04)`);
    scanGrad.addColorStop(0.5, `rgba(${ar},${ag},${ab},0.10)`);
    scanGrad.addColorStop(0.6, `rgba(${ar},${ag},${ab},0.04)`);
    scanGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = scanGrad;
    ctx.fillRect(scanX - 60, 0, 120, H);

    // Activate nodes near scan
    for (const node of nodes) {
      const dist = Math.abs(node.x - scanX);
      if (dist < 40) {
        node.lit = Math.max(node.lit, 1 - dist / 40);
        node.scanRing = Math.max(0, node.scanRing + 0.04);
      }
    }
  }

  // ── 5. Particles ────────────────────────────────────────────────────────────
  if (cfg.particles && !isMobile) {
    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${ar},${ag},${ab},${p.alpha * (p.life / p.maxLife)})`;
      ctx.fill();
    }
  }

  // ── 6. Vignette mask ────────────────────────────────────────────────────────
  // Fade edges so geometry merges smoothly into page background
  const vign = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, W * 0.75);
  vign.addColorStop(0, 'transparent');
  vign.addColorStop(1, 'rgba(11,13,12,0.82)');
  ctx.fillStyle = vign;
  ctx.fillRect(0, 0, W, H);
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export function SpatialBackground({ variant }: { variant: SpatialVariant }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);
  const sceneRef = useRef<{
    rooms: RoomRect[];
    nodes: Node[];
    connections: Connection[];
  } | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const variantRef = useRef<SpatialVariant>(variant);
  const isMobileRef = useRef(false);

  // Update variant ref immediately when prop changes so the next RAF sees it
  variantRef.current = variant;

  // Particle tick helpers
  const spawnParticle = useCallback((W: number, H: number): Particle => {
    return {
      x: W * 0.2 + Math.random() * W * 0.6,
      y: H * 0.3 + Math.random() * H * 0.5,
      vx: (Math.random() - 0.5) * 0.12,
      vy: -0.05 - Math.random() * 0.08,
      alpha: 0.08 + Math.random() * 0.12,
      radius: 0.8 + Math.random() * 1.2,
      life: 0,
      maxLife: 200 + Math.random() * 200,
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Reduced-motion check
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const W = window.innerWidth;
      const H = window.innerHeight;
      isMobileRef.current = W <= 768;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Rebuild scene on resize
      sceneRef.current = buildScene(W, H, variantRef.current, isMobileRef.current);
    };

    resize();

    // Pre-populate particles
    const cfg = VARIANT_CONFIGS[variant];
    if (cfg.particles && !isMobileRef.current) {
      const W = window.innerWidth;
      const H = window.innerHeight;
      particlesRef.current = Array.from({ length: 28 }, () => {
        const p = spawnParticle(W, H);
        p.life = Math.random() * p.maxLife; // stagger starts
        return p;
      });
    }

    const ro = new ResizeObserver(() => {
      resize();
      sceneRef.current = buildScene(
        window.innerWidth,
        window.innerHeight,
        variantRef.current,
        isMobileRef.current,
      );
    });
    ro.observe(document.documentElement);

    // RAF loop
    const tick = (now: number) => {
      if (!startRef.current) startRef.current = now;
      const t = (now - startRef.current) / 1000;

      if (!sceneRef.current) {
        sceneRef.current = buildScene(
          window.innerWidth,
          window.innerHeight,
          variantRef.current,
          isMobileRef.current,
        );
      }

      const scene = sceneRef.current;
      const W = window.innerWidth;
      const H = window.innerHeight;
      const currentVariant = variantRef.current;
      const currentCfg = VARIANT_CONFIGS[currentVariant];

      // Rebuild scene if variant changed
      if (scene && (scene.rooms.length === 0 || Math.abs(scene.rooms[0]?.x - (W - Math.min(W * 0.78, 820)) * 0.42) > 20)) {
        sceneRef.current = buildScene(W, H, currentVariant, isMobileRef.current);
      }

      // Decay node lit/ring values
      for (const node of scene.nodes) {
        node.lit = Math.max(0, node.lit - 0.008);
        if (node.scanRing > 0) {
          node.scanRing = Math.min(1, node.scanRing + 0.018);
          if (node.scanRing >= 1) node.scanRing = 0;
        }
      }

      // Tick particles
      if (currentCfg.particles && !isMobileRef.current) {
        const particles = particlesRef.current;
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.life++;
          if (p.life > p.maxLife) {
            particles[i] = spawnParticle(W, H);
          }
        }
      }

      canvas.style.opacity = String(currentCfg.canvasOpacity);

      drawFrame(
        ctx, W, H, dpr, t,
        scene.rooms, scene.nodes, scene.connections,
        particlesRef.current,
        currentVariant, isMobileRef.current,
      );

      if (!prefersReduced) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    if (prefersReduced) {
      // Static single render for reduced-motion users
      sceneRef.current = buildScene(
        window.innerWidth,
        window.innerHeight,
        variant,
        isMobileRef.current,
      );
      const cfg2 = VARIANT_CONFIGS[variant];
      canvas.style.opacity = String(cfg2.canvasOpacity * 0.7);
      drawFrame(
        ctx,
        window.innerWidth, window.innerHeight, dpr, 0,
        sceneRef.current.rooms,
        sceneRef.current.nodes,
        sceneRef.current.connections,
        [],
        variant, isMobileRef.current,
      );
    } else {
      rafRef.current = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When variant changes, rebuild scene immediately
  useEffect(() => {
    sceneRef.current = buildScene(
      window.innerWidth,
      window.innerHeight,
      variant,
      isMobileRef.current,
    );
    // Reset particles for new variant
    const cfg = VARIANT_CONFIGS[variant];
    if (cfg.particles && !isMobileRef.current) {
      const W = window.innerWidth;
      const H = window.innerHeight;
      particlesRef.current = Array.from({ length: 28 }, () => {
        const p = spawnParticle(W, H);
        p.life = Math.random() * p.maxLife;
        return p;
      });
    } else {
      particlesRef.current = [];
    }
  }, [variant, spawnParticle]);

  return (
    <div
      className="rg-spatial-wrap"
      aria-hidden="true"
      data-variant={variant}
    >
      <canvas
        ref={canvasRef}
        className="rg-spatial-canvas"
      />
    </div>
  );
}
