import { Persona } from "./IPersona"
import { DetalleParametro } from "./IDetalleParametro"
import { Programa } from "./IPrograma"

export interface Matricula {
    id?: number
    id_alumno?: number
    id_sede?: number
    id_programa?: number
    id_estadomatricula?: number
    id_evento?: number
    id_metodopago?: number
    nombre_alumno?: string
    nombre_sede?: string
    nombre_programa?: string
    nombre_evento?: string
    fecha_matricula?: string
    pago_inicial?: number
    monto?: number
    estado?: boolean
    alumno?: Persona
    sede?: DetalleParametro
    programa?: Programa
    estadoMatricula?: DetalleParametro
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