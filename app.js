"use strict";
let libros = [];
let totalPrestamos = 0;
let totalEjemplares = 0;
const selectLibros = document.getElementById("selectLibros");
const inputEstudiante = document.getElementById("estudiante");
const inputCantidad = document.getElementById("cantidad");
const formPrestamo = document.getElementById("loanForm");
const alertBox = document.getElementById("alertBox");
const tbodyPrestamos = document.getElementById("tbodyPrestamos");
const txtTotalPrestamos = document.getElementById("totalPrestamos");
const txtTotalEjemplares = document.getElementById("totalEjemplares");
const txtUltimoLibro = document.getElementById("ultimoLibro");
const txtUltimoEstudiante = document.getElementById("ultimoEstudiante");
document.addEventListener("DOMContentLoaded", function () {
    cargarResumenLocalStorage();
    obtenerLibrosAjax();
});
function obtenerLibrosAjax() {
    fetch("./libros.JSON")
        .then(function (respuesta) {
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
formPrestamo.addEventListener("submit", function (evento) {
    evento.preventDefault();
    ocultarMensajeError();
    const estudiante = inputEstudiante.value.trim();
    const codigoSeleccionado = selectLibros.value;
    const cantidad = Number(inputCantidad.value);
    if (estudiante === "") {
        mostrarMensajeError("Debe ingresar el nombre del estudiante.");
        return;
    }
    if (!codigoSeleccionado) {
        mostrarMensajeError("Debe seleccionar un libro.");
        return;
    }
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
    if (isNaN(cantidad) || cantidad <= 0) {
        mostrarMensajeError("La cantidad debe ser mayor que cero.");
        return;
    }
    if (cantidad > libroEncontrado.stock) {
        mostrarMensajeError("La cantidad solicitada supera los ejemplares disponibles.");
        return;
    }
    const nuevoPrestamo = {
        codigoLibro: libroEncontrado.codigo,
        titulo: libroEncontrado.titulo,
        estudiante: estudiante,
        cantidad: cantidad
    };
    libroEncontrado.stock = libroEncontrado.stock - cantidad;
    llenarSelectLibros();
    agregarFilaTabla(nuevoPrestamo);
    guardarEnLocalStorage(nuevoPrestamo);
    formPrestamo.reset();
});
function agregarFilaTabla(prestamo) {
    const fila = document.createElement("tr");
    fila.innerHTML = "<td>" + prestamo.codigoLibro + "</td>" +
        "<td>" + prestamo.titulo + "</td>" +
        "<td>" + prestamo.estudiante + "</td>" +
        "<td>" + prestamo.cantidad + "</td>";
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
function guardarEnLocalStorage(prestamo) {
    totalPrestamos = totalPrestamos + 1;
    totalEjemplares = totalEjemplares + prestamo.cantidad;
    txtTotalPrestamos.textContent = totalPrestamos.toString();
    txtTotalEjemplares.textContent = totalEjemplares.toString();
    txtUltimoLibro.textContent = prestamo.titulo;
    txtUltimoEstudiante.textContent = prestamo.estudiante;
    const resumen = {
        totalPrestamos: totalPrestamos,
        totalEjemplares: totalEjemplares,
        ultimoLibro: prestamo.titulo,
        ultimoEstudiante: prestamo.estudiante
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
