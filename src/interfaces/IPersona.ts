import { DetalleParametro } from "./IDetalleParametro"

export interface Persona {
    id?: number
    id_tipodocumento?: number
    numero_documento?: string
    nombres?: string
    apellido_paterno?: string
    apellido_materno?: string
    nombre_completo?: string
    departamento?: string
    provincia?: string
    distrito?: string
    direccion?: string
    direccion_completa?: string
    email?: string
    telefono?: string
    ubigeo_reniec?: string
    ubigeo_sunat?: string
    ubigeo?: string
    fecha_nacimiento?: string
    estado_civil?: string
    foto?: string
    sexo?: string
    origen?: string
    nombre_grupo?: string
    estado?: boolean
    tipo_documento?: DetalleParametro
}

export interface PersonaResponse {
    result?: boolean
    message?: string
    data?: Persona | Persona[]
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

export interface PersonaPaginateResponse {
    result: boolean
    data?: Persona[]
    pagination?: Pagination
    errors?: string
    status?: number
}