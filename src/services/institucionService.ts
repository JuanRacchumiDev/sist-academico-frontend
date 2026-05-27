import {
    getAll
} from "../repositories/institucionRepository"

export const getInstituciones = async () => {
    const response = await getAll()

    return {
        ...response
    }
}