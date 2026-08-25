import {
    getAll
} from "../repositories/institucionRepository"

export const getInstituciones = async (queryParams: string) => {
    console.log('getInstituciones queryParams', queryParams)

    const response = await getAll(queryParams)

    return {
        ...response
    }
}