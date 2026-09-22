/**
 * Archivo: account.js
 * Descripción: Permite editar los datos del usuario autenticado,
 * como nombre, apellido, correo y contraseña, y guardar esos cambios
 * tanto en la sesión actual como en el almacenamiento local.
 *
 * Este archivo también reubica los favoritos si el correo del usuario cambia.
 */

document.addEventListener("DOMContentLoaded", () => {
  
  const formEditar = document.querySelector("#formEditar");
  const nombre = document.querySelector("#nombre");
  const apellido = document.querySelector("#apellido");
  const correo = document.querySelector("#correo");
  const contrasena = document.querySelector("#contrasena");
  const actualizado = document.querySelector("#actualizado");

  nombre.value = usuarioActivo.nombre;
  apellido.value = usuarioActivo.apellido;
  correo.value = usuarioActivo.correo;
  contrasena.value = ""; 

  formEditar.addEventListener("submit", (e) => {
    e.preventDefault();

    const correoAnterior = usuarioActivo.correo;
    const correoNuevo = correo.value.trim();

    usuarioActivo.nombre = nombre.value.trim();
    usuarioActivo.apellido = apellido.value.trim();
    usuarioActivo.correo = correoNuevo;

    const nuevaClave = contrasena.value.trim();
    if (nuevaClave !== "") {
      usuarioActivo.contrasena = nuevaClave; // 
    }

    sessionStorage.setItem("usuarioLogueado", JSON.stringify(usuarioActivo));

    let listaUsuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    const index = listaUsuarios.findIndex(u => u.correo === correoAnterior || u.correo === correoNuevo);
    
    if (index !== -1) {
      listaUsuarios[index] = usuarioActivo;
    } else {
      listaUsuarios.push(usuarioActivo);
    }
    localStorage.setItem("usuarios", JSON.stringify(listaUsuarios));

    if (correoAnterior !== correoNuevo) {
      const claveAntigua = `favoritos_${correoAnterior}`;
      const claveNueva = `favoritos_${correoNuevo}`;
      const favs = localStorage.getItem(claveAntigua);
      if (favs) {
        localStorage.setItem(claveNueva, favs);
        localStorage.removeItem(claveAntigua);
      }
    }

    actualizado.textContent = "¡Cambios guardados con éxito!";
    setTimeout(() => {
      actualizado.textContent = "";
    }, 2000);
  });
});