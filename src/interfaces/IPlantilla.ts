export interface Plantilla {
    id?: number
    nombre?: string
    descripcion?: string
    path?: string
    estado?: boolean
}

export interface PlantillaResponse {
    result?: boolean
    message?: string
    data?: Plantilla | Plantilla[]
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

export interface PlantillaPaginateResponse {
    result: boolean
    data?: Plantilla[]
    pagination?: Pagination
    errors?: string
    status?: number
}