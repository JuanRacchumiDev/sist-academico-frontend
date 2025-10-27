import {
    login,
    logout
} from '../repositories/authRepository'

export const loginAuth = async (email: string, password: string) => {
    const response = await login(email, password)

    return {
        ...response
    }
}

export const logoutAuth = async (id: number) => {
    const response = await logout(id)

    return {
        ...response
    }
}