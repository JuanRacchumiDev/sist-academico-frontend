import { DetalleParametro } from "./IDetalleParametro"
import { Matricula } from "./IMatricula"
import { Persona } from "./IPersona"
import { Programa } from "./IPrograma"

export interface Pago {
    id?: number
    id_matricula?: number
    id_programa?: number
    id_alumno?: number
    id_formapago?: number
    id_metodopago?: number
    id_estadopago?: number
    concepto?: string
    fecha_pago?: string
    nro_operacion?: string
    numero_modulo?: number
    monto_efectivo?: number
    monto_tarjeta?: number
    monto_total?: number
    monto_pagado?: number
    monto_saldo?: number
    estado?: boolean

    matricula?: Matricula
    programa?: Programa
    alumno?: Persona
    formaPago?: DetalleParametro
    metodoPago?: DetalleParametro
    estadoPago?: DetalleParametro
}

export interface PagoResponse {
    result?: boolean
    message?: string
    data?: Pago | Pago[]
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

export interface PagoPaginateResponse {
    result: boolean
    message?: string
    data?: Pago[]
    errors?: string
    status?: number
    pagination?: PaginationType
}