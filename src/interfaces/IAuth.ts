export interface UserAuthenticated {
    id_usuario?: number
    id_persona?: number
    id_perfil?: number
    nombre_completo?: string
    nombre_perfil?: string
    slug_perfil?: string
}

export interface AuthData {
    usuario: UserAuthenticated
}