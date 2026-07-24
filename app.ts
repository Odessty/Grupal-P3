interface Libro {
    codigoLibro: string;
    titulo:string;
    disponibles:number;
}

interface Prestamo {
    codigoLibro: number;
    titulo: string;
    estudiante: string;
    cantidad: number;
}

interface Estudiante {
    nombre:string
}
