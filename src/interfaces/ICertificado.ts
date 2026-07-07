import { DetalleParametro } from "./IDetalleParametro"
import { Institucion } from "./IInstitucion"
import { Persona } from "./IPersona"
import { Plantilla } from "./IPlantilla"
import { Programa } from "./IPrograma"

export interface Certificado {
    id?: number
    id_persona?: number
    id_tipocertificado?: number
    id_institucion?: number
    id_plantilla?: number
    id_programa?: number
    codigo_verificacion?: string
    codigo_qr_path?: string
    path_file?: string
    filename?: string
    nombre_impresion?: string
    estado?: boolean
    persona?: Persona
    tipoCertificado?: DetalleParametro
    institucion?: Institucion
    plantilla?: Plantilla
    programa?: Programa
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