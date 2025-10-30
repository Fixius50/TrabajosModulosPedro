// Animación sencilla al hacer scroll
window.addEventListener("scroll", () => {
  const sections = document.querySelectorAll(".section");
  // Activa la animación cuando la sección está al 85% de la altura de la ventana
  const trigger = window.innerHeight * 0.85;

  sections.forEach(section => {
    const top = section.getBoundingClientRect().top;
    if (top < trigger) {
      section.classList.add("visible");
    }
  });
});

/*
  NOTA: Se ha omitido la lógica de los botones del mockup 
  ('.controls button', '.calendar-mockup .cell') 
  porque esos elementos no existen en el archivo index.html
  de la documentación y causarían errores en la consola.
*/