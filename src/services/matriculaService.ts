import { Matricula } from "../interfaces/IMatricula"
import {
    getAll,
    getAllPaginate,
    getById,
    getFicha,
    getCertificado,
    getCrogramaPagos,
    getModulosPorPagar,
    getModulosPagados,
    create,
    update
} from "../repositories/matriculaRepository"

export const getMatriculas = async () => {
    const response = await getAll()

    return {
        ...response
    }
}

export const getMatriculasPaginate = async (
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

export const getMatriculaById = async (id: number) => {
    const response = await getById(id)

    return {
        ...response
    }
}

export const getFichaById = async (id: number) => {
    const response = await getFicha(id)

    return {
        ...response
    }
}

export const getCertificadoByParams = async (
    id_matricula: number,
    id_programa: number
) => {
    const queryParams = new URLSearchParams({
        id_matricula: id_matricula.toString(),
        id_programa: id_programa.toString()
    }).toString()

    const response = await getCertificado(queryParams)

    return {
        ...response
    }
}

export const getCronogramaPagosByParams = async (
    id_matricula: number
) => {
    const queryParams = new URLSearchParams({
        id_matricula: id_matricula.toString()
    }).toString()

    const response = await getCrogramaPagos(queryParams)

    return {
        ...response
    }
}

export const getModulosPendientes = async (id: number) => {
    const response = await getModulosPorPagar(id);

    return {
        ...response
    }
}

export const getModulosCancelados = async (id: number) => {
    const response = await getModulosPagados(id);

    return {
        ...response
    }
}

export const createMatricula = async (payload: Matricula) => {
    const response = await create(payload)

    return {
        ...response
    }
}

export const updateMatricula = async (id: number, payload: Matricula) => {
    const response = await update(id, payload)

    return {
        ...response
    }
}