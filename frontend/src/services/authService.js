import { apiClient } from './apiClient'

export async function getCurrentUser() {
    return apiClient('/users/me')
}

export async function loginUser(email, password) {
    const formData = new URLSearchParams()

    formData.append('username', email)
    formData.append('password', password)
    formData.append('grant_type', 'password')

    return apiClient('/users/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
    })
}

export async function logoutUser() {
    return apiClient('/users/auth/logout', {
        method: 'POST',
    })
}
