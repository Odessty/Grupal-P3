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

