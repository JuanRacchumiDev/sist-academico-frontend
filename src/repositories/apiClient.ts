import axios from 'axios'

// Crea una instancia de axios con la URL base
const apiClient = axios.create({
    // baseURL: import.meta.env.VITE_API_URL,
    baseURL: "http://sistacademico-ipede/api/v1",
    headers: {
        'Content-Type': 'application/json'
    }
});

// Agrega un interceptor a cada solicitud para incluir el token de autenticación
apiClient.interceptors.request.use(
    (config) => {
        try {
            const auth = JSON.parse(localStorage.getItem('auth') || '{}')
            const token = auth?.access_token
            if (token) {
                config.headers.Authorization = `Bearer ${token}`
            }
        } catch (err) {
            console.warn('Error al procesar el token de autenticación: ', err)
        }
        return config
    },
    (error) => Promise.reject(error)
)

export default apiClient