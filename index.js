/**
 * Archivo: index.js
 * Descripción: Gestiona la vista principal de la aplicación, donde se muestran
 * los personajes de Rick and Morty, se permite buscar, filtrar, paginar y
 * guardar favoritos por usuario.
 *
 * Funciones principales:
 * - mostrarUsuario(): muestra el nombre del usuario activo y el botón de cerrar sesión.
 * - traerPersonajes(): consulta la API con paginación.
 * - mostrarPersonajes(): renderiza las tarjetas de personajes.
 * - marcarFavorito(): agrega o elimina personajes de favoritos.
 * - buscarPersonaje(): busca personajes por nombre.
 * - filtrar(): muestra todos o solo los favoritos.
 * - siguiente() / anterior(): navegan entre páginas.
 */

let paginaActual = 1;
let limite = 0;

/**
 * Evento que se dispara cuando el contenido del DOM ya está cargado.
 * Inicializa la interfaz principal: usuario activo, personajes, buscador y paginación.
 */
document.addEventListener("DOMContentLoaded", () => {
  mostrarUsuario(usuarioActivo);

  traerPersonajes(paginaActual);

  document.querySelector("#buscar").addEventListener("input", () => {
    buscarPersonaje();
  });

  document.querySelector("#anterior").addEventListener("click", () => {
    anterior();
  });

  document.querySelector("#siguiente").addEventListener("click", () => {
    siguiente();
  });
});

/**
 * Muestra la información del usuario activo en la barra superior.
 * También agrega la acción de cerrar sesión.
 *
 * @param {Object} usuario Objeto con los datos del usuario actual.
 */
function mostrarUsuario(usuario){
  const contenerdorUsuario = document.querySelector("#usuario");
  contenerdorUsuario.innerHTML = `
    <a href="./account.html">
      <div class="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-xl hover:bg-[#7cce00] transition-all duration-300">
        <i class="fa-regular fa-circle-user text-xl text-white"></i>
        <span class="text-[10px] sm:text-xs font-semibold open-sans">${usuario.nombre} ${usuario.apellido}</span>
      </div>
    </a>
    <button id="cerrarSesion" class="bg-red-700 text-[10px] px-2 py-1 sm:text-xs open-sans text-white rounded-xl px-3.5 py-2 font-semibold hover:bg-[#7cce00] transition-all duration-300">
      Cerrar Sesión
    </button>
  `;

  //cerrar sesion
  document.querySelector("#cerrarSesion").addEventListener("click", () => {
    sessionStorage.removeItem("usuarioLogueado");
    window.location.href = "login.html"
  })
}

/**
 * Consulta la API de Rick and Morty para obtener personajes de una página específica.
 *
 * @param {number} pagina Número de la página a consultar.
 */
async function traerPersonajes(pagina){
  try {
    await fetch(`https://rickandmortyapi.com/api/character?page=${pagina}`)
    .then((Api) => Api.json())
    .then((data) => {
      mostrarPersonajes(data.results);
      limite = data.info.pages;
    });
  } catch (error) {
    console.log(`Hubo un error: ${error.message}`);
  }
}

/**
 * Renderiza una lista de personajes en el contenedor principal.
 * Además, compara cada personaje con los favoritos del usuario activo para
 * mostrar el estado correcto del botón de favorito.
 *
 * @param {Array} personajes Arreglo con los resultados recibidos desde la API.
 */
function mostrarPersonajes(personajes){
  const divPersonajes = document.querySelector("#personajes");
  divPersonajes.innerHTML = "";
  const usuarioActivo = JSON.parse(sessionStorage.getItem("usuarioLogueado"));
  const claveFav = `favoritos_${usuarioActivo.correo}`;
  const favoritos = JSON.parse(localStorage.getItem(claveFav)) || [];

  personajes.forEach((personaje) => {
    const favorito = favoritos.some((fav) => fav.id === personaje.id);

    const divPersonaje = document.createElement("div");
    divPersonaje.classList.add(
      "bg-white",
      "p-5",
      "text-black",
      "flex",
      "flex-col",
      "justify-between",
      "gap-4",
      "rounded-xl",
      "shadow-lg",
      "hover:shadow-xl",
      "transition-all",
      "duration-300",
      "border",
      "border-gray-100"
    );

    divPersonaje.innerHTML = `
      <a href="./character.html?id=${personaje.id}" class="flex flex-col gap-3 group">
      <div class="overflow-hidden rounded-xl bg-gray-100 aspect-square">
        <img src="${personaje.image}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      </div>
      <div class="flex flex-col gap-1">
        <h2 class="text-base sm:text-lg md:text-xl font-bold text-[#031808] group-hover:text-[#7cce00] transition-colors open-sans">${personaje.name}</h2>
        <p class="text-xs md:text-sm text-gray-600 font-medium">Especie: <span class="text-gray-800 font-semibold open-sans">${personaje.species}</span></p>
        <p class="text-xs md:text-sm text-gray-600 font-medium">Estado: <span class="text-gray-800 font-semibold open-sans">${personaje.status}</span></p>
      </div>
    </a>

    <button class="btn-favorito w-full py-2 px-3 md:py-2.5 md:px-4 rounded-xl text-white open-sans font-semibold text-xs md:text-sm transition-all duration-300 shadow-md cursor-pointer flex items-center justify-center gap-2 ${
      favorito ? "bg-[#031808] hover:bg-red-800" : "bg-red-800 hover:bg-[#031808]"
    }"data-favorito="${favorito}">
      ${favorito ? "Favorito ⭐" : "Marcar Favorito"}
    </button>
    `;

    const btnFav = divPersonaje.querySelector(".btn-favorito");
    btnFav.addEventListener("click", () => {
      marcarFavorito(personaje, btnFav);
    });

    divPersonajes.appendChild(divPersonaje);
  });
}

