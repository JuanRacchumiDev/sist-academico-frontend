export interface UserAuthenticated {
    id?: number
    id_persona?: number
    id_perfil?: number
    name?: string
    email?: string
    nombre_perfil?: string
    nombre_completo?: string
    slug_perfil?: string
}

export interface AuthData {
    usuario: UserAuthenticated
}