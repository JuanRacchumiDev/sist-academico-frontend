/**
 * Rellena un cadena con un caracted específico (por defecto '0')
 * hasta alcanzar una longitud dada, por la izquierda o por la derecha
 * @param {number} length - La longitud final deseada de la cadena
 * @param {number} value - El valor a rellenar
 * @param {string} direction - Dirección del relleno ('left' o 'right')
 * @param {string} char - El caracter de relleno
 * @returns {string} - La cadena rellenada
 */
export const padString = (
    length: number,
    value: number,
    direction: string,
    char: string = '0'
) => {
    const strValue: string = String(value)

    if (direction === 'left') {
        return strValue.padStart(length, char)
    } else if (direction === 'right') {
        return strValue.padEnd(length, char)
    } else {
        console.error(`Dirección inválida: ${direction}. Debe ser 'left' o 'right' `)
        return strValue
    }
}

const cleanText = (text: string): string => {
    return text
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/ñ/g, "n")
        .replace(/[^a-z0-9]/g, "")
}

interface getFullname {
    nombres: string,
    apellidoPaterno: string,
    apellidoMaterno: string
}

export const generateUsername = ({
    nombres,
    apellidoPaterno,
    apellidoMaterno = ""
}: getFullname): string => {
    const nombresLimpios = cleanText(nombres)
    const primerNombre = cleanText(nombres.split(" ")[0] || "")
    const apePaterno = cleanText(apellidoPaterno)
    const apeMaterno = cleanText(apellidoMaterno)

    const MAX_LENGTH = 10

    // Regla 1: Inicial primer nombre + primer apellido
    const inicialNombre = primerNombre.charAt(0)
    let sugerencia = `${inicialNombre}${apePaterno}`

    if (sugerencia.length <= MAX_LENGTH && sugerencia.length > 1) {
        return sugerencia
    }

    // Regla 2: Inicial primer nombre + inicial primer apellido + segundo apellido
    if (apeMaterno) {
        const inicialApePaterno = apePaterno.charAt(0)
        sugerencia = `${inicialNombre}${inicialApePaterno}${apeMaterno}`

        if (sugerencia.length <= MAX_LENGTH) {
            return sugerencia;
        }
    }

    // Regla 3: Nombres + apellidos (truncado a 10 caracteres)
    const cadenaCompleta = `${primerNombre}${apePaterno}${apeMaterno}`;
    return cadenaCompleta.substring(0, MAX_LENGTH)
} 