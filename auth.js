/**
 * Archivo: auth.js
 * Descripción: Gestiona la autenticación de usuarios en la aplicación.
 *
 * Incluye:
 * - validación del formulario de registro
 * - manejo de errores de validación
 * - encriptación de contraseñas con bcrypt
 * - registro de nuevos usuarios en localStorage
 * - inicio de sesión con validación de credenciales
 * - redirección a la vista principal tras iniciar sesión
 */

// Validacion Formulario Registro
const bcrypt = window['bcrypt'] || window['dcodeIO']?.['bcrypt'];

document.addEventListener("DOMContentLoaded", () => {
  const formularioRegistro = document.querySelector("#registroForm");
  const formularioLogin = document.querySelector("#loginForm")

  if(formularioRegistro){
    // Expresiones Regulares para la validación de campos
    const textoRegex = /^[a-zA-ZñÑáÁéÉíÍóÓúÚ\s']{2,}$/i;
    const correoRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*#?&\.])[A-Za-z\d@$!%*#?&\.]{8,50}$/;

    function mostrarError(input, mensaje){
      if (!input) return;

      const etiquetaP = input.parentElement.nextElementSibling;
      if (etiquetaP && etiquetaP.tagName === 'P') {
        etiquetaP.textContent = mensaje;
        etiquetaP.style.color = '#ff3333';
      }
      input.style.border = '2px solid #ff3333';
    }

    function limpiarErrores(inputs){
      inputs.forEach(input => {
        const etiquetaP = input.parentElement.nextElementSibling;
        if (etiquetaP && etiquetaP.tagName === 'P') {
          etiquetaP.textContent = '';
        }
        input.style.border = '';
      });
    }
    
    function validarTexto(valor, regex) {
      return regex.test(valor.trim());
    }

    function validarContraseña(contraseña, confirmarContraseña, input, errors) {
      if(contraseña !== confirmarContraseña || confirmarContraseña === ""){
        errors.push({input:input, mensaje: "ERROR: Las contraseñas deben coincidir. Este campo es obligatorio"});
      }
    }

    formularioRegistro.addEventListener("submit", async (e) =>{
      e.preventDefault();

      let nombre = document.getElementById("nombre");
      let apellido = document.getElementById("apellido");
      let correo = document.getElementById("correo");
      let contraseña = document.getElementById("contrasena");
      let confirmarContraseña = document.getElementById("confirmar");

      limpiarErrores([nombre, apellido, correo, contraseña, confirmarContraseña]);
      let errors = [];

      if(!validarTexto(nombre.value, textoRegex)) {
        errors.push({ input: nombre, mensaje: "El nombre solo debe contener letras, espacios y al menos 2 caracteres. Este campo es obligatorio" });
      }

      if(!validarTexto(apellido.value, textoRegex)) {
        errors.push({ input: apellido, mensaje: "El apellido solo debe contener letras, espacios y al menos 2 caracteres. Este campo es obligatorio" });
      }

      if(!validarTexto(correo.value, correoRegex)){
        errors.push({ input: correo, mensaje: "El correo debe tener un formato válido (ejemplo@dominio.com). Este campo es obligatorio"});
      } else {
        let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

        let correoCopia = usuarios.find( user => user.correo === correo.value.trim());

        if(correoCopia){
          errors.push({input: correo, mensaje: "Este correo ya se encuentra registrado. Intente con otro o inicie sesión."})
        }
      }

      if(!validarTexto(contraseña.value, passwordRegex)){
        errors.push({ input: contraseña, mensaje: "La contraseña debe tener de 8 a 50 caracteres, incluir al menos una mayúscula, una minúscula, un número y un carácter especial (@$!%*#?&.). Este campo es obligatorio"});
      }

      validarContraseña(contraseña.value, confirmarContraseña.value, confirmarContraseña, errors);

      if (errors.length > 0) {
        errors.forEach(err => {
        mostrarError(err.input, err.mensaje);
      });
      } else {
        let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

        const encrytedContraseña = bcrypt.hashSync(contraseña.value, 10);

        const nuevoUsuario = {
          nombre: nombre.value.trim(),
          apellido: apellido.value.trim(),
          correo: correo.value.trim(),
          contrasena: encrytedContraseña
        }

        usuarios.push(nuevoUsuario)
        localStorage.setItem("usuarios", JSON.stringify(usuarios));
      

        window.location.href = "login.html";
      }
    });
  }

  if(formularioLogin){
    formularioLogin.addEventListener("submit", async (e) =>{
      e.preventDefault();

      const correo = document.getElementById("correo").value.trim();
      const contraseña = document.getElementById("contrasena").value;

      const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
      const usuarioValido = usuarios.find(user => user.correo === correo);

      if(usuarios.length === 0){
        window.location.href = "register.html";
        return;
      }

      if (usuarioValido) {
        const coincide = bcrypt.compareSync(contraseña, usuarioValido.contrasena);
        if(coincide){
          sessionStorage.setItem("usuarioLogueado", JSON.stringify(usuarioValido));
          window.location.href = "index.html"; 
        } else {
          document.getElementById("errorLogin").innerHTML = "Correo o contraseña incorrectos. Por favor, verifique sus datos.";
        }
      } else {
        document.getElementById("errorLogin").innerHTML = "Correo o contraseña incorrectos. Por favor, verifique sus datos.";
      }
    });
  }
});
