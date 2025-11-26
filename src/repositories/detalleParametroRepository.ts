import {
    DetalleParametro,
    DetalleParametroFilters,
    DetalleParametroResponse,
    DetalleParametroPaginateResponse
} from "@/interfaces/IDetalleParametro"
import apiClient from "./apiClient"

export const getAll = async (clase: string, queryParams: string): Promise<DetalleParametroPaginateResponse> => {
    try {
        const urlApi = `/catalogos/${clase}?${queryParams}`

        console.log({ urlApi })

        const response = await apiClient.get(urlApi)

        const { data: dataDetalle } = response

        const { result, data, message } = dataDetalle

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

        // return {
        //     result,
        //     data,
        //     message
        // }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        console.log('errorMessage', errorMessage)
        return { result: false, data: [], error: errorMessage, status: 500 }
    }
}

export const getAllFiltered = async (filters: DetalleParametroFilters): Promise<DetalleParametroResponse> => {
    try {
        const urlApi = `/catalogos`

        const response = await apiClient.get(urlApi, {
            params: filters
        })

        console.log('response getAllFiltered detalleParametroRepository', response)

        const { data: dataDetalle } = response

        const { result, data, message, error } = dataDetalle

        return {
            result,
            data,
            message,
            error,
            status: response.status
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        console.log('errorMessage', errorMessage)
        return { result: false, data: [], error: errorMessage, status: 500 }
    }
}

export const getById = async (clase: string, codigo: number): Promise<DetalleParametroResponse> => {
    try {
        const urlApi = `/catalogos/${clase}/${codigo}`

        console.log({ urlApi })

        const response = await apiClient.get(urlApi)

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

export const create = async (clase: string, payload: DetalleParametro): Promise<DetalleParametroResponse> => {
    try {
        const urlApi = `/catalogos/${clase}`

        const response = await apiClient.post(urlApi, payload)

        const { data: { result, message, status, code } } = response

        return {
            result,
            message,
            status,
            code
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        console.log('errorMessage', errorMessage)
        return {
            result: false,
            data: [],
            error: errorMessage,
            status: 500
        }
    }
}

export const update = async (clase: string, codigo: number, payload: DetalleParametro): Promise<DetalleParametroResponse> => {
    try {
        const urlApi = `${'/catalogos/'}${clase}/${codigo}`

        console.log({ urlApi })

        const response = await apiClient.patch(urlApi, payload)

        const { data: { result, data, message, error, status, code } } = response

        return {
            result,
            data,
            message,
            error,
            status,
            code
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        console.log('errorMessage', errorMessage)
        return { result: false, data: [], error: errorMessage, status: 500 }
    }
}

export const updateEstado = async (clase: string, codigo: string, payload: DetalleParametro): Promise<DetalleParametroResponse> => {
    try {
        const urlApi = `${'/catalogos/'}${clase}${'update-estado/'}${codigo}`

        const response = await apiClient.patch(urlApi, payload)

        const { data: { result, data, status, message, error } } = response

        return {
            result,
            data,
            status,
            message,
            error
        }

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        console.log('errorMessage', errorMessage)
        return { result: false, error: errorMessage, status: 500 }
    }
}