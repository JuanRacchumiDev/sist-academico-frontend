import { Certificado } from "../interfaces/ICertificado"
import {
    getAll,
    getAllPaginate,
    getById,
    create,
    createModular,
    preview,
    generate,
    destroy
} from "../repositories/certificadoRepository"

export const getCertificados = async () => {
    const response = await getAll()

    return {
        ...response
    }
}

export const getCertificadosPaginate = async (
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

export const getCertificadosById = async (id: number) => {
    const response = await getById(id)

    return {
        ...response
    }
}

export const createCertificado = async (payload: Certificado) => {
    const response = await create(payload)

    return {
        ...response
    }
}

export const createCertificadoModular = async (payload: Certificado) => {
    const response = await createModular(payload)

    return {
        ...response
    }
}

export const viewCertificado = async (id: number) => {
    const response = await preview(id)

    return {
        ...response
    }
}

/**
 * Descarga el PDF del certificado por su ID
 */
export const downloadCertificado = async (id: number): Promise<void> => {
    const response = await generate(id);

    if (!response.result || !response.data) {
        throw new Error(response.error || "No se pudo descargar el certificado.");
    }

    // Crear objeto Blob e iniciar la descarga en el navegador
    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", response.filename);
    document.body.appendChild(link);
    link.click();

    // Limpieza de recursos de la ventana
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
};

export const deleteCertificado = async (id: number) => {
    const response = await destroy(id);

    console.log("---- response deleteCertificado service ----", { response });

    return {
        ...response,
    };
};