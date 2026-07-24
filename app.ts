interface Libro {
    codigoLibro: number;
    titulo: string;
    disponibles: number;
}

interface Prestamo {
    codigoLibro: number;
    titulo: string;
    estudiante: string;
    cantidad: number;
}

//Variables y Estado 
let libros: Libro[] = [];
let prestamos: Prestamo[] = [];

let totalPrestamosCount: number = 0;
let totalEjemplaresCount: number = 0;

// Referencias al DOM
const selectLibros = document.getElementById("selectLibros") as HTMLSelectElement;
const inputEstudiante = document.getElementById("estudiante") as HTMLInputElement;
const inputCantidad = document.getElementById("cantidad") as HTMLInputElement;
const formPrestamo = document.getElementById("loanForm") as HTMLFormElement;
const alertBox = document.getElementById("alertBox") as HTMLDivElement;
const tbodyPrestamos = document.getElementById("tbodyPrestamos") as HTMLTableSectionElement;

// Elementos de Resumen
const txtTotalPrestamos = document.getElementById("totalPrestamos") as HTMLSpanElement;
const txtTotalEjemplares = document.getElementById("totalEjemplares") as HTMLSpanElement;
const txtUltimoLibro = document.getElementById("ultimoLibro") as HTMLSpanElement;
const txtUltimoEstudiante = document.getElementById("ultimoEstudiante") as HTMLSpanElement;

//AJAX

document.addEventListener("DOMContentLoaded", () => {
    recuperarResumenLocalStorage();
    cargarLibrosAjax();
});

// Carga de libros mediante solicitud AJAX (Fetch API)
function cargarLibrosAjax(): void {
    const jsonSimulado = JSON.stringify([
        { codigo: 101, titulo: "Desarrollo Web con TypeScript", stock: 5 },
        { codigo: 102, titulo: "Estructuras de Datos y Algoritmos", stock: 3 },
        { codigo: 103, titulo: "Patrones de Diseño", stock: 2 },
        { codigo: 104, titulo: "Bases de Datos Relacionales", stock: 4 }
    ]);

    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(jsonSimulado);

    fetch(dataUri)
        .then((response: Response) => response.json())
        .then((data: Libro[]) => {
            libros = data;
            poblarSelectLibros(libros);
        })
        .catch((error: any) => {
            mostrarError("Error al cargar la lista de libros mediante AJAX.");
            console.error(error);
        });
}

function poblarSelectLibros(lista: Libro[]): void {
    selectLibros.innerHTML = '<option value="">-- Seleccione un libro --</option>';
    lista.forEach((libro: Libro) => {
        const option = document.createElement("option");
        option.value = libro.codigo.toString();
        option.textContent = ${libro.titulo} (Disponibles: ${libro.stock});
        selectLibros.appendChild(option);
    });
}
// validacion y registro
formPrestamo.addEventListener("submit", (e: Event) => {
    e.preventDefault();
    ocultarError();

    const nombreEstudiante: string = inputEstudiante.value.trim();
    const codigoSeleccionado: number = Number(selectLibros.value);
    const cantidad: number = Number(inputCantidad.value);

    // Validación 1: Estudiante vacío
    if (nombreEstudiante === "") {
        mostrarError("Debe ingresar el nombre del estudiante.");
        return;
    }

    // Validación 2: Libro no seleccionado
    if (!selectLibros.value || isNaN(codigoSeleccionado)) {
        mostrarError("Debe seleccionar un libro.");
        return;
    }

    // Búsqueda del libro
    const libroEncontrado: Libro | undefined = libros.find(l => l.codigo === codigoSeleccionado);
    if (!libroEncontrado) {
        mostrarError("El libro seleccionado no es válido.");
        return;
    }

    // Validación 3: Cantidad menor o igual a cero
    if (isNaN(cantidad) || cantidad <= 0) {
        mostrarError("La cantidad debe ser mayor que cero.");
        return;
    }

    // Validación 4: Cantidad mayor que el stock disponible
    if (cantidad > libroEncontrado.stock) {
        mostrarError("La cantidad solicitada supera los ejemplares disponibles.");
        return;
    }

    // Procesar préstamo si las validaciones pasan
    const nuevoPrestamo: Prestamo = {
        codigoLibro: libroEncontrado.codigo,
        titulo: libroEncontrado.titulo,
        estudiante: nombreEstudiante,
        cantidad: cantidad
    };

    // Actualizar Stock
    libroEncontrado.stock -= cantidad;
    poblarSelectLibros(libros);

    // Registrar y renderizar
    prestamos.push(nuevoPrestamo);
    agregarFilaTabla(nuevoPrestamo);

    // Actualizar Totales y LocalStorage
    actualizarAcumuladoresYStorage(nuevoPrestamo);

    // Limpiar Formulario
    formPrestamo.reset();
});
// manejo dom y tabla
function agregarFilaTabla(p: Prestamo): void {
    const tr = document.createElement("tr");

    tr.innerHTML = `
        <td>${p.codigoLibro}</td>
        <td>${p.titulo}</td>
        <td>${p.estudiante}</td>
        <td>${p.cantidad}</td>
    `;

    tbodyPrestamos.appendChild(tr);
}

function mostrarError(mensaje: string): void {
    alertBox.textContent = mensaje;
    alertBox.classList.remove("hidden");
}

function ocultarError(): void {
    alertBox.textContent = "";
    alertBox.classList.add("hidden");
}

// ==========================================
// 6. ACUMULADORES Y LOCAL STORAGE
// ==========================================
function actualizarAcumuladoresYStorage(ultimoPrestamo: Prestamo): void {
    totalPrestamosCount += 1;
    totalEjemplaresCount += ultimoPrestamo.cantidad;

    // Actualizar vista
    txtTotalPrestamos.textContent = totalPrestamosCount.toString();
    txtTotalEjemplares.textContent = totalEjemplaresCount.toString();
    txtUltimoLibro.textContent = ultimoPrestamo.titulo;
    txtUltimoEstudiante.textContent = ultimoPrestamo.estudiante;

    // Guardar en LocalStorage
    const resumen: ResumenLocalStorage = {
        totalPrestamos: totalPrestamosCount,
        totalEjemplares: totalEjemplaresCount,
        ultimoLibro: ultimoPrestamo.titulo,
        ultimoEstudiante: ultimoPrestamo.estudiante
    };

    localStorage.setItem("resumenBiblioteca", JSON.stringify(resumen));
}

function recuperarResumenLocalStorage(): void {
    const dataGuardada = localStorage.getItem("resumenBiblioteca");
    if (!dataGuardada) return;

    try {
        const resumen: ResumenLocalStorage = JSON.parse(dataGuardada);

        totalPrestamosCount = resumen.totalPrestamos || 0;
        totalEjemplaresCount = resumen.totalEjemplares || 0;

        txtTotalPrestamos.textContent = totalPrestamosCount.toString();
        txtTotalEjemplares.textContent = totalEjemplaresCount.toString();
        txtUltimoLibro.textContent = resumen.ultimoLibro || "Ninguno";
        txtUltimoEstudiante.textContent = resumen.ultimoEstudiante || "Ninguno";
    } catch (e) {
        console.error("Error al parsear LocalStorage", e);
    }
}
