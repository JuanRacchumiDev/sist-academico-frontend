import apiClient from "./apiClient";
import { Matricula, MatriculaResponse } from "@/interfaces/IMatricula";
import { padString } from "../utils/stringUtils"
import { ModulosPorPagarResponse, ModulosPagadosResponse } from "@/interfaces/IPago";

export const getAll = async (): Promise<MatriculaResponse> => {
    try {
        const urlApi = `/matriculas`

        const response = await apiClient.get(urlApi)

        console.log({ response })

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

export const getAllPaginate = async (queryParams: string): Promise<MatriculaResponse> => {
    try {
        const urlApi = `/matriculas/paginate?${queryParams}`

        console.log({ urlApi })

        const response = await apiClient.get(urlApi)

        console.log({ response })

        const { data: { result, data, message } } = response

        const { current_page, per_page, last_page, total, next_page_url, prev_page_url } = data

        const paginationInfo = {
            currentPage: current_page,
            limit: per_page,
            totalPages: last_page,
            totalItems: total,
            nextPage: next_page_url,
            previousPage: prev_page_url
        };

        return {
            result,
            data: data.data,
            message,
            pagination: paginationInfo
        }
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
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        console.log('errorMessage', errorMessage)
        return { result: false, data: [], error: errorMessage, status: 500 }
    }
}

export const getCertificado = async (queryParams: string) => {
    try {
        const urlApi = `/matriculas/certificado?${queryParams}`

        console.log({ urlApi })

        const response = await apiClient.get(urlApi, {
            responseType: 'blob'
        });

        const fileBlob = response.data

        // El nombre del archivo puede venir en los headers, si el backend lo envía
        const contentDisposition = response.headers['content-disposition'];

        const params = new URLSearchParams(queryParams);

        // Obtenemos los valores y los convertimos a número
        const id_m = Number(params.get('id_matricula')) || 0;
        const id_p = Number(params.get('id_programa')) || 0;

        // Aplicamos el padding usando tu utilitario stringUtils
        const mId = padString(4, id_m, 'left');
        const pId = padString(4, id_p, 'left');

        // let filename = `certificado.pdf`; // Nombre por defecto
        let filename = `certificado_matricula_${mId}_programa_${pId}.pdf`;

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
            message: "Certificado generado exitosamente."
        };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        console.log('errorMessage', errorMessage)
        return { result: false, data: [], error: errorMessage, status: 500 }
    }
}

export const getCrogramaPagos = async (queryParams: string) => {
    try {
        const urlApi = `/matriculas/cronograma-pagos?${queryParams}`

        console.log({ urlApi })

        const response = await apiClient.get(urlApi, {
            responseType: 'blob'
        });

        const fileBlob = response.data

        // El nombre del archivo puede venir en los headers, si el backend lo envía
        const contentDisposition = response.headers['content-disposition'];

        const params = new URLSearchParams(queryParams);

        // Obtenemos los valores y los convertimos a número
        const id_m = Number(params.get('id_matricula')) || 0;

        // Aplicamos el padding usando tu utilitario stringUtils
        const mId = padString(4, id_m, 'left');

        // let filename = `certificado.pdf`; // Nombre por defecto
        let filename = `cronograma_pagos_matricula_${mId}.pdf`;

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
            message: "Cronograma de pagos generado exitosamente."
        };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        console.log('errorMessage', errorMessage)
        return { result: false, data: [], error: errorMessage, status: 500 }
    }
}

export const getModulosPorPagar = async (id: number): Promise<ModulosPorPagarResponse> => {
    try {
        const urlApi = `${'/matriculas/'}${id}${'/modulos-por-pagar'}`

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
        return {
            result: false,
            data: null,
            message: "Módulos por pagar no obtenidos",
            error: errorMessage,
            status: 500
        }
    }
}

export const getModulosPagados = async (id: number): Promise<ModulosPagadosResponse> => {
    try {
        const urlApi = `${'/matriculas/'}${id}${'/modulos-pagados'}`

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
        return {
            result: false,
            data: null,
            message: "Módulos por pagar no obtenidos",
            error: errorMessage,
            status: 500
        }
    }
}

export const create = async (payload: Matricula): Promise<MatriculaResponse> => {
    try {
        console.log('matriculaRepository method: create payload')
        console.log({ payload })

        const response = await apiClient.post('/matriculas', payload)

        console.log('response create matriculaRepository')
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

export const update = async (id: number, payload: Matricula): Promise<MatriculaResponse> => {
    try {
        const urlApi = `${'/matriculas/'}${id}`

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