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