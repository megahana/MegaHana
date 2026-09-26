/**
 * Géométrie des ronces / lianes décoratives (components/ui/Vine.tsx) —
 * même vocabulaire que le logo (lib/logo-geometry.ts) : formes pleines,
 * feuilles et pétales elliptiques au rapport largeur/longueur des pétales
 * du logo (≈0,5), teintes --sakura / --gold. Aucun trait `stroke`.
 *
 * Repère : point d'attache en (0, 0), élément pendant vers +y, 1 unité =
 * 1 px à l'écran. Le viewBox renvoyé est la boîte englobante réelle ; le
 * composant place le SVG pour que (0, 0) tombe sur le point d'attache.
 *
 * Tracé central ("colonne") : intégration d'une courbure le long de la
 * longueur (abscisse curviligne uniforme par construction) — courbe douce
 * (tige), ondulation (ronce) ou courbure croissante qui s'enroule (vrille).
 *
 * Déterministe (aucun aléatoire) et coordonnées arrondies au centième :
 * rendu serveur et hydratation produisent les mêmes attributs, même si
 * Math.sin diffère d'un moteur JS à l'autre dans les dernières décimales.
 */

export type VineVariant = "stem" | "thorn" | "tendril" | "garland";
export type VineHue = "sakura" | "gold" | "mixed";
export type VineTone = "sakura" | "gold";

export interface VineOptions {
  /** Longueur du tracé (px). */
  length: number;
  /** Courbure, -1…1 (signe = côté vers lequel l'élément s'incurve). */
  bend: number;
  /** Nombre de feuilles (tige, vrille), d'épines (ronce) ou de pétales (guirlande). */
  count: number;
  hue: VineHue;
  /** Part de la longueur sur laquelle l'élément passe de transparent à plein (0…1). */
  fade: number;
}

export interface VineEllipse {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  /** Rotation (degrés) autour de (cx, cy). */
  rotate: number;
  tone: VineTone;
  /** Opacité propre (guirlande : fondu élément par élément ; sinon 1 ou fondu T3). */
  opacity: number;
  /** Point d'attache de l'ellipse sur le tracé (pivot d'un éventuel frémissement). */
  pivotX: number;
  pivotY: number;
}

export interface VinePath {
  d: string;
  tone: VineTone;
  opacity: number;
}

export interface VineShape {
  variant: VineVariant;
  /** Boîte englobante, repère du point d'attache. */
  minX: number;
  minY: number;
  width: number;
  height: number;
  /** Tige pleine (tige, vrille) — fondu par masque (T1 / T2). */
  stem: VinePath | null;
  /**
   * Ronce (T3) : la tige redessinée en couches superposées qui commencent de
   * plus en plus loin de la racine ; l'opacité cumulée croît le long du
   * tracé, quelle que soit sa courbure.
   */
  stemLayers: VinePath[];
  thorns: VinePath[];
  ellipses: VineEllipse[];
  /** Distance maximale au point d'attache (rayon du fondu radial T2). */
  reach: number;
}

const SAMPLES = 64;
/** Rapport largeur/longueur des pétales du logo (25/50, 19/36, 21/50…). */
const PETAL_RATIO = 0.5;

