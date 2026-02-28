import { Persona } from "./IPersona"
import { DetalleParametro } from "./IDetalleParametro"
// import { Programa } from "./IPrograma"

export interface MatriculaDetalle {
    id: number;
    id_matricula: number;
    id_programa: number;
    id_alumno: number;
    nombre_programa: string;
    nombre_alumno: string;
    promedio: number | null;
    estado: boolean;
}

export interface Matricula {
    id?: number
    id_alumno?: number
    id_sede?: number
    programas?: number[]
    // id_programa?: number
    // id_formapago?: number
    // id_estadopago?: number
    id_metodopago?: number
    id_estadomatricula?: number
    // id_evento?: number
    // id_metodopago?: number
    nombre_alumno?: string
    nombre_sede?: string
    nombre_metodopago?: string
    nombre_estadomatricula?: string
    // nombre_formapago?: string
    // nombre_estadomatricula?: string
    // nombre_programa?: string
    // nombre_evento?: string
    monto_matricula?: number
    monto_modulo?: number
    numero_modulos?: number
    fecha_matricula?: string
    fecha_retiro?: string
    fecha_reserva?: string
    fecha_anula?: string
    // pago_inicial?: number
    // numero_operacion?: string

    estado?: boolean

    alumno?: Persona
    sede?: DetalleParametro
    // programa?: Programa
    // formaPago?: DetalleParametro
    // estadoPago?: DetalleParametro
    metodoPago?: DetalleParametro
    estadoMatricula?: DetalleParametro
    detalles?: MatriculaDetalle[]
}

export interface MatriculaResponse {
    result?: boolean
    message?: string
    data?: Matricula | Matricula[]
    error?: string
    status?: number
    pagination?: PaginationType
    code?: string
}

export interface PaginationType {
    currentPage: number
    limit: number
    totalPages: number
    totalItems: number
    nextPage: number | null
    previousPage: number | null
}

export interface MatriculaPaginateResponse {
    result: boolean
    message?: string
    data?: Matricula[]
    errors?: string
    status?: number
    pagination?: PaginationType
}