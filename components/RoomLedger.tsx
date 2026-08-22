'use client';

import { useState, useEffect } from 'react';
import { Plus, X, IndianRupee, Clock3 } from 'lucide-react';
import { formatINR, cn, tagId } from '@/lib/utils';

export interface Room {
  id: string;
  name: string;
  valuation: number;
  confidence: number; // 0-100
  anomalies: string[];
  inspectedAt: string;
}

const STARTER_ROOMS: Room[] = [
  { id: 'RM-7F2A1', name: 'Living Room', valuation: 8400, confidence: 94, anomalies: ['Scuff — west wall'], inspectedAt: '18 Apr 2026 · 10:42 IST' },
  { id: 'RM-4C89D', name: 'Modular Kitchen', valuation: 21500, confidence: 88, anomalies: ['Chipped counter', 'Cabinet hinge loose'], inspectedAt: '18 Apr 2026 · 10:48 IST' },
  { id: 'RM-9E110', name: 'Master Bedroom', valuation: 3200, confidence: 97, anomalies: [], inspectedAt: '18 Apr 2026 · 10:54 IST' },
];

const ROOM_PRESETS = ['Living Room', 'Modular Kitchen', 'Master Bedroom', 'Bathroom', 'Balcony', 'Study'];

export function RoomLedger() {
  const [rooms, setRooms] = useState<Room[]>(STARTER_ROOMS);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  function addRoom(name: string) {
    setRooms((r) => [
      ...r,
      {
        id: tagId('RM'),
        name,
        valuation: Math.round(1500 + Math.random() * 20000),
        confidence: Math.round(78 + Math.random() * 20),
        anomalies: Math.random() > 0.5 ? ['Pending review'] : [],
        inspectedAt: 'Pending evidence capture',
      },
    ]);
  }

  function removeRoom(id: string) {
    setRooms((r) => r.filter((room) => room.id !== id));
  }

  const total = rooms.reduce((sum, r) => sum + r.valuation, 0);

  return (
    <div className="w-full">
      <div className="flex items-end justify-between mb-4">
        <div>
          <span className="rg-mono text-[11px] px-2 py-1 border border-[var(--rg-brass-dim)] text-[var(--rg-brass)] bg-[var(--rg-brass-dim)]/20">
            EXHIBIT B
          </span>
          <h3 className="rg-display text-xl mt-2">Room-by-Room Valuation</h3>
        </div>
        <div className="text-right">
          <div className="rg-mono text-[11px] text-[var(--rg-ink-dim)]">TOTAL LIABILITY</div>
          <div className="rg-mono text-2xl text-[var(--rg-brass)] flex items-center gap-1 justify-end">
            {formatINR(total)}
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-6 mb-5">
        {rooms.map((room) => (
          <div
            key={room.id}
            className="rg-tag rg-lift bg-[var(--rg-surface)] border border-[var(--rg-line-strong)] hover:border-[var(--rg-brass-dim)] pl-6 pr-4 py-4 relative group"
          >
            <button
              onClick={() => removeRoom(room.id)}
              aria-label={`Remove ${room.name}`}
              className="absolute top-2 right-2 text-[var(--rg-ink-faint)] hover:text-[var(--rg-rust)] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <X size={14} />
            </button>

            <div className="rg-mono text-[10px] text-[var(--rg-ink-faint)] mb-1">{room.id}</div>
            <div className="rg-display text-base tracking-wide mb-2">{room.name}</div>
            <div className="flex items-center gap-1 rg-mono text-[9px] text-[var(--rg-ink-faint)] mb-3"><Clock3 size={10} /> {room.inspectedAt.toUpperCase()}</div>

            <div className="rg-mono text-xl text-[var(--rg-brass)] flex items-center gap-0.5 mb-2">
              <IndianRupee size={15} />
              {room.valuation.toLocaleString('en-IN')}
            </div>

            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 h-1 bg-[var(--rg-line)] overflow-hidden">
                <div
                  className="h-full bg-[var(--rg-teal)] rg-bar-fill"
                  style={{ width: mounted ? `${room.confidence}%` : '0%' }}
                />
              </div>
              <span className="rg-mono text-[10px] text-[var(--rg-ink-dim)]">{room.confidence}% AI CONF.</span>
            </div>

            {room.anomalies.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {room.anomalies.map((a, i) => (
                  <span
                    key={i}
                    className="rg-mono text-[9px] px-1.5 py-0.5 bg-[var(--rg-rust-dim)]/40 text-[var(--rg-rust)] border border-[var(--rg-rust-dim)]"
                  >
                    {a.toUpperCase()}
                  </span>
                ))}
              </div>
            ) : (
              <span className="rg-mono text-[9px] text-[var(--rg-teal)]">BASELINE PRESERVED · NO ANOMALIES</span>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {ROOM_PRESETS.filter((p) => !rooms.some((r) => r.name === p)).map((preset) => (
          <button
            key={preset}
            onClick={() => addRoom(preset)}
            className="flex items-center gap-1.5 rg-mono text-[11px] px-3 py-2 border border-[var(--rg-line-strong)] text-[var(--rg-ink-dim)] hover:border-[var(--rg-brass)] hover:text-[var(--rg-brass)] transition-colors cursor-pointer"
          >
            <Plus size={12} /> {preset.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}

export default RoomLedger;
