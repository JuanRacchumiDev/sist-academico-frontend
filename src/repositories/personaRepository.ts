import { Persona, PersonaResponse } from "@/interfaces/IPersona";
import apiClient from "./apiClient";

export const getAll = async (nombreGrupo: string): Promise<PersonaResponse> => {
    try {
        const urlApi = `/personas/grupo/${nombreGrupo}`

        const response = await apiClient.get(urlApi)

        console.log({ response })

        const { data: dataPersonas } = response

        console.log({ dataPersonas })

        const { result, data, message } = dataPersonas

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

export const getById = async (id: number): Promise<PersonaResponse> => {
    try {
        const urlApi = `${'/persona/'}${id}`

        console.log({ urlApi })

        const response = await apiClient.get(urlApi)

        console.log({ response })

        const { data: { result, message, data } } = response

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

export const create = async (payload: Persona): Promise<PersonaResponse> => {
    try {
        const response = await apiClient.post('/personas', payload)

        console.log({ response })

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

export const update = async (id: number, payload: Persona): Promise<PersonaResponse> => {
    try {
        const urlApi = `${'/persona/'}${id}`

        const response = await apiClient.patch(urlApi, payload)

        console.log({ response })

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