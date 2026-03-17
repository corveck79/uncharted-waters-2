import React, { useRef, useEffect, useState } from 'react';

import Assets from '../assets';
import { WORLD_MAP_COLUMNS } from '../constants';
import state from '../state/state';
import { regularPorts } from '../data/portData';
import { discoveryData } from '../data/discoveryData';

const TILEMAP_W = WORLD_MAP_COLUMNS; // 2160
const TILEMAP_H = 1080;
const LAND_THRESHOLD = 50;

const DISPLAY_W = 760;
const DISPLAY_H = 480;

// Navigation instrument precision (error radius in world pixels, 0 = exact)
const NAV_ITEMS: Record<string, number> = {
  '21': 60,  // Quadrant  — imprecise
  '22': 18,  // Sextant   — good
  '23': 0,   // Theodolite — exact
};

function getBestNavItem(): { itemId: string; error: number } | null {
  const items = state.items ?? [];
  let best: { itemId: string; error: number } | null = null;
  for (const id of items) {
    if (id in NAV_ITEMS) {
      const error = NAV_ITEMS[id];
      if (!best || error < best.error) {
        best = { itemId: id, error };
      }
    }
  }
  return best;
}

// Deterministic jitter so marker doesn't jump on re-render
function jitter(seed: number, range: number): number {
  const s = Math.sin(seed * 127.1 + 311.7) * 43758.5;
  return (s - Math.floor(s) - 0.5) * 2 * range;
}

function worldToDisplay(wx: number, wy: number): { x: number; y: number } {
  return {
    x: (wx / TILEMAP_W) * DISPLAY_W,
    y: (wy / TILEMAP_H) * DISPLAY_H,
  };
}

function displayToZoomed(
  dx: number,
  dy: number,
  ox: number,
  oy: number,
  zoomFactor: number,
): { x: number; y: number } {
  return {
    x: (dx - ox) * zoomFactor,
    y: (dy - oy) * zoomFactor,
  };
}

