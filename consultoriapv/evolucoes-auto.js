(() => {
  const track = document.querySelector("#lista-evolucoes");
  const toggle = document.querySelector(".result-autoplay");
  if (!track || !toggle || !("IntersectionObserver" in window)) return;

  const cards = [...track.querySelectorAll(".result-card")];
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const delay = 4800;
  let playing = !motion.matches;
  let visible = false;
  let timer;
  let hovering = false;
  let touching = false;
  let direction = 1;

  function schedule() {
    clearTimeout(timer);
    if (!playing || !visible || document.hidden || hovering || touching || track.matches(":focus-visible")) return;
    timer = setTimeout(advance, delay);
  }

  function advance() {
    const current = track.scrollLeft;
    const end = track.scrollWidth - track.clientWidth;
    if (end <= 1) return;

    if (current >= end - 2) direction = -1;
    if (current <= 2) direction = 1;

    const origin = cards[0].offsetLeft;
    const stops = cards.map(card => Math.min(end, card.offsetLeft - origin));
    const next = direction === 1
      ? stops.find(stop => stop > current + 2)
      : stops.reverse().find(stop => stop < current - 2);

    if (next !== undefined) {
      track.scrollTo({ left: next, behavior: motion.matches ? "instant" : "smooth" });
    }
    schedule();
  }

  function setPlaying(value) {
    playing = value;
    toggle.textContent = playing ? "Pausar animação" : "Reproduzir animação";
    schedule();
  }

  toggle.hidden = false;
  setPlaying(playing);
  toggle.addEventListener("click", () => setPlaying(!playing));
  motion.addEventListener("change", () => setPlaying(!motion.matches));
  for (const event of ["focusin", "focusout", "wheel", "scroll"]) {
    track.addEventListener(event, schedule, { passive: true });
  }
  track.addEventListener("pointerenter", event => {
    if (event.pointerType === "mouse") {
      hovering = true;
      schedule();
    }
  });
  track.addEventListener("pointerleave", () => {
    hovering = false;
    schedule();
  });
  track.addEventListener("pointerdown", () => {
    touching = true;
    schedule();
  });
  for (const event of ["pointerup", "pointercancel"]) {
    window.addEventListener(event, () => {
      if (!touching) return;
      touching = false;
      schedule();
    }, { passive: true });
  }
  document.addEventListener("visibilitychange", schedule);
  window.addEventListener("resize", schedule);

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    schedule();
  }, { threshold: 0.25 }).observe(track);
})();
