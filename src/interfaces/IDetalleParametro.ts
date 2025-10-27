export interface DetalleParametro {
    codigo?: number
    nombre?: string
    nombre_url?: string
    descripcion?: string
    abreviatura?: string
    longitud?: number
    sistema?: boolean
    estado?: boolean
}

export interface DetalleParametroResponse {
    result?: boolean
    message?: string
    data?: DetalleParametro | DetalleParametro[]
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

export interface DetalleParametroPaginateResponse {
    result: boolean
    data?: DetalleParametro[]
    pagination?: Pagination
    errors?: string
    status?: number
}

export interface DetalleParametroFilters {
    parametro_clase?: number | number[],
    en_persona?: boolean
    en_empresa?: boolean
    visible?: boolean
    estado?: boolean
}