import { Persona } from "./IPersona"
import { DetalleParametro } from "./IDetalleParametro"
import { Institucion } from "./IInstitucion"
import { DetalleMatricula } from "./IDetalleMatricula";
import { Programa } from "./IPrograma";

export interface MatriculaDetalle {
    id: number;
    id_matricula: number;
    id_programa: number;
    nombre_programa: string;
    nombre_alumno: string;
    promedio: number | null;
    estado: boolean;
    programa?: Programa
}

export interface Matricula {
    id?: number
    id_persona?: number
    id_estadomatricula?: number
    id_institucion?: number
    fecha_matricula?: string
    fecha_retiro?: string
    fecha_reserva?: string
    fecha_anula?: string
    user_crea?: string
    user_actualiza?: string
    user_elimina?: string
    estado?: boolean

    // Datos de matrícula
    monto_matricula?: number
    id_formapago_matricula?: number
    numero_operacion_matricula?: string
    monto_efectivo_matricula?: number
    monto_operacion_matricula?: number

    // Datos de módulo
    numero_modulos?: number
    monto_modulo?: number
    id_formapago_modulo?: number
    numero_operacion_modulo?: string
    monto_efectivo_modulo?: number
    monto_operacion_modulo?: number

    detalles?: MatriculaDetalle[]
    programas?: number[]

    persona?: Persona
    estadoMatricula?: DetalleParametro
    institucion?: Institucion
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