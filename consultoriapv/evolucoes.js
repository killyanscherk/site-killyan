(() => {
  const track = document.querySelector("#lista-evolucoes");
  const controls = document.querySelector(".result-controls");
  if (!track || !controls) return;

  const cards = [...track.querySelectorAll(".result-card")];
  const previous = controls.querySelector("[data-results-prev]");
  const next = controls.querySelector("[data-results-next]");
  const status = controls.querySelector(".result-status");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let pendingFrame = 0;

  function position() {
    const styles = getComputedStyle(track);
    const visible = Number(styles.getPropertyValue("--results-per-view"));
    const step = cards[0].getBoundingClientRect().width + parseFloat(styles.columnGap);
    const last = Math.max(0, cards.length - visible);
    const first = Math.max(0, Math.min(last, Math.round(track.scrollLeft / step)));
    return { visible, step, first, last };
  }

  function update() {
    const { visible, first, last } = position();
    controls.hidden = last === 0;
    previous.disabled = first === 0;
    next.disabled = first === last;
    const end = Math.min(first + visible, cards.length);
    const range = end === first + 1 ? String(end) : `${first + 1}–${end}`;
    const label = `${range} de ${cards.length}`;
    if (status.textContent !== label) status.textContent = label;
  }

  function move(direction) {
    const { visible, step, first, last } = position();
    const destination = Math.max(0, Math.min(last, first + direction * visible));
    track.scrollTo({ left: destination * step, behavior: reducedMotion.matches ? "auto" : "smooth" });
  }

  if (!cards.length) return;
  previous.addEventListener("click", () => move(-1));
  next.addEventListener("click", () => move(1));
  track.addEventListener("scroll", () => {
    if (pendingFrame) return;
    pendingFrame = requestAnimationFrame(() => {
      pendingFrame = 0;
      update();
    });
  }, { passive: true });
  window.addEventListener("resize", update);
  update();
})();
