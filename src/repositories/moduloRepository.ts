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

// export const update = async (id: number, payload: Evento): Promise<EventoResponse> => {
//     try {
//         const urlApi = `${'/eventos/'}${id}`

//         const response = await apiClient.patch(urlApi, payload)

//         console.log({ response })

//         const { data: { result, data, message, error, status } } = response

//         return {
//             result,
//             data,
//             message,
//             error,
//             status
//         }
//     } catch (error) {
//         const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
//         console.log('errorMessage', errorMessage)
//         return { result: false, data: [], error: errorMessage, status: 500 }
//     }
// }