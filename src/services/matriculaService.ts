import { Matricula } from "../interfaces/IMatricula"
import {
    getAllPaginate,
    getById,
    getFicha,
    getCertificado,
    create
} from "../repositories/matriculaRepository"

export const getMatriculas = async (
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
    id_alumno: number,
    id_programa: number
) => {
    const queryParams = new URLSearchParams({
        id_matricula: id_matricula.toString(),
        id_alumno: id_alumno.toString(),
        id_programa: id_programa.toString()
    }).toString()

    const response = await getCertificado(queryParams)

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