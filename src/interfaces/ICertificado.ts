import { DetalleParametro } from "./IDetalleParametro"
import { Evento } from "./IEvento"
import { Persona } from "./IPersona"

export interface Certificado {
    id?: number
    id_evento?: number
    id_persona?: number
    id_tipocertificado?: number
    id_plantilla?: number
    codigo?: string
    path_codigo_qr?: string
    path_file?: string
    filename?: string
    nombre_impresion?: string
    estado?: boolean
    evento?: Evento
    persona?: Persona
    tipoCertificado?: DetalleParametro
}

export interface CertificadoResponse {
    result?: boolean
    message?: string
    data?: Certificado | Certificado[]
    error?: string
    status?: number
}

export interface Pagination {
    currentPage: number
    limit: number
    totalPages: number
    totalItems: number
    nextPage: number | null
    previousPage: number | null
}

export interface CertificadoPaginateResponse {
    result: boolean
    data?: Certificado[]
    pagination?: Pagination
    errors?: string
    status?: number
}