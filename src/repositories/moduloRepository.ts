import { Modulo, ModuloResponse } from "@/interfaces/IModulo";
import apiClient from "./apiClient";

export const getAllPaginate = async (queryParams: string): Promise<ModuloResponse> => {
    try {
        const urlApi = `/modulos/paginate?${queryParams}`

        console.log({ urlApi })

        const response = await apiClient.get(urlApi)

        console.log({ response })

        const { data: dataModulos } = response

        const { result, data, message } = dataModulos

        const listaItems = data.data

        const paginationInfo = {
            currentPage: data.current_page,
            limit: data.per_page,
            totalPages: data.last_page,
            totalItems: data.total,
            nextPage: data.next_page_url,
            previousPage: data.prev_page_url
        };

        return {
            result,
            data: listaItems,
            message,
            pagination: paginationInfo
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        console.log('errorMessage', errorMessage)
        return { result: false, data: [], error: errorMessage, status: 500 }
    }
}

export const getById = async (id: number): Promise<ModuloResponse> => {
    try {
        const urlApi = `${'/modulos/'}${id}`

        console.log({ urlApi })

        const response = await apiClient.get(urlApi)

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

export const getByPrograma = async (idPrograma: number) => {
    try {
        const urlApi = `${'/programas/'}${idPrograma}`

        console.log({ urlApi })

        console.log('---- response moduloRepository ----')

        const response = await apiClient.get(urlApi)

        console.log({ response })

        const { data: { result, message, data } } = response

        console.log({ data })

        const modulosAsociados = data?.detalle_modulos || [];

        return {
            result,
            data: modulosAsociados as Modulo[],
            message: message || "Módulos cargados correctamente"
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        console.log('errorMessage', errorMessage)
        return {
            result: false,
            data: [],
            error: errorMessage,
            status: error.response.status || 500
        }
    }
}

export const createMultiple = async (idPrograma: number, modulos: Partial<Modulo>[]): Promise<ModuloResponse> => {
    try {
        const urlApi = `${'/programas/'}${idPrograma}${'/actualizar-modulos'}`
        console.log({ urlApi })

        const response = await apiClient.post(urlApi, {
            modulos: modulos
        })

        console.log('---- response moduloRepository ----')
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

export const create = async (payload: Modulo): Promise<ModuloResponse> => {
    try {
        const response = await apiClient.post('/modulos', payload)

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

export const updateMultiple = async (idPrograma: number, modulos: Partial<Modulo>[]): Promise<ModuloResponse> => {
    try {
        const urlApi = `${'/programas/'}${idPrograma}${'/actualizar-modulos'}`
        console.log({ urlApi })

        const response = await apiClient.post(urlApi, {
            modulos: modulos
        })

        console.log('---- response moduloRepository ----')
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