import { DetalleParametro, DetalleParametroFilters } from '@/interfaces/IDetalleParametro'
import {
    getAll,
    getAllFiltered,
    getById,
    create,
    update,
    updateEstado
} from '../repositories/detalleParametroRepository'

export const getDetalle = async (
    page?: number,
    limit?: number,
    clase?: string,
    filters?: {}
) => {
    console.log({ page })
    console.log({ limit })
    console.log({ clase })
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

    const response = await getAll(clase, queryParams)

    console.log({ response })

    return {
        ...response
    }
}

export const getDetalleFiltered = async (filters: DetalleParametroFilters) => {
    console.log('filters getDetalleFiltered', filters)

    const response = await getAllFiltered(filters)

    return {
        ...response
    }
}

export const getDetalleById = async (clase: string, id: number) => {
    const response = await getById(clase, id)

    return {
        ...response
    }
}

export const createDetalle = async (clase: string, payload: DetalleParametro) => {
    const response = await create(clase, payload)
    console.log('response createDetalle')
    console.log({ response })

    return {
        ...response
    }
}

export const updateDetalle = async (clase: string, id: number, payload: DetalleParametro) => {
    const response = await update(clase, id, payload)

    return {
        ...response
    }
}

export const updateDetalleByEstado = async (clase: string, id: string, payload: DetalleParametro) => {
    const response = await updateEstado(clase, id, payload)

    return {
        ...response
    }
}