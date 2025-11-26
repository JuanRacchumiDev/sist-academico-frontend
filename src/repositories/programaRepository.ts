import { Programa, ProgramaResponse } from "@/interfaces/IPrograma";
import apiClient from "./apiClient";
import { AxiosRequestConfig } from "axios";

export const getAll = async (): Promise<ProgramaResponse> => {
    try {
        const urlApi = `/programas`

        const response = await apiClient.get(urlApi)

        console.log({ response })

        const { data: dataProgramas } = response

        console.log({ dataProgramas })

        const { result, data, message } = dataProgramas

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

export const getAllPaginate = async (queryParams: string): Promise<ProgramaResponse> => {
    try {
        const urlApi = `/programas/paginate?${queryParams}`

        console.log({ urlApi })

        const response = await apiClient.get(urlApi)

        console.log({ response })

        const { data: dataProgramas } = response

        console.log({ dataProgramas })

        const { result, data, message } = dataProgramas

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

export const getById = async (id: number): Promise<ProgramaResponse> => {
    try {
        const urlApi = `${'/programas/'}${id}`

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

export const downloadPlan = async (id: number): Promise<void> => {
    try {
        const urlApi = `/programas/${id}/descargar-plan`

        const response = await apiClient.get(
            urlApi,
            {
                responseType: 'blob'
            }
        )

        // Crear un objeto a partir del blob
        const url = window.URL.createObjectURL(new Blob([response.data]));

        // Crear un enlace temporal para iniciar la descarga
        const link = document.createElement("a")
        link.href = url

        const contentDisposition = response.headers['content-disposition'];
        let fileName = `plan_programa_${id}.pdf`

        if (contentDisposition) {
            const matches = /filename="?(.+)"?/.exec(contentDisposition)
            if (matches && matches[1]) {
                fileName = matches[1]
            }
        }

        link.setAttribute('download', fileName)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
    } catch (error) {
        console.error("Error al descargar el plan:", error);
        // Podrías usar showToast aquí para notificar al usuario
        throw new Error("No se pudo descargar el archivo.");
    }
}

export const create = async (
    payload: FormData | Programa,
    config?: AxiosRequestConfig
): Promise<ProgramaResponse> => {
    try {
        const response = await apiClient.post('/programas', payload, config)

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

export const update = async (id: number, payload: Programa): Promise<ProgramaResponse> => {
    try {
        const urlApi = `${'/programas/'}${id}`

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