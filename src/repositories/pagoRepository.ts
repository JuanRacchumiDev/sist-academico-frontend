import apiClient from "./apiClient";
import { Pago, PagoResponse } from "@/interfaces/IPago";
import { padString } from "../utils/stringUtils"

export const getAllPaginate = async (queryParams: string): Promise<PagoResponse> => {
    try {
        const urlApi = `/pagos/paginate?${queryParams}`

        console.log({ urlApi })

        const response = await apiClient.get(urlApi)

        const { data: dataPagos } = response

        console.log({ dataPagos })

        const { result, data, message } = dataPagos

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

export const getById = async (id: number): Promise<PagoResponse> => {
    try {
        const urlApi = `${'/pagos/'}${id}`

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

// export const getFicha = async (idMatricula: number) => {
//     try {
//         const urlApi = `/matriculas/ficha?id_matricula=${idMatricula}`

//         console.log({ urlApi })

//         const response = await apiClient.get(urlApi, {
//             responseType: 'blob'
//         });

//         // La respuesta contiene el archivo PDF en forma de Blob
//         const fileBlob = response.data;

//         // El nombre del archivo puede venir en los headers, si el backend lo envía
//         const contentDisposition = response.headers['content-disposition'];
//         let filename = `ficha_matricula_${idMatricula}.pdf`; // Nombre por defecto

//         if (contentDisposition) {
//             // Intenta extraer el nombre del archivo del header 'Content-Disposition'
//             const filenameMatch = contentDisposition.match(/filename="(.+)"/i);
//             if (filenameMatch && filenameMatch[1]) {
//                 filename = filenameMatch[1];
//             }
//         }

//         return {
//             result: true,
//             data: fileBlob, // Retornamos el Blob
//             filename: filename, // Retornamos el nombre del archivo
//             message: "Ficha PDF recibida exitosamente."
//         };
//     } catch (error) {
//         const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
//         console.log('errorMessage', errorMessage)
//         return { result: false, data: [], error: errorMessage, status: 500 }
//     }
// }

// export const getCertificado = async (queryParams: string) => {
//     try {
//         const urlApi = `/matriculas/certificado?${queryParams}`

//         console.log({ urlApi })

//         const response = await apiClient.get(urlApi, {
//             responseType: 'blob'
//         });

//         const fileBlob = response.data

//         // El nombre del archivo puede venir en los headers, si el backend lo envía
//         const contentDisposition = response.headers['content-disposition'];

//         const params = new URLSearchParams(queryParams);

//         // Obtenemos los valores y los convertimos a número
//         const id_m = Number(params.get('id_matricula')) || 0;
//         const id_a = Number(params.get('id_alumno')) || 0;
//         const id_p = Number(params.get('id_programa')) || 0;

//         // Aplicamos el padding usando tu utilitario stringUtils
//         const mId = padString(4, id_m, 'left');
//         const aId = padString(4, id_a, 'left');
//         const pId = padString(4, id_p, 'left');

//         // let filename = `certificado.pdf`; // Nombre por defecto
//         let filename = `certificado_${mId}_${aId}_${pId}.pdf`;

//         if (contentDisposition) {
//             // Intenta extraer el nombre del archivo del header 'Content-Disposition'
//             const filenameMatch = contentDisposition.match(/filename="(.+)"/i);
//             if (filenameMatch && filenameMatch[1]) {
//                 filename = filenameMatch[1];
//             }
//         }

//         return {
//             result: true,
//             data: fileBlob, // Retornamos el Blob
//             filename: filename, // Retornamos el nombre del archivo
//             message: "Certificado generado exitosamente."
//         };

//     } catch (error) {
//         const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
//         console.log('errorMessage', errorMessage)
//         return { result: false, data: [], error: errorMessage, status: 500 }
//     }
// }

export const getMatricula = async (queryParams: string) => {
    try {
        const urlApi = `/pagos/matricula?${queryParams}`

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
        const id_a = Number(params.get('id_alumno')) || 0;

        // Aplicamos el padding usando tu utilitario stringUtils
        const mId = padString(4, id_m, 'left');
        const aId = padString(4, id_a, 'left');

        let filename = `pago_matricula_${mId}_${aId}.pdf`;

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
            message: "Constancia de pago de matrícula generado exitosamente."
        };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        console.log('errorMessage', errorMessage)
        return { result: false, data: [], error: errorMessage, status: 500 }
    }
}

export const create = async (payload: Pago): Promise<PagoResponse> => {
    try {
        const response = await apiClient.post('/pagos', payload)

        console.log('response create pagoRepository')
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