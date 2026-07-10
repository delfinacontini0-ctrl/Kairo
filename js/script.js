/* ==========================================================
   KAIRO — script.js
   Rotación automática de la foto principal (hero)
   ========================================================== */

// 1) La lista de fotos que van a ir rotando, con el encuadre (object-position)
//    que le corresponde a cada una en mobile (donde la foto se recorta con
//    object-fit: cover). Para agregar, quitar o reencuadrar una foto, editá
//    solo este objeto.
const fotos = [
  { src: "img/principal1.png", posicion: "center" },
  { src: "img/principal2.png", posicion: "center" },
  { src: "img/principal3.png", posicion: "25% center" }
];

// 2) Cada cuánto cambia, en milisegundos (1000 = 1 segundo).
//    Probá también con 3000 o 4000: suele quedar más elegante.
const intervalo = 1000;

// 3) Buscamos la imagen del hero por su id (el que pusimos en el HTML)
const imagen = document.getElementById("foto-principal");

// 4) Un contador para saber qué foto toca mostrar
let actual = 0;

// 5) Aplica src + encuadre de la foto actual a la imagen del hero
function mostrarFoto(index) {
  imagen.src = fotos[index].src;
  imagen.style.objectPosition = fotos[index].posicion;
}

// 6) Rotación solo si la imagen existe en la página (evita errores en páginas sin hero)
if (imagen) {
  mostrarFoto(actual);
  setInterval(function () {
    actual = (actual + 1) % fotos.length;
    mostrarFoto(actual);
  }, intervalo);
}

/* ==========================================================
   Aparición sutil al hacer scroll
   - Añade la clase `reveal` y activa `visible` cuando entran al viewport
   - Respeta prefers-reduced-motion
   ========================================================== */
document.addEventListener('DOMContentLoaded', function () {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const targets = Array.from(document.querySelectorAll('.categoria, .personalizados'));

  // Clase inicial para que el CSS oculte antes de animar
  targets.forEach(el => el.classList.add('reveal'));

  if (prefersReduced) {
    // Mostrar todo sin animaciones si el usuario lo prefiere
    targets.forEach(el => el.classList.add('visible'));
  } else {
    // Observer que agrega/quita la clase visible según visibilidad
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        } else {
          entry.target.classList.remove('visible');
        }
      });
    }, { threshold: 0.12 });

    targets.forEach(el => observer.observe(el));
  }

  // Header/hero/intro (home): apagar su animation apenas termina (ver
  // .entrada-lista en estilos.css). No es solo prolijidad: mientras la
  // animation sigue activa, animation-fill-mode:both sostiene el
  // transform final para siempre, y el navegador lo reporta como una
  // matriz en vez del string "none" — eso vuelve al header containing
  // block de su .nav-header (position:fixed), rompiendo el overlay
  // mobile a pantalla completa.
  document.querySelectorAll('.header-entrada, .hero, .intro').forEach(el => {
    el.addEventListener('animationend', () => {
      el.classList.add('entrada-lista');
    }, { once: true });
  });

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
  };

  // Hacer que el logo del header haga scroll suave hasta arriba
  const logos = Array.from(document.querySelectorAll('.logo'));
  logos.forEach(logoEl => {
    // Si el elemento ya tiene un onclick (ej: en collares.html navegando a index), no lo sobreescribimos
    if (logoEl.hasAttribute('onclick')) return;
    logoEl.style.cursor = 'pointer';
    logoEl.addEventListener('click', scrollToTop);
  });

  // Hacer que el logo del footer haga scroll suave hasta arriba
  const footerLogo = document.querySelector('.footer-logo');
  if (footerLogo) {
    footerLogo.addEventListener('click', scrollToTop);
    footerLogo.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        scrollToTop();
      }
    });
  }

  // Botón "volver arriba"
  const backBtn = document.getElementById('back-to-top');
  if (backBtn) {
    const checkScroll = () => {
      if (window.scrollY > window.innerHeight) {
        backBtn.classList.add('visible');
      } else {
        backBtn.classList.remove('visible');
      }
    };

    // Comportamiento al click: scroll to top (respeta prefers-reduced-motion)
    backBtn.addEventListener('click', scrollToTop);

    // Mostrar/ocultar según posición de scroll
    checkScroll();
    window.addEventListener('scroll', checkScroll, { passive: true });
  }

  /* ---------- Menú hamburguesa mobile ---------- */
  // El ícono es un <span> pintado con mask-image (background-color +
  // mask, ver .hamburger-icon en estilos.css) en vez de <img src>, para
  // poder colorearlo exacto (var(--tinta)/var(--crema)) según el estado
  // del header. Como ya no hay <img> con su propio ratio intrínseco,
  // hay que setear a mano el mask-image Y el aspect-ratio de cada svg
  // (hamburguesa.svg es 36/21, cruz.svg es 28/26).
  function setHamburgerIcon(icon, open) {
    const url = open ? "url('svg/cruz.svg')" : "url('svg/hamburguesa.svg')";
    icon.style.maskImage = url;
    icon.style.webkitMaskImage = url;
    icon.style.aspectRatio = open ? '28 / 26' : '36 / 21';
  }

  const menuButtons = Array.from(document.querySelectorAll('.btn-menu'));
  menuButtons.forEach(btn => {
    const header = btn.closest('.header');
    const links = header ? Array.from(header.querySelectorAll('.nav-header a')) : [];
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      const willOpen = !expanded;
      btn.setAttribute('aria-expanded', String(willOpen));
      btn.setAttribute('aria-label', willOpen ? 'Cerrar menú' : 'Abrir menú');
      btn.classList.toggle('open', willOpen);
      if (header) header.classList.toggle('nav-open', willOpen);
      // bloquear scroll del body cuando el menú esté abierto
      document.body.style.overflow = willOpen ? 'hidden' : '';

      const icon = btn.querySelector('.hamburger-icon');
      if (icon) setHamburgerIcon(icon, willOpen);
    });
    // Cerrar al tocar un link
    links.forEach(link => link.addEventListener('click', () => {
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-label', 'Abrir menú');
      btn.classList.remove('open');
      if (header) header.classList.remove('nav-open');
      document.body.style.overflow = '';

      const icon = btn.querySelector('.hamburger-icon');
      if (icon) setHamburgerIcon(icon, false);
    }));
  });

  // Galería de catálogo (collares.html, aros.html, y las que sigan):
  // se auto-inicializa solo si la página tiene el contenedor.
  initGaleriaCatalogo();

  // Header transparente sobre el hero: solo corre si la página tiene
  // hero (hoy, solo el home).
  initHeaderHero();

  // Cursor personalizado (círculo verde/crema según la zona).
  initCursor();
});

