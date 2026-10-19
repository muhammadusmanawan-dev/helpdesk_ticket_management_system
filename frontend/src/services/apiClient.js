
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

function getErrorMessage(data, status) {
    if (typeof data?.detail === 'string') {
        return data.detail
    }

    if (data?.detail !== undefined) {
        return JSON.stringify(data.detail)
    }

    return data?.message || `Request failed: ${status}`
}

export async function apiClient(
    path,
    {
        method = 'GET',
        headers = {},
        body,
        params,
        credentials = 'include',
    } = {}
) {
    const url = new URL(`${API_BASE_URL}${path}`)

    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                url.searchParams.set(key, String(value))
            }
        })
    }

    const requestHeaders = {
        Accept: 'application/json',
        ...headers,
    }

    let requestBody = body

    if (body !== undefined && body !== null && typeof body === 'object' && !(body instanceof URLSearchParams) && !(body instanceof FormData)) {
        requestHeaders['Content-Type'] ??= 'application/json'
        requestBody = JSON.stringify(body)
    }

    let response

    try {
        response = await fetch(url.toString(), {
            method,
            headers: requestHeaders,
            credentials,
            ...(requestBody !== undefined
                ? { body: requestBody }
                : {}),
        })
    } catch {
        throw new Error(
            'Could not connect to the backend. Check that FastAPI is running.'
        )
    }

    if (response.status === 204) {
        if (!response.ok) {
            throw new Error(`Request failed: ${response.status}`)
        }

        return null
    }

    const data = await response.json().catch(() => null)

    if (!response.ok) {
        throw new Error(
            `${getErrorMessage(data, response.status)}`
        )
    }

    return data
}
