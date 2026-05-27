import { Institucion, InstitucionResponse } from "../interfaces/IInstitucion"
import apiClient from "./apiClient"

export const getAll = async (): Promise<InstitucionResponse> => {
    try {
        const response = await apiClient.get('/instituciones')

        const { data: { result, data, message } } = response

        return {
            result,
            data,
            message
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        console.log('errorMessage', errorMessage)
        return { result: false, data: [], error: errorMessage, status: 500 }
    }
}