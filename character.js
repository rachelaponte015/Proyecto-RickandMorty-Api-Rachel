/**
 * Archivo: character.js
 * Descripción: Carga el detalle de un personaje específico desde la API
 * y permite marcarlo o quitarlo como favorito para el usuario activo.
 *
 */

document.addEventListener("DOMContentLoaded", () => {
  const parametrosUrl = window.location.search;
  const parametros = new URLSearchParams(parametrosUrl);
  const idValor = parametros.get("id");

  if (!idValor) {
    document.querySelector("#detallePersonaje").innerHTML = `
      <div class="bg-white p-6 rounded-2xl shadow-xl text-center flex flex-col gap-3">
        <h1 class="text-lg font-bold text-red-700 open-sans">Oops, no se encontró ningún personaje</h1>
        <p class="text-sm text-gray-600 open-sans">Por favor, regresa al inicio y selecciona uno</p>
      </div>
    `;
    return;
  }

  obtenerInformacion(idValor, usuarioActivo);
});

/**
 * Obtiene la información de un personaje desde la API usando su ID.
 *
 * @param {string} id Identificador del personaje.
 * @param {Object} usuarioActivo Usuario actual en sesión.
 */
async function obtenerInformacion(id, usuarioActivo) {
  try {
    let personaje = await fetch(
      `https://rickandmortyapi.com/api/character/${id}`
    ).then((data) => data.json());

    if (personaje.error) {
      document.querySelector("#detallePersonaje").innerHTML = `
        <div class="bg-white p-6 rounded-2xl shadow-xl text-center flex flex-col gap-3">
          <h1 class="text-lg font-bold text-red-700 open-sans">Oops, no se encontró ningún personaje</h1>
        </div>
      `;
    } else {
      mostrarDetalle(personaje, usuarioActivo);
    }
  } catch (error) {
    console.log(error.message);
    document.querySelector("#detallePersonaje").innerHTML = `
      <div class="bg-white p-6 rounded-2xl shadow-xl text-center flex flex-col gap-3">
        <h1 class="text-lg font-bold text-red-700">Ops, hubo un error al cargar el personaje</h1>
      </div>
    `;
  }
}

/**
 * Construye la vista con los detalles del personaje y su estado de favorito.
 *
 * @param {Object} personaje Datos devueltos por la API.
 * @param {Object} usuarioActivo Usuario actual en sesión.
 */
function mostrarDetalle(personaje, usuarioActivo) {
  const contenedor = document.querySelector("#detallePersonaje");
  
  const claveFav = `favoritos_${usuarioActivo.correo}`;
  const favoritos = JSON.parse(localStorage.getItem(claveFav)) || [];
  const favorito = favoritos.some((fav) => fav.id === personaje.id);

  contenedor.innerHTML = `
    <div class="bg-white p-6 text-black flex flex-col gap-4 rounded-2xl shadow-xl border border-gray-100">
      <div class="overflow-hidden rounded-xl bg-gray-100 aspect-square">
        <img src="${personaje.image}" alt="${personaje.name}" class="w-full h-full object-cover rounded-xl" />
      </div>
      
      <h1 class="text-2xl font-bold text-[#031808] open-sans">${personaje.name}</h1>
      
      <div class="flex flex-col gap-2 text-sm text-gray-600 font-medium border-t border-gray-200 pt-3">
        <p>Estado: <span class="text-gray-800 font-semibold open-sans">${personaje.status}</span></p>
        <p>Especie: <span class="text-gray-800 font-semibold open-sans" >${personaje.species}</span></p>
        <p>Género: <span class="text-gray-800 font-semibold open-sans">${personaje.gender}</span></p>
        <p>Origen: <span class="text-gray-800 font-semibold open-sans">${personaje.origin.name}</span></p>
        <p>Ubicación: <span class="text-gray-800 font-semibold open-sans">${personaje.location.name}</span></p>
        <p>Episodios: <span class="text-gray-800 font-semibold open-sans">${personaje.episode.length}</span></p>
      </div>

      <button id="btnFavoritoDetalle" class="btn-favorito w-full py-2.5 px-4 rounded-xl text-white open-sans font-semibold text-sm transition-all duration-300 shadow-md cursor-pointer flex items-center justify-center gap-2 ${
        favorito ? "bg-[#031808] hover:bg-red-800" : "bg-red-800 hover:bg-[#031808]"
      }" data-favorito="${favorito}">
        ${favorito ? "Favorito ⭐" : "Marcar Favorito"}
      </button>
    </div>
  `;

  const btnFav = document.querySelector("#btnFavoritoDetalle");
  btnFav.addEventListener("click", () => {
    marcarFavoritoDetalle(personaje, btnFav, usuarioActivo);
  });
}

/**
 * Añade o elimina un personaje de la lista de favoritos del usuario actual
 * desde la vista de detalle.
 *
 * @param {Object} personaje Objeto del personaje actual.
 * @param {HTMLElement} btn Botón del detalle del personaje.
 * @param {Object} usuarioActivo Usuario autenticado.
 */
function marcarFavoritoDetalle(personaje, btn, usuarioActivo) {
  const claveFav = `favoritos_${usuarioActivo.correo}`;
  let favoritos = JSON.parse(localStorage.getItem(claveFav)) || [];

  const index = favoritos.findIndex((fav) => fav.id === personaje.id);
  if (index >= 0) {
    favoritos.splice(index, 1);
    btn.dataset.favorito = "false";
    btn.textContent = "Marcar Favorito";
    btn.className = "btn-favorito w-full py-2.5 px-4 rounded-xl text-white font-semibold open-sans text-sm transition-all duration-300 shadow-md cursor-pointer flex items-center justify-center gap-2 bg-red-800 hover:bg-[#031808]";
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
    btn.className = "btn-favorito w-full py-2.5 px-4 rounded-xl text-white font-semibold open-sans text-sm transition-all duration-300 shadow-md cursor-pointer flex items-center justify-center gap-2 bg-[#031808] hover:bg-red-800";
  }

  localStorage.setItem(claveFav, JSON.stringify(favoritos));
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