import { Plantilla, PlantillaResponse } from "../interfaces/IPlantilla"
import apiClient from "./apiClient";
import { AxiosRequestConfig } from "axios";

export const getAll = async (queryParams: string): Promise<PlantillaResponse> => {
    try {
        const urlApi = `/plantillas?${queryParams}`

        console.log({ urlApi })

        const response = await apiClient.get(urlApi)

        console.log({ response })

        const { data: { success, data, message } } = response

        console.log('---- data plantillas ----')
        console.log({ data })

        return {
            result: success,
            data,
            message
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        console.log('errorMessage', errorMessage)
        return { result: false, data: [], error: errorMessage, status: 500 }
    }
}

export const create = async (payload: FormData | Plantilla, config?: AxiosRequestConfig): Promise<PlantillaResponse> => {
    try {
        const response = await apiClient.post('/plantillas', payload, config)

        const { data: { result, message, data } } = response

        return {
            result,
            message,
            data
        }

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        console.log('errorMessage', errorMessage)
        return { result: false, data: [], error: errorMessage, status: 500 }
    }
}