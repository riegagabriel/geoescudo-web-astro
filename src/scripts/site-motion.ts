// Motion compartido del sitio: scroll-reveal con stagger, contadores numéricos,
// y el efecto "spotlight" en panel-card (borde que se ilumina bajo el cursor).
// Principios seguidos (emil-design-eng / apple-design): transition en propiedades
// específicas (nunca `all`), easing custom (nunca ease-in), respeta
// prefers-reduced-motion, y solo anima transform/opacity/filter (GPU-friendly).
import { animate } from "motion";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function setupReveal() {
  const groups = new Map<Element | null, Element[]>();
  document.querySelectorAll<HTMLElement>(".reveal").forEach((el) => {
    const group = el.closest("[data-reveal-group]") ?? el.parentElement;
    const list = groups.get(group) ?? [];
    list.push(el);
    groups.set(group, list);
  });

  groups.forEach((els) => {
    els.forEach((el, i) => {
      (el as HTMLElement).style.setProperty("--reveal-delay", `${Math.min(i * 60, 360)}ms`);
    });
  });

  if (reduceMotion) {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
}

function setupCountUp() {
  const els = document.querySelectorAll<HTMLElement>(".count-up[data-target]");
  if (!els.length) return;

  const formatters: Record<string, Intl.NumberFormat> = {};
  function fmt(locale: string, decimals: number) {
    const key = `${locale}:${decimals}`;
    if (!formatters[key]) {
      formatters[key] = new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
    }
    return formatters[key];
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target as HTMLElement;
        io.unobserve(el);
        const target = parseFloat(el.dataset.target || "0");
        const decimals = parseInt(el.dataset.decimals || "0", 10);
        const suffix = el.dataset.suffix || "";
        const locale = "es-PE";

        if (reduceMotion) {
          el.textContent = fmt(locale, decimals).format(target) + suffix;
          return;
        }

        animate(0, target, {
          duration: 1.1,
          easing: [0.23, 1, 0.32, 1],
          onUpdate: (latest: number) => {
            el.textContent = fmt(locale, decimals).format(latest) + suffix;
          },
        });
      });
    },
    { threshold: 0.4 }
  );
  els.forEach((el) => io.observe(el));
}

function setupSpotlight() {
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  document.querySelectorAll<HTMLElement>(".panel-card").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - rect.left}px`);
      card.style.setProperty("--my", `${e.clientY - rect.top}px`);
    });
  });
}

function setupPressFeedback() {
  document.querySelectorAll<HTMLElement>(".chip, .btn").forEach((el) => {
    el.addEventListener("pointerdown", () => el.classList.add("is-pressed"));
    const release = () => el.classList.remove("is-pressed");
    el.addEventListener("pointerup", release);
    el.addEventListener("pointerleave", release);
  });
}

function init() {
  setupReveal();
  setupCountUp();
  setupSpotlight();
  setupPressFeedback();
}

// Script cargado como módulo: puede ejecutarse después de que DOMContentLoaded
// ya disparó (el evento no se repite), así que se corre de inmediato en ese caso.
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
