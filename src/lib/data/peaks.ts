/**
 * Deterministic, fake waveform peaks per chart.
 *
 * The demo has no audio files, so we synthesize believable-looking peaks from
 * the chart id. The same id always yields the same shape, so server and client
 * render identically (no hydration mismatch) — same approach as details.ts.
 *
 * Values are normalized to 0..1. The envelope (quiet intro → louder middle →
 * taper) makes it read like a song rather than white noise.
 */

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const cache = new Map<string, number[]>();

/** Returns `bars` peak amplitudes (0..1), deterministic for a given id. */
export function getPeaks(id: string, bars = 96): number[] {
  const key = `${id}:${bars}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const rand = mulberry32(hash(id));
  const peaks: number[] = new Array(bars);

  // A couple of seeded "beat" frequencies so the waveform has rhythmic pulses.
  const beat = 0.5 + rand() * 1.5;
  const phase = rand() * Math.PI * 2;

  for (let i = 0; i < bars; i++) {
    const t = i / (bars - 1);
    // Bell-ish envelope: gentle build, loud middle, taper at the end.
    const envelope = Math.sin(Math.PI * t) ** 0.6;
    // Rhythmic pulse + jitter for texture.
    const pulse = 0.55 + 0.45 * Math.abs(Math.sin(t * Math.PI * 2 * 6 * beat + phase));
    const jitter = 0.7 + rand() * 0.3;
    const v = envelope * pulse * jitter;
    peaks[i] = Math.min(1, Math.max(0.04, v));
  }

  cache.set(key, peaks);
  return peaks;
}
