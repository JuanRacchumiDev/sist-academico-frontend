import axios, { AxiosError } from 'axios'

// Crea una instancia de axios con la URL base
const apiClient = axios.create({
    baseURL: "http://3.15.34.71/sistema-academico/api/v1",
    // baseURL: "http://sistacademico-ipede/api/v1",
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

apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        // Verifica si el error es 401 (Unauthorized)
        if (error.response && error.response.status === 401) {
            console.error('Error 401 detectado. Redirigiendo al login...');

            localStorage.removeItem('auth');

            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
)

export default apiClient