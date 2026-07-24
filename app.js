"use strict";
// ==========================================
// 2. VARIABLES GLOBALES
// ==========================================
let libros = [];
let totalPrestamos = 0;
let totalEjemplares = 0;
// Elementos del HTML (DOM)
const selectLibros = document.getElementById("selectLibros");
const inputEstudiante = document.getElementById("estudiante");
const inputCantidad = document.getElementById("cantidad");
const formPrestamo = document.getElementById("loanForm");
const alertBox = document.getElementById("alertBox");
const tbodyPrestamos = document.getElementById("tbodyPrestamos");
// Elementos del Resumen
const txtTotalPrestamos = document.getElementById("totalPrestamos");
const txtTotalEjemplares = document.getElementById("totalEjemplares");
const txtUltimoLibro = document.getElementById("ultimoLibro");
const txtUltimoEstudiante = document.getElementById("ultimoEstudiante");
// ==========================================
// 3. INICIO Y CÁRGA AJAX
// ==========================================
document.addEventListener("DOMContentLoaded", function () {
    cargarResumenLocalStorage();
    obtenerLibrosAjax();
});
// Carga AJAX utilizando fetch desde el JSON del proyecto
function obtenerLibrosAjax() {
    fetch("./libros.JSON")
        .then(function (respuesta) {
        if (!respuesta.ok) {
            throw new Error("No se pudo cargar el archivo JSON.");
        }
        return respuesta.json();
    })
        .then(function (data) {
        libros = data.map(function (item) {
            return {
                codigo: item.codigoLibro,
                titulo: item.titulo,
                stock: item.disponibles
            };
        });
        llenarSelectLibros();
    })
        .catch(function () {
        mostrarMensajeError("Error al cargar la lista de libros mediante AJAX.");
    });
}
function llenarSelectLibros() {
    selectLibros.innerHTML = '<option value="">-- Seleccione un libro --</option>';
    for (let i = 0; i < libros.length; i++) {
        const libro = libros[i];
        const opcion = document.createElement("option");
        opcion.value = libro.codigo;
        opcion.textContent = libro.titulo + " (Disponibles: " + libro.stock + ")";
        selectLibros.appendChild(opcion);
    }
}
// ==========================================
// 4. REGISTRO Y VALIDACIONES
// ==========================================
formPrestamo.addEventListener("submit", function (evento) {
    evento.preventDefault();
    ocultarMensajeError();
    const estudiante = inputEstudiante.value.trim();
    const codigoSeleccionado = selectLibros.value;
    const cantidad = Number(inputCantidad.value);
    // Validacion 1: Estudiante vacio
    if (estudiante === "") {
        mostrarMensajeError("Debe ingresar el nombre del estudiante.");
        return;
    }
    // Validacion 2: Libro no seleccionado
    if (!codigoSeleccionado) {
        mostrarMensajeError("Debe seleccionar un libro.");
        return;
    }
    // Buscar libro seleccionado en el arreglo
    let libroEncontrado;
    for (let i = 0; i < libros.length; i++) {
        if (libros[i].codigo === codigoSeleccionado) {
            libroEncontrado = libros[i];
            break;
        }
    }
    if (!libroEncontrado) {
        mostrarMensajeError("El libro seleccionado no es válido.");
        return;
    }
    // Validacion 3: Cantidad menor o igual a cero
    if (isNaN(cantidad) || cantidad <= 0) {
        mostrarMensajeError("La cantidad debe ser mayor que cero.");
        return;
    }
    // Validacion 4: Cantidad mayor al stock
    if (cantidad > libroEncontrado.stock) {
        mostrarMensajeError("La cantidad solicitada supera los ejemplares disponibles.");
        return;
    }
    // Si pasa las validaciones, creamos el préstamo
    const nuevoPrestamo = {
        codigoLibro: libroEncontrado.codigo,
        titulo: libroEncontrado.titulo,
        estudiante: estudiante,
        cantidad: cantidad
    };
    // Actualizar el stock del libro
    libroEncontrado.stock = libroEncontrado.stock - cantidad;
    llenarSelectLibros();
    // Agregar la fila a la tabla
    agregarFilaTabla(nuevoPrestamo);
    // Actualizar acumuladores y guardar en LocalStorage
    guardarEnLocalStorage(nuevoPrestamo);
    // Limpiar formulario
    formPrestamo.reset();
});
// ==========================================
// 5. MANIPULACIÓN DEL DOM (TABLA Y MENSAJES)
// ==========================================
function agregarFilaTabla(p) {
    const fila = document.createElement("tr");
    fila.innerHTML = `
        <td>${p.codigoLibro}</td>
        <td>${p.titulo}</td>
        <td>${p.estudiante}</td>
        <td>${p.cantidad}</td>
    `;
    tbodyPrestamos.appendChild(fila);
}
function mostrarMensajeError(mensaje) {
    alertBox.textContent = mensaje;
    alertBox.classList.remove("d-none");
}
function ocultarMensajeError() {
    alertBox.textContent = "";
    alertBox.classList.add("d-none");
}
// ==========================================
// 6. ACUMULADORES Y LOCAL STORAGE
// ==========================================
function guardarEnLocalStorage(p) {
    totalPrestamos = totalPrestamos + 1;
    totalEjemplares = totalEjemplares + p.cantidad;
    // Actualizar en pantalla
    txtTotalPrestamos.textContent = totalPrestamos.toString();
    txtTotalEjemplares.textContent = totalEjemplares.toString();
    txtUltimoLibro.textContent = p.titulo;
    txtUltimoEstudiante.textContent = p.estudiante;
    // Guardar objeto en LocalStorage
    const resumen = {
        totalPrestamos: totalPrestamos,
        totalEjemplares: totalEjemplares,
        ultimoLibro: p.titulo,
        ultimoEstudiante: p.estudiante
    };
    localStorage.setItem("resumenBiblioteca", JSON.stringify(resumen));
}
function cargarResumenLocalStorage() {
    const datosGuardados = localStorage.getItem("resumenBiblioteca");
    if (datosGuardados !== null) {
        const resumen = JSON.parse(datosGuardados);
        totalPrestamos = resumen.totalPrestamos || 0;
        totalEjemplares = resumen.totalEjemplares || 0;
        txtTotalPrestamos.textContent = totalPrestamos.toString();
        txtTotalEjemplares.textContent = totalEjemplares.toString();
        txtUltimoLibro.textContent = resumen.ultimoLibro || "Ninguno";
        txtUltimoEstudiante.textContent = resumen.ultimoEstudiante || "Ninguno";
    }
}
