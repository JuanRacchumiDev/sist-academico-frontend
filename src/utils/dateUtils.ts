import { parse, isValid } from "date-fns"

export const parseDate = (dateStr: string | null | undefined): Date => {
    if (!dateStr) return new Date()

    const parsed = parse(dateStr, "dd-MM-yyyy", new Date());

    return isValid(parsed) ? parsed : new Date();
}

export const formatDate = (dateString: string | Date | null | undefined): string => {
    let date = null

    if (!dateString) return "--/--/--"

    if (typeof dateString === "string") date = new Date(dateString)

    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) return "--/--/--"

    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()

    return `${day}/${month}/${year}`
}