import { Persona } from "../interfaces/IPersona"
import {
    getAll,
    getById,
    create,
    update
} from "../repositories/personaRepository"

export const getPersona = async (nombreGrupo: string) => {
    const response = await getAll(nombreGrupo)

    return {
        ...response
    }
}

export const getPersonaById = async (id: number) => {
    const response = await getById(id)

    return {
        ...response
    }
}

export const createPersona = async (payload: Persona) => {
    const response = await create(payload)

    return {
        ...response
    }
}

export const updatePersona = async (id: number, payload: Persona) => {
    const response = await update(id, payload)

    return {
        ...response
    }
}