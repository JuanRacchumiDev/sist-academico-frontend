import { DetalleParametro } from "./IDetalleParametro"

export interface Programa {
    id?: number
    id_segmento?: string
    id_tipoprograma?: string
    codigo_old?: string
    sigla?: string
    nombre?: string
    duracion?: string
    modulos?: number
    creditos?: number
    plan?: File | null | undefined
    is_vigente?: boolean
    estado?: boolean
    modalidad?: string
    valor_cuota?: number
    segmento?: DetalleParametro
    tipoPrograma?: DetalleParametro
}

export interface ProgramaResponse {
    result?: boolean
    message?: string
    data?: Programa | Programa[]
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

export interface ProgramaPaginateResponse {
    result: boolean
    message?: string
    data?: Programa[]
    errors?: string
    status?: number
    pagination?: PaginationType
}