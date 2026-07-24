// ==========================================
// 1. INTERFACES
// ==========================================
interface Libro {
    codigo: number;
    titulo: string;
    stock: number;
}

interface Prestamo {
    codigoLibro: number;
    titulo: string;
    estudiante: string;
    cantidad: number;
}

// ==========================================
// 2. VARIABLES GLOBALES
// ==========================================
let libros: Libro[] = [];

let totalPrestamos: number = 0;
let totalEjemplares: number = 0;

// Elementos del HTML (DOM)
const selectLibros = document.getElementById("selectLibros") as HTMLSelectElement;
const inputEstudiante = document.getElementById("estudiante") as HTMLInputElement;
const inputCantidad = document.getElementById("cantidad") as HTMLInputElement;
const formPrestamo = document.getElementById("loanForm") as HTMLFormElement;
const alertBox = document.getElementById("alertBox") as HTMLDivElement;
const tbodyPrestamos = document.getElementById("tbodyPrestamos") as HTMLTableSectionElement;

// Elementos del Resumen
const txtTotalPrestamos = document.getElementById("totalPrestamos") as HTMLSpanElement;
const txtTotalEjemplares = document.getElementById("totalEjemplares") as HTMLSpanElement;
const txtUltimoLibro = document.getElementById("ultimoLibro") as HTMLSpanElement;
const txtUltimoEstudiante = document.getElementById("ultimoEstudiante") as HTMLSpanElement;

// ==========================================
// 3. INICIO Y CÁRGA AJAX
// ==========================================
document.addEventListener("DOMContentLoaded", function() {
    cargarResumenLocalStorage();
    obtenerLibrosAjax();
});

// Carga AJAX utilizando fetch
function obtenerLibrosAjax(): void {
    const datosLibros = [
        { codigo: 101, titulo: "Desarrollo Web con TypeScript", stock: 5 },
        { codigo: 102, titulo: "Estructuras de Datos y Algoritmos", stock: 3 },
        { codigo: 103, titulo: "Patrones de Diseño", stock: 2 },
        { codigo: 104, titulo: "Bases de Datos Relacionales", stock: 4 }
    ];

    // Simulación de respuesta JSON vía AJAX
    const jsonURL = "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(datosLibros));

    fetch(jsonURL)
        .then(function(respuesta) {
            return respuesta.json();
        })
        .then(function(data: Libro[]) {
            libros = data;
            llenarSelectLibros();
        })
        .catch(function(error) {
            mostrarMensajeError("Error al cargar la lista de libros mediante AJAX.");
        });
}

function llenarSelectLibros(): void {
    selectLibros.innerHTML = '<option value="">-- Seleccione un libro --</option>';
    
    for (let i = 0; i < libros.length; i++) {
        const libro = libros[i];
        const opcion = document.createElement("option");
        opcion.value = libro.codigo.toString();
        opcion.textContent = libro.titulo + " (Disponibles: " + libro.stock + ")";
        selectLibros.appendChild(opcion);
    }
}

// ==========================================
// 4. REGISTRO Y VALIDACIONES
// ==========================================
formPrestamo.addEventListener("submit", function(evento) {
    evento.preventDefault();
    ocultarMensajeError();

    const estudiante = inputEstudiante.value.trim();
    const codigoSeleccionado = Number(selectLibros.value);
    const cantidad = Number(inputCantidad.value);

    // Validacion 1: Estudiante vacio
    if (estudiante === "") {
        mostrarMensajeError("Debe ingresar el nombre del estudiante.");
        return;
    }

    // Validacion 2: Libro no seleccionado
    if (!selectLibros.value || isNaN(codigoSeleccionado)) {
        mostrarMensajeError("Debe seleccionar un libro.");
        return;
    }

    // Buscar libro seleccionado en el arreglo
    let libroEncontrado: Libro | undefined;
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
    const nuevoPrestamo: Prestamo = {
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
function agregarFilaTabla(p: Prestamo): void {
    const fila = document.createElement("tr");

    fila.innerHTML = `
        <td>${p.codigoLibro}</td>
        <td>${p.titulo}</td>
        <td>${p.estudiante}</td>
        <td>${p.cantidad}</td>
    `;

    tbodyPrestamos.appendChild(fila);
}

function mostrarMensajeError(mensaje: string): void {
    alertBox.textContent = mensaje;
    alertBox.classList.remove("d-none");
}

function ocultarMensajeError(): void {
    alertBox.textContent = "";
    alertBox.classList.add("d-none");
}

// ==========================================
// 6. ACUMULADORES Y LOCAL STORAGE
// ==========================================
function guardarEnLocalStorage(p: Prestamo): void {
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

function cargarResumenLocalStorage(): void {
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
