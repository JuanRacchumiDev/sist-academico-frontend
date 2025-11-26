import { AxiosRequestConfig } from "axios"
import { Programa } from "../interfaces/IPrograma"
import {
    getAll,
    getAllPaginate,
    getById,
    create,
    update,
    downloadPlan
} from "../repositories/programaRepository"

export const getProgramas = async () => {
    const response = await getAll()

    return {
        ...response
    }
}

export const getProgramasPaginate = async (
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

export const getProgramaById = async (id: number) => {
    const response = await getById(id)

    return {
        ...response
    }
}

export const downloadProgramaPlan = async (id: number): Promise<void> => {
    return downloadPlan(id)
}

export const createPrograma = async (
    payload: FormData | Programa,
    config?: AxiosRequestConfig

) => {
    const response = await create(payload, config)

    return {
        ...response
    }
}

export const updatePrograma = async (id: number, payload: Programa) => {
    const response = await update(id, payload)

    return {
        ...response
    }
}