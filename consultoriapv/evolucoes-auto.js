(() => {
  const track = document.querySelector("#lista-evolucoes");
  const toggle = document.querySelector(".result-autoplay");
  if (!track || !toggle || !("IntersectionObserver" in window)) return;

  const cards = [...track.querySelectorAll(".result-card")];
  if (cards.length < 2) return;

  // Repeat the cards so the end of one lap and the start of the next share the same track.
  const copies = cards.map(card => {
    const copy = card.cloneNode(true);
    copy.removeAttribute("aria-labelledby");
    copy.setAttribute("aria-hidden", "true");
    copy.inert = true;
    for (const element of copy.querySelectorAll("[id]")) element.removeAttribute("id");
    return copy;
  });
  track.append(...copies);

  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const delay = 4800;
  let playing = !motion.matches;
  let visible = false;
  let timer;
  let hovering = false;
  let touching = false;
  let settleTimer;

  function schedule() {
    clearTimeout(timer);
    if (!playing || !visible || document.hidden || hovering || touching || track.matches(":focus-visible")) return;
    timer = setTimeout(advance, delay);
  }

  function lapWidth() {
    return copies[0].getBoundingClientRect().left - cards[0].getBoundingClientRect().left;
  }

  function wrap() {
    const width = lapWidth();
    if (width > 0 && track.scrollLeft >= width - 1) {
      track.scrollTo({ left: Math.max(0, track.scrollLeft - width), behavior: "instant" });
    }
  }

  function settle() {
    clearTimeout(settleTimer);
    if (!touching) settleTimer = setTimeout(wrap, 160);
  }

  function advance() {
    wrap();
    const current = track.scrollLeft;
    const origin = cards[0].getBoundingClientRect().left;
    const next = [...cards, copies[0]]
      .map(card => card.getBoundingClientRect().left - origin)
      .find(stop => stop > current + 2);

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
  for (const event of ["focusin", "focusout", "wheel"]) {
    track.addEventListener(event, schedule, { passive: true });
  }
  track.addEventListener("scroll", () => {
    settle();
    schedule();
  }, { passive: true });
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
    settle();
    schedule();
  });
  for (const event of ["pointerup", "pointercancel"]) {
    window.addEventListener(event, () => {
      if (!touching) return;
      touching = false;
      settle();
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