/**
 * Agrega o elimina un personaje de la lista de favoritos del usuario activo.
 *
 * @param {Object} personaje Objeto del personaje seleccionado.
 * @param {HTMLElement} btn Botón de favorito asociado a ese personaje.
 */
function marcarFavorito(personaje, btn){
  const usuarioActivo = JSON.parse(sessionStorage.getItem("usuarioLogueado"));
  const claveFav = `favoritos_${usuarioActivo.correo}`;
  const favoritos = JSON.parse(localStorage.getItem(claveFav)) || [];

  const index = favoritos.findIndex((fav) => fav.id === personaje.id);
  if (index >= 0) {
    favoritos.splice(index, 1);
    btn.dataset.favorito = "false";
    btn.textContent = "Marcar Favorito";
    btn.className = "btn-favorito w-full py-2.5 px-4 rounded-xl text-white open-sans font-semibold text-sm transition-all duration-300 shadow-md cursor-pointer flex items-center justify-center gap-2 bg-red-800 hover:bg-[#031808]";
  } else {
    favoritos.push({
      id: personaje.id,
      name: personaje.name,
      image: personaje.image,
      status: personaje.status,
      species: personaje.species
    });
    btn.dataset.favorito = "true";
    btn.textContent = "Favorito ⭐";
    btn.className = "btn-favorito w-full py-2.5 px-4 rounded-xl text-white open-sans font-semibold text-sm transition-all duration-300 shadow-md cursor-pointer flex items-center justify-center gap-2 bg-[#031808] hover:bg-red-800";
  }

  localStorage.setItem(claveFav, JSON.stringify(favoritos));

  const filtroActual = document.querySelector("#filtro").value;
  if (filtroActual === "favoritos") {
    filtrar();
  }
}

  document.addEventListener("mouseover", (e) => {
    const btn = e.target.closest(".btn-favorito");
    if (btn && btn.dataset.favorito === "true") {
      btn.textContent = "Deshacer favorito ❌";
    }
  });

  document.addEventListener("mouseout", (e) => {
    const btn = e.target.closest(".btn-favorito");
    if (btn && btn.dataset.favorito === "true") {
      btn.textContent = "Favorito ⭐";
    }
  });

/**
 * Realiza una búsqueda por nombre consultando la API.
 * Si no hay texto ingresado, vuelve a cargar la página actual.
 */
async function buscarPersonaje() {
  let buscarNombre = document.querySelector("#buscar").value;
  if(buscarNombre.trim() !== ""){
    try {
      let resultado = await fetch(`https://rickandmortyapi.com/api/character/?name=${buscarNombre}`)
      .then((data) => data.json());
      if(resultado.results){
        mostrarPersonajes(resultado.results);
        
        document.querySelector("#anterior").disabled = true;
        document.querySelector("#siguiente").disabled = true;
      } else {
        document.querySelector("#personajes").innerHTML = `<p class="text-black col-span-3 text-center text-xl open-sans">No se encontraron personajes con ese nombre</p>`;
      }
    } catch (error) {
      console.log("No se encontró el personaje o hubo un error:", error);
    }
  } else {
    traerPersonajes(paginaActual);
  }
}

/**
 * Filtra la vista según la opción seleccionada en el menú de filtros.
 * Puede mostrar todos los personajes o solo los favoritos del usuario.
 */
function filtrar(){
  const seleccion = document.querySelector("#filtro").value;
  if (seleccion === "todos"){
    document.querySelector("#anterior").disabled = true;
    document.querySelector("#siguiente").disabled = true;
    traerPersonajes(paginaActual);

  } else if (seleccion === "favoritos"){
    const usuarioActivo = JSON.parse(sessionStorage.getItem("usuarioLogueado"));
    
    if (usuarioActivo) {
      const claveFav = `favoritos_${usuarioActivo.correo}`;
      const favoritos = JSON.parse(localStorage.getItem(claveFav)) || [];
      document.querySelector("#anterior").disabled = false;
      document.querySelector("#siguiente").disabled = false;

      if(favoritos.length > 0){
        mostrarPersonajes(favoritos);
      } else {
        document.querySelector("#personajes").innerHTML = `<p class="text-black col-span-3 text-center text-xl open-sans">No se encontraron personajes favoritos</p>`;
      }
    }
  }
}

/**
 * Avanza a la siguiente página de personajes.
 */
async function siguiente() {
  paginaActual++;
  await traerPersonajes(paginaActual);
  if (paginaActual === limite) {
    document.querySelector("#siguiente").classList.add("invisible", "pointer-events-none")
    document.querySelector("#siguiente").disabled = true;
  }
  document.querySelector("#anterior").classList.remove("invisible", "pointer-events-none");
  document.querySelector("#anterior").disabled = false;
}

/**
 * Retrocede a la página anterior de personajes.
 */
async function anterior() {
  paginaActual--;
  await traerPersonajes(paginaActual);
  if (paginaActual === 1) {
    document.querySelector("#anterior").classList.add("invisible", "pointer-events-none");
    document.querySelector("#anterior").disabled = true;
  }
  document.querySelector("#siguiente").classList.remove("invisible", "pointer-events-none");
  document.querySelector("#siguiente").disabled = false;
}