/* ==========================================================
   Cursor personalizado
   - Círculo fijo que sigue al mouse, oscuro (var(--tinta)) por defecto.
   - Sobre las zonas ya tratadas como "fondo oscuro" en el resto del
     sitio (hero, bandas de categorías, bloque salvia de
     personalizados) pasa a claro (var(--crema)) para seguir
     contrastando. Mismos selectores que ya usan texto claro por el
     motivo inverso — no una lista nueva a mantener por separado.
   - Más grande sobre cualquier cosa clickeable (links, botones, el
     logo, el botón de volver arriba), para diferenciarlo de las
     zonas puramente decorativas.
   - Solo corre en dispositivos con mouse (ver también el
     @media (hover:hover) en estilos.css, que es lo que realmente
     oculta el cursor nativo y muestra el punto).
   ========================================================== */
function initCursor() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const ZONA_CLARA = '.hero, .categoria, .personalizados-texto';
  // .logo cubre tanto el <h1> de texto como el <span class="logo logo-mark">
  // del ícono mobile, así que no hace falta listar los dos por separado.
  const CLICKEABLE = 'a, button, .footer-logo, .logo';

  const dot = document.createElement('div');
  dot.className = 'cursor-dot';
  dot.setAttribute('aria-hidden', 'true');
  document.body.appendChild(dot);

  window.addEventListener('mousemove', (event) => {
    dot.classList.add('cursor-visible');
    dot.style.transform = `translate(${event.clientX}px, ${event.clientY}px) translate(-50%, -50%)`;

    const target = document.elementFromPoint(event.clientX, event.clientY);
    dot.classList.toggle('cursor-claro', !!(target && target.closest(ZONA_CLARA)));
    dot.classList.toggle('cursor-clickable', !!(target && target.closest(CLICKEABLE)));
  }, { passive: true });
}

/* ==========================================================
   Header transparente sobre el hero (solo home)
   - Arranca transparente/claro mientras el hero está a la vista.
   - Pasa a sólido/oscuro (.header-solido) apenas el hero deja de
     intersecar el viewport, sin ningún valor de scroll hardcodeado:
     el umbral lo define la altura real del hero.
   ========================================================== */
