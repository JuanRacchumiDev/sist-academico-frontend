import { Institucion, InstitucionResponse } from "../interfaces/IInstitucion"
import apiClient from "./apiClient"

export const getAll = async (queryParams: string): Promise<InstitucionResponse> => {
    try {
        const urlApi = `/instituciones?${queryParams}`

        console.log({ urlApi })

        const response = await apiClient.get(urlApi)

        console.log('response getAll institucionRepository', response)

        const { data: { result, data, message, error, status } } = response

        return {
            result,
            data,
            message,
            error,
            status
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        console.log('errorMessage', errorMessage)
        return { result: false, data: [], error: errorMessage, status: 500 }
    }
}