export default function Chart({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoomed, setZoomed] = useState(false);
  const [zoomCenter, setZoomCenter] = useState({ x: 0.5, y: 0.5 });

  const navItem = getBestNavItem();
  const seed = state.timePassed ?? 0;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;

    // ── Build base overview ImageData ──────────────────────────────────────
    const tilemap = Assets.data('worldTilemap');
    const imageData = ctx.createImageData(DISPLAY_W, DISPLAY_H);
    const pixels = imageData.data;

    for (let py = 0; py < DISPLAY_H; py++) {
      for (let px = 0; px < DISPLAY_W; px++) {
        const tx = Math.min(TILEMAP_W - 1, Math.round((px / DISPLAY_W) * TILEMAP_W));
        const ty = Math.min(TILEMAP_H - 1, Math.round((py / DISPLAY_H) * TILEMAP_H));
        const tileIndex = tilemap[ty * TILEMAP_W + tx] || 0;
        const isLand = tileIndex >= LAND_THRESHOLD;
        const i = (py * DISPLAY_W + px) * 4;
        if (isLand) {
          pixels[i + 0] = 61;
          pixels[i + 1] = 90;
          pixels[i + 2] = 42;
          pixels[i + 3] = 255;
        } else {
          pixels[i + 0] = 13;
          pixels[i + 1] = 42;
          pixels[i + 2] = 61;
          pixels[i + 3] = 255;
        }
      }
    }

    // ── Zoom helpers ───────────────────────────────────────────────────────
    const zoomFactor = 3;
    const viewW = DISPLAY_W / zoomFactor;
    const viewH = DISPLAY_H / zoomFactor;
    const ox = zoomed
      ? Math.max(0, Math.min(DISPLAY_W - viewW, zoomCenter.x * DISPLAY_W - viewW / 2))
      : 0;
    const oy = zoomed
      ? Math.max(0, Math.min(DISPLAY_H - viewH, zoomCenter.y * DISPLAY_H - viewH / 2))
      : 0;

    // ── Put base map ───────────────────────────────────────────────────────
    if (zoomed) {
      const zoomedData = ctx.createImageData(DISPLAY_W, DISPLAY_H);
      const zp = zoomedData.data;
      for (let py = 0; py < DISPLAY_H; py++) {
        for (let px = 0; px < DISPLAY_W; px++) {
          const sx = Math.floor(ox + px / zoomFactor);
          const sy = Math.floor(oy + py / zoomFactor);
          const srcI = (Math.min(DISPLAY_H - 1, sy) * DISPLAY_W + Math.min(DISPLAY_W - 1, sx)) * 4;
          const dstI = (py * DISPLAY_W + px) * 4;
          zp[dstI + 0] = pixels[srcI + 0];
          zp[dstI + 1] = pixels[srcI + 1];
          zp[dstI + 2] = pixels[srcI + 2];
          zp[dstI + 3] = 255;
        }
      }
      ctx.putImageData(zoomedData, 0, 0);
    } else {
      ctx.putImageData(imageData, 0, 0);
    }

    // ── Helper: world coords → final canvas coords ─────────────────────────
    const toCanvas = (wx: number, wy: number) => {
      const d = worldToDisplay(wx, wy);
      if (zoomed) return displayToZoomed(d.x, d.y, ox, oy, zoomFactor);
      return d;
    };

    // ── Port dots ─────────────────────────────────────────────────────────
    regularPorts.forEach((port, i) => {
      const portId = String(i + 1);
      const { x, y } = toCanvas(port.position.x, port.position.y);

      // Only draw if in visible area
      if (x < -4 || x > DISPLAY_W + 4 || y < -4 || y > DISPLAY_H + 4) return;

      const isCurrentPort = state.portId === portId;

      ctx.fillStyle = isCurrentPort ? '#c9a84c' : 'rgba(180,200,255,0.7)';
      ctx.beginPath();
      ctx.arc(x, y, zoomed ? 3 : 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Port name — only in zoomed view
      if (zoomed) {
        ctx.font = '9px monospace';
        ctx.fillStyle = isCurrentPort ? '#c9a84c' : 'rgba(180,200,255,0.8)';
        ctx.fillText(port.name, x + 5, y + 3);
      }
    });

    // ── Discovered items markers ─────────────────────────────────────────
    const found = state.discoveries ?? [];
    found.forEach((id) => {
      const d = discoveryData[id];
      if (!d) return;
      const { x, y } = toCanvas(d.worldX, d.worldY);
      if (x < -4 || x > DISPLAY_W + 4 || y < -4 || y > DISPLAY_H + 4) return;

      ctx.strokeStyle = 'rgba(100,200,100,0.7)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x, y, zoomed ? 3 : 1.5, 0, Math.PI * 2);
      ctx.stroke();
    });

    // ── Guild quest target marker ─────────────────────────────────────────
    const gq = state.guildQuest;
    if (gq) {
      const qd = discoveryData[gq.discoveryId];
      const alreadyFound = found.includes(gq.discoveryId);
      if (qd && !alreadyFound) {
        const { x, y } = toCanvas(qd.worldX, qd.worldY);
        if (x >= -8 && x <= DISPLAY_W + 8 && y >= -8 && y <= DISPLAY_H + 8) {
          // Pulsing gold diamond
          const r = zoomed ? 6 : 3;
          ctx.strokeStyle = '#ffd700';
          ctx.lineWidth = zoomed ? 1.5 : 1;
          ctx.beginPath();
          ctx.moveTo(x, y - r);
          ctx.lineTo(x + r, y);
          ctx.lineTo(x, y + r);
          ctx.lineTo(x - r, y);
          ctx.closePath();
          ctx.stroke();

          if (zoomed) {
            ctx.font = '9px monospace';
            ctx.fillStyle = '#ffd700';
            ctx.fillText(qd.name, x + 8, y + 3);
          }
        }
      }
    }

    // ── Player position marker ────────────────────────────────────────────
    const playerPos = state.fleets['1']?.position;
    if (playerPos && navItem) {
      const jx = jitter(seed, navItem.error);
      const jy = jitter(seed + 1, navItem.error);
      const wx = playerPos.x + jx;
      const wy = playerPos.y + jy;
      const { x, y } = toCanvas(wx, wy);

      drawShipMarker(ctx, x, y, zoomed);

      // Uncertainty circle for imprecise instruments
      if (navItem.error > 0 && zoomed) {
        const errorPx = (navItem.error / TILEMAP_W) * DISPLAY_W * zoomFactor;
        ctx.strokeStyle = 'rgba(201,168,76,0.3)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.arc(x, y, errorPx, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  }, [zoomed, zoomCenter, navItem, seed]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const cx = (e.clientX - rect.left) / DISPLAY_W;
    const cy = (e.clientY - rect.top) / DISPLAY_H;
    setZoomCenter({ x: cx, y: cy });
    setZoomed((z) => !z);
  };

  const navLabel = navItem
    ? navItem.error === 0
      ? 'Theodolite (exact)'
      : navItem.error <= 18
        ? 'Sextant (precise)'
        : 'Quadrant (approximate)'
    : null;

  return (
    <div
      className="rounded select-none"
      style={{
        background: '#0a0a14',
        border: '2px solid rgba(201,168,76,0.4)',
        boxShadow: '0 0 60px rgba(0,0,0,0.8)',
      }}
    >
      <div
        className="px-5 py-2 flex items-center justify-between"
        style={{ borderBottom: '1px solid rgba(201,168,76,0.2)' }}
      >
        <div className="font-bold" style={{ color: '#c9a84c' }}>
          World Chart{' '}
          <span className="text-sm text-gray-500 font-normal">
            {zoomed ? '(click to zoom out)' : '(click to zoom in)'}
          </span>
        </div>
        <div className="flex items-center gap-4">
          {navLabel && (
            <span className="text-xs" style={{ color: '#8888aa' }}>
              {navLabel}
            </span>
          )}
          <button
            type="button"
            className="text-xs text-gray-500 hover:text-white px-2 py-0.5 rounded hover:bg-white/10"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={DISPLAY_W}
        height={DISPLAY_H}
        className="cursor-crosshair block"
        onClick={handleClick}
        style={{ imageRendering: 'pixelated' }}
      />

      <div
        className="px-4 py-2 flex gap-5 text-xs text-gray-600"
        style={{ borderTop: '1px solid rgba(201,168,76,0.1)' }}
      >
        {!navItem ? (
          <span className="text-amber-700">
            No navigation instrument — position unknown. Purchase a Quadrant, Sextant, or Theodolite.
          </span>
        ) : (
          <>
            <span>
              <span style={{ color: '#c9a84c' }}>&#9650;</span> Your position
            </span>
            <span>
              <span style={{ color: 'rgba(180,200,255,0.7)' }}>&#9679;</span> Port
            </span>
            <span>
              <span style={{ color: 'rgba(100,200,100,0.7)' }}>&#9675;</span> Discovery found
            </span>
            {state.guildQuest && (
              <span>
                <span style={{ color: '#ffd700' }}>&#9670;</span> Quest target
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function drawShipMarker(ctx: CanvasRenderingContext2D, x: number, y: number, zoomed: boolean) {
  const r = zoomed ? 5 : 3;
  ctx.fillStyle = '#c9a84c';
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.lineTo(x + r * 0.6, y + r * 0.7);
  ctx.lineTo(x - r * 0.6, y + r * 0.7);
  ctx.closePath();
  ctx.fill();
}
