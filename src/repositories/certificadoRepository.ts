import apiClient from "./apiClient";
import { Certificado, CertificadoResponse } from "../interfaces/ICertificado"
import { padString } from "@/utils/stringUtils";

export const getAll = async (): Promise<CertificadoResponse> => {
    try {
        const urlApi = `/certificados`

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

export const getAllPaginate = async (queryParams: string): Promise<CertificadoResponse> => {
    try {
        const urlApi = `/certificados/paginate?${queryParams}`

        console.log({ urlApi })

        const response = await apiClient.get(urlApi)

        console.log({ response })

        const { data: { result, data, message, pagination } } = response

        return {
            result,
            data: data.data,
            message,
            pagination
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        console.log('errorMessage', errorMessage)
        return { result: false, data: [], error: errorMessage, status: 500 }
    }
}

export const getById = async (id: number): Promise<CertificadoResponse> => {
    try {
        const urlApi = `${'/certificados/'}${id}`

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

export const create = async (payload: Certificado): Promise<CertificadoResponse> => {
    try {
        console.log('certificadoRepository method: create')
        console.log({ payload })

        const response = await apiClient.post('/certificados', payload)

        console.log('response create certificadoRepository')
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

export const createModular = async (payload: Certificado): Promise<CertificadoResponse> => {
    try {
        console.log('certificadoRepository method: create payload')
        console.log({ payload })

        const response = await apiClient.post('/certificados/modular', payload)

        console.log('response create certificadoRepository')
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

export const preview = async (id: number) => {
    try {
        const urlApi = `${'/certificados/'}${id}/preview`

        window.open(urlApi, '_blank');
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        console.log('errorMessage', errorMessage)
        return { result: false, data: [], error: errorMessage, status: 500 }
    }
}

export const generate = async (id: number) => {
    try {
        const urlApi = `/certificados/${id}/download`

        const response = await apiClient.get(urlApi, {
            responseType: 'blob'
        });

        const fileBlob = response.data

        // El nombre del archivo puede venir en los headers, si el backend lo envía
        const contentDisposition = response.headers['content-disposition'];

        const idPadding = padString(4, id, 'left');

        let filename = `certificado_${idPadding}.pdf`

        if (contentDisposition) {
            // Intenta extraer el nombre del archivo del header 'Content-Disposition'
            const filenameMatch = contentDisposition.match(/filename="(.+)"/i);
            if (filenameMatch && filenameMatch[1]) {
                filename = filenameMatch[1]
            }
        }

        return {
            result: true,
            data: fileBlob,
            filename,
            message: "Certificado generado exitosamente"
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        console.log('errorMessage', errorMessage)
        return { result: false, data: [], error: errorMessage, status: 500 }
    }
}

export const destroy = async (id: number): Promise<CertificadoResponse> => {
    try {
        const urlApi = `/certificados/${id}`;
        const response = await apiClient.delete(urlApi);

        const { data: { result, message, data } } = response;

        return {
            result,
            message,
            data,
        };
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Error desconocido al eliminar";
        console.error("errorMessage", errorMessage);
        return { result: false, data: [], error: errorMessage, status: 500 };
    }
};