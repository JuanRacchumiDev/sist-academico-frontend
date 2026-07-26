import { Certificado } from "../interfaces/ICertificado"
import {
    getAll,
    getAllPaginate,
    getById,
    createModular,
    previewCertificado,
    generateCertificado
} from "../repositories/certificadoRepository"

export const getCertificados = async () => {
    const response = await getAll()

    return {
        ...response
    }
}

export const getCertificadosPaginate = async (
    page: number,
    limit: number,
    filters: {}
) => {
    console.log({ page })
    console.log({ limit })
    console.log({ filters })

    // Construir la cadena de query parameters
    const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...Object.fromEntries(
            Object.entries(filters).filter(([, value]) => value)
        )
    }).toString()

    console.log({ queryParams })

    const response = await getAllPaginate(queryParams)

    return {
        ...response
    }
}

export const getCertificadosById = async (id: number) => {
    const response = await getById(id)

    return {
        ...response
    }
}

export const createCertificadoModular = async (payload: Certificado) => {
    const response = await createModular(payload)

    return {
        ...response
    }
}

export const viewCertificado = async (id: number) => {
    const response = await previewCertificado(id)

    return {
        ...response
    }
}

export const downloadCertificado = async (id: number) => {
    const response = await generateCertificado(id)

    return {
        ...response
    }
}