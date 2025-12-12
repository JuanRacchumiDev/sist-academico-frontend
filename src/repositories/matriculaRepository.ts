import { Matricula, MatriculaResponse } from "@/interfaces/IMatricula";
import apiClient from "./apiClient";

export const getAllPaginate = async (queryParams: string): Promise<MatriculaResponse> => {
    try {
        const urlApi = `/matriculas/paginate?${queryParams}`

        console.log({ urlApi })

        const response = await apiClient.get(urlApi)

        const { data: dataMatriculas } = response

        console.log({ dataMatriculas })

        const { result, data, message } = dataMatriculas

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

export const getById = async (id: number): Promise<MatriculaResponse> => {
    try {
        const urlApi = `${'/matriculas/'}${id}`

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

export const getFicha = async (idMatricula: number) => {
    try {
        const urlApi = `/matriculas/ficha?id_matricula=${idMatricula}`

        console.log({ urlApi })

        const response = await apiClient.get(urlApi, {
            responseType: 'blob'
        });

        // La respuesta contiene el archivo PDF en forma de Blob
        const fileBlob = response.data;
        
        // El nombre del archivo puede venir en los headers, si el backend lo envía
        const contentDisposition = response.headers['content-disposition'];
        let filename = `ficha_matricula_${idMatricula}.pdf`; // Nombre por defecto

        if (contentDisposition) {
            // Intenta extraer el nombre del archivo del header 'Content-Disposition'
            const filenameMatch = contentDisposition.match(/filename="(.+)"/i);
            if (filenameMatch && filenameMatch[1]) {
                filename = filenameMatch[1];
            }
        }

        return {
            result: true,
            data: fileBlob, // Retornamos el Blob
            filename: filename, // Retornamos el nombre del archivo
            message: "Ficha PDF recibida exitosamente."
        };
    } catch {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        console.log('errorMessage', errorMessage)
        return { result: false, data: [], error: errorMessage, status: 500 }
    }
}

export const create = async (payload: Matricula): Promise<MatriculaResponse> => {
    try {
        const response = await apiClient.post('/matriculas', payload)

        console.log('response create matriculaRepository')
        console.log({response})

        const { data: { success, message, data } } = response

        return {
            result: success,
            message,
            data
        }

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        console.log('errorMessage', errorMessage)
        return { result: false, data: [], error: errorMessage, status: 500 }
    }
}