import { DetalleParametro, DetalleParametroFilters } from '@/interfaces/IDetalleParametro'
import {
    getAll,
    getAllFiltered,
    getById,
    create,
    update,
    updateEstado
} from '../repositories/detalleParametroRepository'

export const getDetalle = async (clase: string) => {
    const response = await getAll(clase)

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