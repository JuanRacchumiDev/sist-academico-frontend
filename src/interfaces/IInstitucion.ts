export interface Institucion {
    id?: number
    nombre?: string
    sigla?: string
    ruc?: string
    ubicacion?: string
    telefono_contacto?: string
    logo_path?: string
    firma_digital?: string
    color_primario?: string
    estado?: boolean
}

export interface InstitucionResponse {
    result?: boolean
    message?: string
    data?: Institucion | Institucion[]
    error?: string
    status?: number
}