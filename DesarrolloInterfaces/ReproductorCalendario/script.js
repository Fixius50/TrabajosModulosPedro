// Animación sencilla al hacer scroll
window.addEventListener("scroll", () => {
  const sections = document.querySelectorAll(".section");
  const trigger = window.innerHeight * 0.85;

  sections.forEach(section => {
    const top = section.getBoundingClientRect().top;
    if (top < trigger) {
      section.classList.add("visible");
    }
  });
});

// Simulación básica de botones del mockup
document.querySelectorAll(".controls button").forEach(btn => {
  btn.addEventListener("click", () => {
    alert(`Botón ${btn.textContent.trim()} presionado (simulación).`);
  });
});

document.querySelectorAll(".calendar-mockup .cell").forEach(cell => {
  cell.addEventListener("click", () => {
    alert(`Día ${cell.textContent} seleccionado (simulación).`);
  });
});
