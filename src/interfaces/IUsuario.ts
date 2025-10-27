import { DetalleParametro } from "./IDetalleParametro"
import { Persona } from "./IPersona"

export interface Usuario {
    id?: number
    name?: string
    email?: string
    password?: string
    remember_token?: string
    id_perfil?: number
    id_persona?: number
    perfil?: DetalleParametro
    persona?: Persona
}

export interface UsuarioResponse {
    result?: boolean
    message?: string
    data?: Usuario | Usuario[]
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

export interface UsuarioPaginateResponse {
    result: boolean
    data?: Usuario[]
    pagination?: Pagination
    errors?: string
    status?: number
}