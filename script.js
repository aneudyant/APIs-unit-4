const API_KEY = "9b96faac5008c088be90aaf58c28c472";

let noticias = [];        // noticias que se están mostrando
let paginaActual = 1;
const POR_PAGINA = 4;     // noticias por página

// Temas rápidos con enfoque dominicano
const CATEGORIAS = [
  { nombre: "⚾ Béisbol",    q: "béisbol dominicano LIDOM", etiqueta: "Béisbol" },
  { nombre: "🏛️ Política",   q: "política República Dominicana", etiqueta: "Política" },
  { nombre: "💻 Tecnología", q: "tecnología República Dominicana", etiqueta: "Tecnología" },
  { nombre: "🇩🇴 Nacionales", q: "noticias República Dominicana", etiqueta: "Nacionales" }
];


// ---------- 2. FECHA Y BOTONES DE TEMAS ----------
document.getElementById('fecha').textContent =
  new Date().toLocaleDateString('es-DO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

const contCategorias = document.getElementById('categorias');

CATEGORIAS.forEach(cat => {
  const b = document.createElement('button');
  b.className = "chip";
  b.textContent = cat.nombre;
  b.onclick = () => {
    document.getElementById('termino').value = cat.q;
    consultarApi(cat.q, cat.etiqueta);
  };
  contCategorias.appendChild(b);
});

// Botón para ver los ejemplos de demostración
const bEjemplos = document.createElement('button');
bEjemplos.className = "chip chip--ejemplos";
bEjemplos.textContent = "📌 Ver ejemplos dominicanos";
bEjemplos.onclick = mostrarEjemplos;
contCategorias.appendChild(bEjemplos);


// ---------- 3. LLAMADA A LA API ----------
// Se ejecuta al enviar el formulario
function buscar(event) {
  event.preventDefault();   // evita recargar la página
  consultarApi(document.getElementById('termino').value, "");
}

function consultarApi(termino, etiqueta) {
  const mensaje = document.getElementById('mensaje');
  mensaje.textContent = "Buscando noticias...";
  document.getElementById('resultados').innerHTML = "";
  document.getElementById('paginacion').style.display = "none";

  const url = "https://gnews.io/api/v4/search?q=" + encodeURIComponent(termino) +
              "&lang=es&max=10&apikey=" + API_KEY;

  fetch(url)
    .then(response => {
      // Códigos de estado HTTP (4xx = error del cliente, 5xx = del servidor)
      if (response.status === 401 || response.status === 403) {
        throw new Error("API key inválida o sin permiso (error " + response.status + ")");
      } else if (response.status === 429) {
        throw new Error("Se alcanzó el límite de consultas del día (error 429)");
      } else if (response.status >= 500) {
        throw new Error("Error del servidor (error " + response.status + ")");
      } else if (!response.ok) {
        throw new Error("Error " + response.status);
      }
      return response.json();   // convierte la respuesta JSON en objeto
    })
    .then(data => {
      noticias = data.articles.map(n => ({ ...n, etiqueta: etiqueta }));
      paginaActual = 1;

      if (noticias.length === 0) {
        mensaje.textContent = "No se encontraron noticias para: " + termino;
        return;
      }
      mensaje.textContent = "Resultados para: " + termino;
      mostrarNoticias();
    })
    .catch(error => {
      mensaje.textContent = "No se pudieron cargar las noticias. " + error.message +
                            " · Puedes usar «Ver ejemplos dominicanos».";
      console.error('Error:', error);
    });
}


// ---------- 4. MOSTRAR NOTICIAS EN PANTALLA ----------
function mostrarNoticias() {
  const contenedor = document.getElementById('resultados');
  contenedor.innerHTML = "";

  // slice() corta la lista: solo las noticias de la página actual
  const inicio = (paginaActual - 1) * POR_PAGINA;
  const pagina = noticias.slice(inicio, inicio + POR_PAGINA);

  pagina.forEach(noticia => {
    const art = document.createElement('article');
    art.className = "noticia";

    // Etiqueta de categoría (si existe)
    if (noticia.etiqueta) {
      const et = document.createElement('span');
      et.className = "etiqueta";
      et.textContent = noticia.etiqueta;
      art.appendChild(et);
    }

    // Titular con enlace
    const h3 = document.createElement('h3');
    const enlace = document.createElement('a');
    enlace.href = noticia.url;
    enlace.target = "_blank";
    enlace.rel = "noopener";
    enlace.textContent = noticia.title;
    h3.appendChild(enlace);

    // Descripción
    const desc = document.createElement('p');
    desc.textContent = noticia.description || "Sin descripción disponible.";

    // Fuente y fecha
    const meta = document.createElement('div');
    meta.className = "meta";
    const fuente = document.createElement('strong');
    fuente.textContent = noticia.source.name;
    meta.append("Fuente: ", fuente);
    if (noticia.publishedAt) {
      meta.append(" · " + new Date(noticia.publishedAt).toLocaleDateString('es-DO', { dateStyle: 'medium' }));
    }

    art.append(h3, desc, meta);
    contenedor.appendChild(art);
  });

  // Controles de paginación
  const total = Math.ceil(noticias.length / POR_PAGINA);
  document.getElementById('paginacion').style.display = total > 1 ? "flex" : "none";
  document.getElementById('infoPagina').textContent = "Página " + paginaActual + " de " + total;
  document.getElementById('btnAnterior').disabled = (paginaActual === 1);
  document.getElementById('btnSiguiente').disabled = (paginaActual === total);
}


// ---------- 5. PAGINACIÓN ----------
// -1 = página anterior, 1 = página siguiente
function cambiarPagina(cambio) {
  paginaActual = paginaActual + cambio;
  mostrarNoticias();
  window.scrollTo({ top: 0, behavior: "smooth" });
}


// ---------- 6. MODO CLARO / OSCURO ----------
function cambiarTema() {
  document.body.classList.toggle('oscuro');
  const oscuro = document.body.classList.contains('oscuro');
  document.getElementById('btnTema').textContent = oscuro ? "☀️" : "🌙";
}


// ---------- 7. EJEMPLOS DE DEMOSTRACIÓN ----------
// Son ejemplos ilustrativos (no noticias recientes). Cada uno enlaza
// a la fuente oficial o al medio dominicano donde se puede consultar el tema.
const EJEMPLOS = [
  { etiqueta: "Béisbol", title: "El clásico Licey vs. Escogido, la gran rivalidad de la pelota invernal",
    description: "La Liga de Béisbol Dominicano (LIDOM) reúne seis equipos: Tigres del Licey, Leones del Escogido, Águilas Cibaeñas, Estrellas Orientales, Toros del Este y Gigantes del Cibao.",
    url: "https://lidom.com", source: { name: "LIDOM" } },
  { etiqueta: "Béisbol", title: "Peloteros dominicanos en las Grandes Ligas: cobertura y resultados",
    description: "Los medios deportivos del país siguen cada día el desempeño de los jugadores dominicanos en las Grandes Ligas y en la pelota local.",
    url: "https://www.diariolibre.com", source: { name: "Diario Libre" } },
  { etiqueta: "Política", title: "La JCE y la organización de los procesos electorales",
    description: "La Junta Central Electoral es el organismo encargado de organizar y supervisar las elecciones en la República Dominicana.",
    url: "https://jce.gob.do", source: { name: "Junta Central Electoral" } },
  { etiqueta: "Política", title: "Debate político y actualidad del Congreso en la prensa nacional",
    description: "Periódicos como El Día y El Caribe dan seguimiento a las decisiones del Gobierno, el Congreso y los partidos políticos.",
    url: "https://eldia.com.do", source: { name: "El Día" } },
  { etiqueta: "Tecnología", title: "Telecomunicaciones: más fibra óptica y mejor cobertura móvil en el país",
    description: "El INDOTEL regula el sector de telecomunicaciones, que ha ido ampliando la conectividad y los servicios digitales en el territorio dominicano.",
    url: "https://indotel.gob.do", source: { name: "INDOTEL" } },
  { etiqueta: "Tecnología", title: "Servicios del Estado y trámites en línea para los ciudadanos",
    description: "La modernización institucional permite hacer más gestiones por internet, lo que se conecta con el uso de APIs en banca y gobierno digital.",
    url: "https://www.elcaribe.com.do", source: { name: "El Caribe" } },
  { etiqueta: "Nacionales", title: "Lo que pasa en el país: sociedad, economía y comunidades",
    description: "Los diarios nacionales reúnen las noticias de las provincias, el tránsito, el clima y los temas que afectan la vida diaria de los dominicanos.",
    url: "https://listindiario.com", source: { name: "Listín Diario" } },
  { etiqueta: "Nacionales", title: "Titulares del día en la prensa dominicana",
    description: "Una forma rápida de mantenerse informado es revisar las portadas de los principales medios del país.",
    url: "https://hoy.com.do", source: { name: "Hoy" } }
];

function mostrarEjemplos() {
  noticias = EJEMPLOS;
  paginaActual = 1;
  document.getElementById('mensaje').textContent =
    "Ejemplos ilustrativos (no son noticias recientes). Cada enlace lleva al medio o institución dominicana.";
  mostrarNoticias();
}
