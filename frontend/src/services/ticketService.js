
const API_BASE_URL = 'http://127.0.0.1:8000'

function normalizeTicket(ticket) {
    return {
        ...ticket,
        priority: ticket.priority
            ? ticket.priority.charAt(0).toUpperCase() +
            ticket.priority.slice(1)
            : 'Low',

        status: ticket.status
            ? ticket.status
                .split('_')
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')
            : 'Open',

        customer: 'Customer',
    }
}

async function getErrorMessage(response) {
    try {
        const data = await response.json()

        if (typeof data.detail === 'string') {
            return data.detail
        }

        return JSON.stringify(data.detail ?? data)
    } catch {
        return `Request failed: ${response.status}`
    }
}

export async function getCustomerTickets(token) {
    const response = await fetch(
        `${API_BASE_URL}/tickets/?page=1&size=50`,
        {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${token}`,
            },
        }
    )

    if (!response.ok) {
        throw new Error(
            `Failed to fetch tickets: ${response.status} - ${await getErrorMessage(response)
            }`
        )
    }

    const data = await response.json()

    return data.items.map(normalizeTicket)
}

export async function createCustomerTicket(ticketData, token) {
    const response = await fetch(`${API_BASE_URL}/tickets/`, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(ticketData),
    })

    if (!response.ok) {
        throw new Error(
            `Failed to create ticket: ${response.status} - ${await getErrorMessage(response)
            }`
        )
    }

    const data = await response.json()

    return normalizeTicket(data)
}

export async function getTicketComments(ticketId, token) {
    const response = await fetch(
        `${API_BASE_URL} /tickets/${ticketId}/comments`,
        {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${token}`,
            },
        }
    )

    if (!response.ok) {
        throw new Error(
            `Failed to fetch comments: ${response.status} - ${await getErrorMessage(response)}`
        )
    }

    return response.json()
}

export async function createTicketComment(ticketId, content, token) {
    const response = await fetch(
        `${API_BASE_URL}/tickets/${ticketId}/comments`,
        {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ content }),
        }
    )

    if (!response.ok) {
        throw new Error(
            `Failed to add comment: ${response.status} - ${await getErrorMessage(response)}`
        )
    }

    return response.json()
}

export async function updateCustomerTicket(ticketId, ticketData, token) {
    const response = await fetch(
        `${API_BASE_URL}/tickets/${ticketId}`,
        {
            method: 'PATCH',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(ticketData),
        }
    )

    if (!response.ok) {
        throw new Error(
            `Failed to update ticket: ${response.status} - ${await getErrorMessage(response)}`
        )
    }

    const data = await response.json()

    return normalizeTicket(data)
}
