import { AxiosRequestConfig } from "axios"
import { Plantilla } from "../interfaces/IPlantilla"
import {
    getAll,
    create
} from "../repositories/plantillaRepository"

export const getPlantillas = async (
    filters: Record<string, any>
) => {
    console.log({ filters })

    // Construir la cadena de query parameters
    const queryParams = new URLSearchParams(
        Object.fromEntries(
            Object.entries(filters).filter(([, value]) => value !== undefined && value !== null && value !== "")
        )
    ).toString()

    console.log({ queryParams })

    const response = await getAll(queryParams)

    console.log('---- response plantillaRepository ----')
    console.log({ response })

    return {
        ...response
    }
}

export const createPlantilla = async (
    payload: FormData | Plantilla,
    config?: AxiosRequestConfig
) => {
    const response = await create(payload, config)

    return {
        ...response
    }
}