const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

async function handleResponse(response) {
    if (response.status === 204) {
        return null
    }

    const data = await response.json().catch(() => null)
    if (!response.ok) {
        throw new Error(
            `Request failed: ${response.status} - ${typeof data?.detail === 'string'
                ? data.detail
                : 'Unknown error'
            }`
        )
    }

    return data
}

export async function getCurrentUser() {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
        },
        credentials: 'include',
    })

    return handleResponse(response)
}

export async function loginUser(email, password) {
    const formData = new URLSearchParams()
    formData.append('username', email)
    formData.append('password', password)
    formData.append('grant_type', 'password')

    let response

    try {
        response = await fetch(`${API_BASE_URL}/users/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Accept: 'application/json',
            },
            credentials: 'include',
            body: formData,
        })
    } catch {
        throw new Error(
            'Could not connect to the backend. Check that FastAPI is running.'
        )
    }

    return handleResponse(response)
}

export async function logoutUser() {
    const response = await fetch(`${API_BASE_URL}/users/auth/logout`, {
        method: 'POST',
        credentials: 'include',
    })

    return handleResponse(response)
}