const r2 = (n: number) => Math.round(n * 100) / 100;
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
function smooth(edge0: number, edge1: number, x: number) {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

interface SpinePoint {
  x: number;
  y: number;
  /** Direction du tracé (radians) : 0 = vers le bas (+y), positif = vers +x. */
  angle: number;
  /** Position relative le long du tracé (0 = attache, 1 = extrémité). */
  u: number;
}

/** Tracé central par intégration de la courbure `curvature(u)` (radians par longueur totale). */
function buildSpine(length: number, curvature: (u: number) => number): SpinePoint[] {
  const points: SpinePoint[] = [{ x: 0, y: 0, angle: 0, u: 0 }];
  const ds = length / SAMPLES;
  let x = 0;
  let y = 0;
  let angle = 0;
  for (let i = 1; i <= SAMPLES; i++) {
    const uMid = (i - 0.5) / SAMPLES;
    const mid = angle + (curvature(uMid) / SAMPLES) * 0.5;
    x += Math.sin(mid) * ds;
    y += Math.cos(mid) * ds;
    angle += curvature(uMid) / SAMPLES;
    points.push({ x, y, angle, u: i / SAMPLES });
  }
  return points;
}

const direction = (angle: number) => ({ x: Math.sin(angle), y: Math.cos(angle) });
/** Normale "gauche" du tracé (côté +x quand il descend tout droit). */
const normal = (angle: number) => ({ x: Math.cos(angle), y: -Math.sin(angle) });
/** Rotation SVG qui aligne l'axe +y local d'une ellipse sur `angle`. */
const svgRotation = (angle: number) => r2((-angle * 180) / Math.PI);

function pointAt(spine: SpinePoint[], u: number): SpinePoint {
  return spine[Math.round(clamp01(u) * SAMPLES)];
}

/** Contour plein d'une tige d'épaisseur variable, de l'échantillon `from` à l'extrémité. */
function outline(spine: SpinePoint[], width: (u: number) => number, from = 0): string {
  const left: string[] = [];
  const right: string[] = [];
  for (let i = from; i < spine.length; i++) {
    const p = spine[i];
    const n = normal(p.angle);
    const half = width(p.u) / 2;
    left.push(`${r2(p.x + n.x * half)} ${r2(p.y + n.y * half)}`);
    right.push(`${r2(p.x - n.x * half)} ${r2(p.y - n.y * half)}`);
  }
  // Extrémité arrondie : petit prolongement dans l'axe du tracé.
  const tip = spine[spine.length - 1];
  const d = direction(tip.angle);
  const tipLength = width(1) * 0.8;
  const cap = `${r2(tip.x + d.x * tipLength)} ${r2(tip.y + d.y * tipLength)}`;
  const rightEnd = right.pop();
  return `M${left.join(" L")} Q${cap} ${rightEnd} L${right.reverse().join(" L")} Z`;
}

function toneAt(hue: VineHue, index: number, base: VineTone = "sakura"): VineTone {
  if (hue !== "mixed") return hue;
  const other: VineTone = base === "sakura" ? "gold" : "sakura";
  return index % 2 === 0 ? base : other;
}

/** Opacité cumulée cible le long du tracé (fondu T3 et guirlande). */
function fadeCurve(u: number, fade: number) {
  return Math.pow(smooth(0, Math.max(0.05, fade), u), 1.1);
}

export function buildVine(variant: VineVariant, options: VineOptions): VineShape {
  const { length, hue } = options;
  const bend = Math.max(-1, Math.min(1, options.bend));
  const count = Math.max(0, Math.round(options.count));
  const fade = clamp01(options.fade);
  const side = bend < 0 ? -1 : 1;
  const stemTone: VineTone = hue === "sakura" ? "sakura" : "gold";

  let stem: VinePath | null = null;
  const stemLayers: VinePath[] = [];
  const thorns: VinePath[] = [];
  const ellipses: VineEllipse[] = [];

  let spine: SpinePoint[];

  if (variant === "tendril") {
    // Courbure croissante (∝ u²) : tige presque droite qui s'enroule en bout.
    const turn = (1.5 + Math.abs(bend)) * Math.PI;
    spine = buildSpine(length, (u) => side * turn * 3 * u * u);
  } else if (variant === "thorn") {
    // Ondulation douce en S.
    spine = buildSpine(length, (u) => bend * 2.2 * Math.sin(2 * Math.PI * u));
  } else {
    // Arc qui s'accentue vers l'extrémité (tige, guirlande).
    spine = buildSpine(length, (u) => bend * 1.4 * u);
  }

  const thickness = Math.max(1.6, length * 0.045);

  if (variant === "stem") {
    // T4 : tige très fine à la racine, pleine au milieu, effilée en bout.
    const width = (u: number) =>
      thickness * (0.2 + 0.8 * smooth(0, 0.4, u)) * (1 - 0.8 * smooth(0.72, 1, u));
    stem = { d: outline(spine, width), tone: stemTone, opacity: 1 };
    const first = 0.36;
    const last = 0.9;
    for (let i = 0; i < count; i++) {
      const u = count === 1 ? 0.7 : first + ((last - first) * i) / (count - 1);
      const p = pointAt(spine, u);
      const s = (i % 2 === 0 ? -1 : 1) * side;
      const angle = p.angle + (s * (42 * Math.PI)) / 180;
      const ry = length * 0.1 * (0.75 + 0.4 * u);
      const d = direction(angle);
      ellipses.push({
        cx: r2(p.x + d.x * ry),
        cy: r2(p.y + d.y * ry),
        rx: r2(ry * PETAL_RATIO),
        ry: r2(ry),
        rotate: svgRotation(angle),
        tone: toneAt(hue, i),
        opacity: 1,
        pivotX: r2(p.x),
        pivotY: r2(p.y),
      });
    }
  } else if (variant === "thorn") {
    const thin = Math.max(1.4, length * 0.028);
    const width = (u: number) =>
      thin * (0.3 + 0.7 * smooth(0, 0.3, u)) * (1 - 0.6 * smooth(0.85, 1, u));
    // T3 : K couches qui commencent de plus en plus loin ; opacité de chaque
    // couche calculée pour que l'opacité cumulée suive fadeCurve().
    const layers = 10;
    let previous = 0;
    for (let k = 0; k < layers; k++) {
      const start = (fade * k) / layers;
      const target = k === layers - 1 ? 1 : fadeCurve((fade * (k + 1)) / layers, fade);
      const alpha = previous >= 1 ? 0 : 1 - (1 - target) / (1 - previous);
      previous = target;
      stemLayers.push({
        d: outline(spine, width, Math.round(start * SAMPLES)),
        tone: stemTone,
        opacity: r2(alpha),
      });
    }
    // Épines : petits crochets arrondis posés sur le bord de la tige,
    // inclinés vers l'extrémité ; opacité = fondu cumulé à leur position.
    const height = Math.max(3, length * 0.075);
    const first = 0.28;
    const last = 0.88;
    for (let i = 0; i < count; i++) {
      const u = count === 1 ? 0.6 : first + ((last - first) * i) / (count - 1);
      const p = pointAt(spine, u);
      const s = i % 2 === 0 ? 1 : -1;
      const n = normal(p.angle);
      const t = direction(p.angle);
      const half = width(u) / 2;
      const base = { x: p.x + n.x * half * s, y: p.y + n.y * half * s };
      const axisAngle = p.angle + (s * (58 * Math.PI)) / 180;
      const axis = direction(axisAngle);
      const b = height * 0.42;
      const b1 = { x: base.x - t.x * b, y: base.y - t.y * b };
      const b2 = { x: base.x + t.x * b, y: base.y + t.y * b };
      const tip = { x: base.x + axis.x * height, y: base.y + axis.y * height };
      const c1 = { x: b1.x + axis.x * height * 0.7, y: b1.y + axis.y * height * 0.7 };
      const c2 = { x: b2.x + axis.x * height * 0.25, y: b2.y + axis.y * height * 0.25 };
      thorns.push({
        d: `M${r2(b1.x)} ${r2(b1.y)} Q${r2(c1.x)} ${r2(c1.y)} ${r2(tip.x)} ${r2(tip.y)} Q${r2(
          c2.x,
        )} ${r2(c2.y)} ${r2(b2.x)} ${r2(b2.y)} Z`,
        tone: "gold",
        opacity: r2(fadeCurve(u, fade)),
      });
    }
    // Bourgeon terminal : un pétale du logo en miniature.
    const end = spine[spine.length - 1];
    const ry = Math.max(3, length * 0.06);
    const d = direction(end.angle);
    ellipses.push({
      cx: r2(end.x + d.x * ry * 0.8),
      cy: r2(end.y + d.y * ry * 0.8),
      rx: r2(ry * PETAL_RATIO),
      ry: r2(ry),
      rotate: svgRotation(end.angle),
      tone: hue === "gold" ? "gold" : "sakura",
      opacity: 1,
      pivotX: r2(end.x),
      pivotY: r2(end.y),
    });
  } else if (variant === "tendril") {
    const width = (u: number) =>
      thickness * 0.85 * (0.25 + 0.75 * smooth(0, 0.3, u)) * (1 - 0.8 * smooth(0.4, 1, u));
    stem = { d: outline(spine, width), tone: stemTone, opacity: 1 };
    for (let i = 0; i < count; i++) {
      const u = count === 1 ? 0.52 : 0.42 + (0.2 * i) / (count - 1);
      const p = pointAt(spine, u);
      // Feuilles du côté extérieur de l'enroulement.
      const s = (i % 2 === 0 ? -1 : 1) * side;
      const angle = p.angle + (s * (48 * Math.PI)) / 180;
      const ry = length * 0.085;
      const d = direction(angle);
      ellipses.push({
        cx: r2(p.x + d.x * ry),
        cy: r2(p.y + d.y * ry),
        rx: r2(ry * PETAL_RATIO),
        ry: r2(ry),
        rotate: svgRotation(angle),
        tone: toneAt(hue, i),
        opacity: 1,
        pivotX: r2(p.x),
        pivotY: r2(p.y),
      });
    }
  } else {
    // Guirlande : pétales détachés, sans tige, opacité croissante un par un.
    const n = Math.max(2, count);
    const spacing = (length * 0.92) / (n - 1);
    for (let i = 0; i < n; i++) {
      const u = 0.04 + (0.92 * i) / (n - 1);
      const p = pointAt(spine, u);
      const tilt = ((i % 2 === 0 ? 1 : -1) * 12 * Math.PI) / 180;
      const angle = p.angle + tilt;
      const ry = spacing * 0.42 * (0.85 + 0.3 * u);
      const d = direction(angle);
      ellipses.push({
        cx: r2(p.x + d.x * ry),
        cy: r2(p.y + d.y * ry),
        rx: r2(ry * PETAL_RATIO),
        ry: r2(ry),
        rotate: svgRotation(angle),
        tone: toneAt(hue, i),
        opacity: r2(Math.max(0.12, fadeCurve(u, fade))),
        pivotX: r2(p.x),
        pivotY: r2(p.y),
      });
    }
  }

  // Boîte englobante : points du tracé ± épaisseur, ellipses (rayon max), épines.
  let minX = 0;
  let minY = 0;
  let maxX = 0;
  let maxY = 0;
  let reach = 0;
  const include = (x: number, y: number, pad: number) => {
    minX = Math.min(minX, x - pad);
    minY = Math.min(minY, y - pad);
    maxX = Math.max(maxX, x + pad);
    maxY = Math.max(maxY, y + pad);
    reach = Math.max(reach, Math.hypot(x, y) + pad);
  };
  if (variant !== "garland") for (const p of spine) include(p.x, p.y, thickness + 1);
  for (const e of ellipses) include(e.cx, e.cy, Math.max(e.rx, e.ry) + 1);
  for (const t of thorns) {
    const numbers = t.d.match(/-?\d+(\.\d+)?/g)?.map(Number) ?? [];
    for (let i = 0; i + 1 < numbers.length; i += 2) include(numbers[i], numbers[i + 1], 1);
  }
  minX = Math.floor(minX);
  minY = Math.floor(minY);

  return {
    variant,
    minX,
    minY,
    width: Math.ceil(maxX) - minX,
    height: Math.ceil(maxY) - minY,
    stem,
    stemLayers,
    thorns,
    ellipses,
    reach: r2(reach),
  };
}
