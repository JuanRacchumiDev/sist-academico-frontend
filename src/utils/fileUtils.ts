export const downloadFile = (blob: Blob, filename: string) => {
    // Crea una URL para el blob
    const url = window.URL.createObjectURL(blob);
    // Crea un enlace temporal
    const a = document.createElement('a');
    a.href = url;
    // Configura el nombre del archivo
    a.download = filename;
    document.body.appendChild(a);
    // Simula el clic
    a.click();
    // Limpia
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}