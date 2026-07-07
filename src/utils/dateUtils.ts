import { TIMEZONE_AMERICA_LIMA } from "@/params/constants"
import { parse, isValid } from "date-fns"
import { toDate, formatInTimeZone } from "date-fns-tz"

export const parseDate = (dateStr: string | null | undefined): Date => {
    if (!dateStr) return new Date()

    if (dateStr.includes("-") && dateStr.split("-")[0].length === 4) {
        return toDate(`${dateStr}T00:00:00`, { timeZone: TIMEZONE_AMERICA_LIMA })
    }

    const parsed = parse(dateStr, "dd-MM-yyyy", new Date());

    return isValid(parsed) ? parsed : new Date();
}

export const formatDate = (dateString: string | Date | null | undefined): string => {
    if (!dateString) return "--/--/--"

    let date: Date

    if (typeof dateString === "string") {
        const cleanStr = dateString.includes("T") ? dateString : `${dateString}T00:00:00`
        date = toDate(cleanStr, { timeZone: TIMEZONE_AMERICA_LIMA })
    } else {
        date = dateString
    }

    if (isNaN(date.getTime())) return "--/--/--";

    return formatInTimeZone(date, TIMEZONE_AMERICA_LIMA, "dd/MM/yyyy");

    // if (typeof dateString === "string") date = new Date(dateString)

    // // Verificar si la fecha es válida
    // if (isNaN(date.getTime())) return "--/--/--"

    // const day = String(date.getDate()).padStart(2, '0')
    // const month = String(date.getMonth() + 1).padStart(2, '0')
    // const year = date.getFullYear()

    // return `${day}/${month}/${year}`
}