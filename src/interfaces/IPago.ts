import { DetalleParametro } from "./IDetalleParametro"
import { Institucion } from "./IInstitucion"
import { Matricula } from "./IMatricula"
import { Modulo } from "./IModulo"

export interface Pago {
    id?: number
    id_matricula?: number
    id_modulo?: number
    id_estadopago?: number
    id_institucion?: number
    id_formapago?: number
    concepto?: string
    fecha_pago?: string
    fecha_vencimiento?: string
    cantidad?: number
    user_crea?: string
    user_actualiza?: string
    user_elimina?: string
    estado?: boolean

    matricula?: Matricula
    modulo?: Modulo
    estadoPago?: DetalleParametro
    institucion?: Institucion
    formaPago?: DetalleParametro
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