function initHeaderHero() {
  const heroEl = document.querySelector('.hero');
  const header = document.querySelector('.header');

  if (!heroEl || !header) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      header.classList.toggle('header-solido', !entry.isIntersecting);
    });
  }, { threshold: 0 });

  observer.observe(heroEl);
}

/* ==========================================================
   Galería de catálogo (collares.html, aros.html, ...)
   - Scroll horizontal con snap
   - Pieza destacada en el centro con scale y opacity
   - Contador dinámico
   - Link de WhatsApp dinámico
   - Click para centrar una pieza

   El producto y su artículo ("el collar", "el aro") se leen de
   data-producto / data-articulo en el contenedor #galeria-collares
   de cada página — así esta lógica es la misma para todo el
   catálogo y solo cambia el HTML de cada página.
   ========================================================== */
function initGaleriaCatalogo() {
  const galeria = document.getElementById('galeria-collares');
  const contadorEl = document.getElementById('pieza-contador');
  const linkConsultar = document.getElementById('consultar-link');

  if (!galeria || !contadorEl || !linkConsultar) return;

  const producto = galeria.dataset.producto || 'collar';
  const articulo = galeria.dataset.articulo || 'el';

  const piezas = galeria.querySelectorAll('.galeria-pieza');
  // null (no "0") para que la primera evaluación en la carga inicial no se
  // salga por el early-return de abajo: la pieza 01 necesita que se le
  // aplique .highlighted, el contador y el link igual que a cualquier otra.
  let piezaActiva = null;

  // La animación de entrada (CSS, ver estilos.css) tiene que pasar una
  // sola vez al cargar. .highlighted se prende y apaga con cada scroll,
  // así que en cuanto cada foto termina de entrar la marcamos con esta
  // clase, que desactiva su animation — de ahí en más el resaltado
  // vuelve a moverse solo por la transition de siempre.
  piezas.forEach(pieza => {
    pieza.addEventListener('animationend', () => {
      pieza.classList.add('entrada-lista');
    }, { once: true });
  });

  function destacarPieza(index) {
    if (index === piezaActiva) return;

    // En la primera aplicación (carga inicial o vuelta con "atrás") no hay
    // pieza previa activa: seteamos todo de una, sin el fade del contador,
    // para que no haya parpadeo antes del primer frame.
    const esPrimeraAplicacion = piezaActiva === null;
    piezaActiva = index;
    piezas.forEach((pieza, i) => {
      pieza.classList.toggle('highlighted', i === index);
    });

    const numeroPieza = String(piezaActiva + 1).padStart(2, '0');
    if (esPrimeraAplicacion) {
      contadorEl.textContent = numeroPieza;
      contadorEl.style.opacity = '1';
    } else {
      contadorEl.style.opacity = '0.5';
      setTimeout(() => {
        contadorEl.textContent = numeroPieza;
        contadorEl.style.opacity = '1';
      }, 150);
    }

    const textoConsulta = `Hola! Quiero consultar por ${articulo} ${producto} ${numeroPieza}`;
    linkConsultar.href = `https://wa.me/5491144709947?text=${encodeURIComponent(textoConsulta)}`;
  }

  function actualizarPiezaDestacada() {
    const galeriaRect = galeria.getBoundingClientRect();
    const centroPantalla = galeriaRect.left + galeriaRect.width / 2;

    let menorDistancia = Infinity;
    let indexMasCercana = 0;

    piezas.forEach((pieza, index) => {
      const piezaRect = pieza.getBoundingClientRect();
      const centroPieza = piezaRect.left + piezaRect.width / 2;
      const distancia = Math.abs(centroPieza - centroPantalla);

      if (distancia < menorDistancia) {
        menorDistancia = distancia;
        indexMasCercana = index;
      }
    });

    destacarPieza(indexMasCercana);
  }

  galeria.addEventListener('scroll', actualizarPiezaDestacada, { passive: true });

  actualizarPiezaDestacada();

  // Al volver con el botón "atrás", el navegador puede restaurar el scroll
  // horizontal de la galería después de este init (bfcache) sin disparar
  // el evento 'scroll'. Re-evaluamos en 'pageshow' para que la pieza
  // destacada, el contador y el link queden consistentes con esa posición.
  window.addEventListener('pageshow', actualizarPiezaDestacada);
}
