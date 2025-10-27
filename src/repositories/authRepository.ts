import { TAuthResponse } from "../types/TAuthResponse";
import apiClient from "./apiClient";

export const login = async (email: string, password: string): Promise<TAuthResponse> => {
    try {
        const credenciales: { email: string, password: string } = {
            email,
            password
        }

        // console.log({ credenciales })

        const response = await apiClient.post('/auth/login', credenciales)

        console.log('response authReposit')
        console.log({ response })

        const { data: dataAuth, status: statusAuth } = response

        console.log({ dataAuth })

        const { access_token, result, error, message, usuario } = dataAuth

        if (statusAuth === 200) {
            if (result) {
                localStorage.setItem('auth', JSON.stringify(
                    {
                        access_token,
                        usuario
                    }
                ))
            }

            return {
                result,
                message,
                error,
                status: statusAuth
            }
        }

        return {
            result: false,
            status: statusAuth,
            message: message || "Error al iniciar sesión"
        }

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error de inicio de sesión'
        console.log('errorMessage', errorMessage)
        return { result: false, error: errorMessage, status: 500 }
    }
}

export const logout = async (id: number): Promise<TAuthResponse> => {
    try {
        const response = await apiClient.post('/auth/logout', { id })

        console.log('logout authRepository')
        console.log({ response })

        const { data: { result, status, message, error } } = response

        if (result && status === 200) {
            localStorage.removeItem('auth')

            return {
                result,
                status,
                message,
                error
            }
        }

        return {
            result,
            status,
            message: message || "Error al cerrar sesión",
            error
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error de inicio de sesión'
        console.log('errorMessage', errorMessage)
        return { result: false, error: errorMessage, status: 500 }
    }
}