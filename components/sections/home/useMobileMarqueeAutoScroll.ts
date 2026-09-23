"use client";

import { useEffect, useRef, type RefObject } from "react";

/**
 * Défilement automatique de la Galerie en MOBILE (≤920px), où l'animation
 * CSS du desktop est remplacée par un vrai conteneur défilant au doigt
 * (overflow-x: auto, cf. app/globals.css) — une animation `transform` ne
 * peut pas coexister avec le swipe natif. Ici, on fait donc avancer
 * `scrollLeft` à chaque frame, à la même vitesse que le desktop (une largeur
 * de groupe de cartes toutes les MARQUEE_LOOP_SECONDS), en boucle infinie sur
 * les copies dupliquées (.marquee-dup, visibles en mobile pour ça).
 *
 * Le swipe reste maître : tout contact (doigt, molette, défilement manuel)
 * suspend l'auto-défilement, qui reprend RESUME_DELAY_MS après. Également
 * suspendu : bouton pause, focus clavier dans la rangée, galerie hors écran.
 * Pendant l'auto-défilement seulement, l'aimantation (scroll-snap) est
 * coupée via data-autoscroll="on" — sinon elle ramènerait sans cesse la
 * rangée sur la carte la plus proche.
 */

/** Doit rester identique à la media query mobile de la Galerie (app/globals.css). */
export const MOBILE_AUTOSCROLL_QUERY =
  "(max-width: 920px) and (prefers-reduced-motion: no-preference)";
/** Doit rester identique à la durée de @keyframes marquee-scroll (app/globals.css). */
const MARQUEE_LOOP_SECONDS = 26;
/** Reprise de l'auto-défilement après la dernière interaction manuelle. */
const RESUME_DELAY_MS = 2500;
/** Écart (px) au-delà duquel un défilement est attribué à l'utilisateur, pas à nous. */
const MANUAL_SCROLL_TOLERANCE_PX = 2;
/** Plafond d'un pas de temps (onglet revenu au premier plan, frame lente). */
const MAX_FRAME_SECONDS = 0.1;

interface RowState {
  viewport: HTMLElement;
  reverse: boolean;
  groupWidth: number;
  position: number;
  lastWritten: number;
  holdUntil: number;
  pointerDown: boolean;
  focused: boolean;
}

function measureGroupWidth(viewport: HTMLElement): number {
  const track = viewport.querySelector<HTMLElement>(".marquee-track");
  if (!track) return 0;
  // Copie réelle = cartes enfants directes ; la première carte de la
  // première copie dupliquée marque le début du groupe suivant.
  const realCount = track.querySelectorAll(":scope > .card").length;
  const cards = track.querySelectorAll<HTMLElement>(".card");
  if (realCount === 0 || cards.length <= realCount) return 0;
  return cards[realCount].offsetLeft - cards[0].offsetLeft;
}

function wrap(position: number, groupWidth: number, reverse: boolean): number {
  const p = ((position % groupWidth) + groupWidth) % groupWidth;
  // Rangée inversée : on recule vers 0, donc on garde une marge d'un groupe devant.
  return reverse && p === 0 ? groupWidth : p;
}

