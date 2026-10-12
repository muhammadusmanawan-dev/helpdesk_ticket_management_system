
const API_BASE_URL = 'http://127.0.0.1:8000'

export async function getCurrentUser(token) {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
        },
    })

    if (!response.ok) {
        throw new Error(
            `Failed to fetch current user: ${response.status}`
        )
    }

    return response.json()
}

export async function loginUser(email, password) {
    const formData = new URLSearchParams()

    formData.append('username', email)
    formData.append('password', password)
    formData.append('grant_type', 'password')

    let response

    try {
        response = await fetch(
            `${API_BASE_URL}/users/auth/jwt/login`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Accept: 'application/json',
                },
                body: formData,
            }
        )
    } catch {
        throw new Error(
            'CORS issue occuring or backend error'
        )
    }

    const data = await response.json()

    if (!response.ok) {
        throw new Error(
            typeof data.detail === 'string'
                ? data.detail
                : 'Login failed. Please check your credentials.'
        )
    }

    sessionStorage.setItem('access_token', data.access_token)

    return data
}

export function getAccessToken() {
    return sessionStorage.getItem('access_token')
}

export function logoutUser() {
    sessionStorage.removeItem('access_token')
}
