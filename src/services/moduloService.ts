import { Modulo } from "../interfaces/IModulo"
import {
    getAllPaginate,
    getById,
    getByPrograma,
    create,
    createMultiple,
    updateMultiple
} from "../repositories/moduloRepository"

export const getModulosPaginate = async (
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

export const getModuloById = async (id: number) => {
    const response = await getById(id)

    return {
        ...response
    }
}

export const getModulosByPrograma = async (idPrograma: number) => {
    const response = await getByPrograma(idPrograma)

    return {
        ...response
    }
}

export const createModulo = async (payload: Modulo) => {
    const response = await create(payload)

    return {
        ...response
    }
}

export const createModulosMultiple = async (idPrograma: number, modulos: Partial<Modulo>[]) => {
    const response = await createMultiple(idPrograma, modulos)

    return {
        ...response
    }
}

export const updateModulosMultiple = async (idPrograma: number, modulos: { id?: number; titulo: string }[]) => {
    const response = await updateMultiple(idPrograma, modulos)

    return {
        ...response
    }
}