function startAutoScroll(stack: HTMLElement, isPaused: () => boolean): () => void {
  const rows: RowState[] = [...stack.querySelectorAll<HTMLElement>(".marquee-viewport")].map(
    (viewport) => {
      const reverse = !!viewport.querySelector(".marquee-track.reverse");
      const groupWidth = measureGroupWidth(viewport);
      const position = reverse ? groupWidth : 0;
      viewport.scrollLeft = position;
      return {
        viewport,
        reverse,
        groupWidth,
        position,
        lastWritten: viewport.scrollLeft,
        holdUntil: 0,
        pointerDown: false,
        focused: false,
      };
    },
  );

  let visible = true;
  let frame = 0;
  let last = 0;
  const cleanups: (() => void)[] = [];

  for (const row of rows) {
    const v = row.viewport;
    const hold = () => {
      row.holdUntil = performance.now() + RESUME_DELAY_MS;
    };
    const onDown = () => {
      row.pointerDown = true;
    };
    const onUp = () => {
      row.pointerDown = false;
      hold();
    };
    const onScroll = () => {
      // Défilement qui ne vient pas de nous : on repart de là où la rangée a
      // été laissée. Le délai de reprise n'est prolongé que s'il vient d'une
      // interaction en cours (doigt posé, ou inertie juste après) — pas de
      // l'aimantation qui recale la rangée sur une carte à la mise en pause,
      // sinon « Lecture » resterait sans effet pendant RESUME_DELAY_MS.
      if (Math.abs(v.scrollLeft - row.lastWritten) > MANUAL_SCROLL_TOLERANCE_PX) {
        row.position = v.scrollLeft;
        row.lastWritten = v.scrollLeft;
        if (row.pointerDown || performance.now() < row.holdUntil) hold();
      }
    };
    const onFocusIn = () => {
      row.focused = true;
    };
    const onFocusOut = () => {
      row.focused = false;
    };
    v.addEventListener("pointerdown", onDown, { passive: true });
    v.addEventListener("touchstart", onDown, { passive: true });
    v.addEventListener("pointerup", onUp, { passive: true });
    v.addEventListener("pointercancel", onUp, { passive: true });
    v.addEventListener("touchend", onUp, { passive: true });
    v.addEventListener("wheel", hold, { passive: true });
    v.addEventListener("scroll", onScroll, { passive: true });
    v.addEventListener("focusin", onFocusIn);
    v.addEventListener("focusout", onFocusOut);
    cleanups.push(() => {
      v.removeEventListener("pointerdown", onDown);
      v.removeEventListener("touchstart", onDown);
      v.removeEventListener("pointerup", onUp);
      v.removeEventListener("pointercancel", onUp);
      v.removeEventListener("touchend", onUp);
      v.removeEventListener("wheel", hold);
      v.removeEventListener("scroll", onScroll);
      v.removeEventListener("focusin", onFocusIn);
      v.removeEventListener("focusout", onFocusOut);
      delete v.dataset.autoscroll;
    });
  }

  // Largeur de groupe recalculée si la mise en page change (rotation, polices).
  const resizeObserver = new ResizeObserver(() => {
    for (const row of rows) {
      const width = measureGroupWidth(row.viewport);
      if (width > 0 && width !== row.groupWidth) {
        row.position = row.groupWidth > 0 ? (row.position / row.groupWidth) * width : 0;
        row.groupWidth = width;
      }
    }
  });
  rows.forEach((row) => resizeObserver.observe(row.viewport));

  // Rien ne tourne quand la galerie n'est pas à l'écran.
  const intersectionObserver = new IntersectionObserver((entries) => {
    visible = entries.some((e) => e.isIntersecting);
  });
  intersectionObserver.observe(stack);

  const tick = (now: number) => {
    const dt = last ? Math.min((now - last) / 1000, MAX_FRAME_SECONDS) : 0;
    last = now;
    for (const row of rows) {
      const active =
        visible &&
        !isPaused() &&
        !row.pointerDown &&
        !row.focused &&
        now >= row.holdUntil &&
        row.groupWidth > 0;
      row.viewport.dataset.autoscroll = active ? "on" : "off";
      if (!active) continue;
      const speed = row.groupWidth / MARQUEE_LOOP_SECONDS;
      row.position = wrap(
        row.position + (row.reverse ? -1 : 1) * speed * dt,
        row.groupWidth,
        row.reverse,
      );
      row.viewport.scrollLeft = row.position;
      row.lastWritten = row.viewport.scrollLeft;
    }
    frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(frame);
    resizeObserver.disconnect();
    intersectionObserver.disconnect();
    cleanups.forEach((fn) => fn());
  };
}

/** Active l'auto-défilement mobile sur le .marquee-stack référencé, tant que la media query correspond. */
export function useMobileMarqueeAutoScroll(
  stackRef: RefObject<HTMLElement | null>,
  paused: boolean,
) {
  const pausedRef = useRef(paused);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const stack = stackRef.current;
    if (!stack) return;
    const query = window.matchMedia(MOBILE_AUTOSCROLL_QUERY);
    let stop: (() => void) | null = null;
    const update = () => {
      stop?.();
      stop = query.matches ? startAutoScroll(stack, () => pausedRef.current) : null;
    };
    update();
    query.addEventListener("change", update);
    return () => {
      query.removeEventListener("change", update);
      stop?.();
    };
  }, [stackRef]);
}
