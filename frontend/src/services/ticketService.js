const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

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

export async function getCustomerTickets() {
    const response = await fetch(
        `${API_BASE_URL}/tickets/?page=1&size=50`,
        {
            method: 'GET',
            headers: {
                Accept: 'application/json',
            },
            credentials: 'include',
        }
    )

    if (!response.ok) {
        throw new Error(
            `Failed to fetch tickets: ${response.status} - ${await getErrorMessage(response)}`
        )
    }

    const data = await response.json()

    return data.items.map(normalizeTicket)
}

export async function createCustomerTicket(ticketData) {
    const response = await fetch(`${API_BASE_URL}/tickets/`, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(ticketData),
    })

    if (!response.ok) {
        throw new Error(
            `Failed to create ticket: ${response.status} - ${await getErrorMessage(response)}`
        )
    }

    return normalizeTicket(await response.json())
}

export async function getTicketComments(ticketId) {
    const response = await fetch(
        `${API_BASE_URL}/tickets/${ticketId}/comments`,
        {
            method: 'GET',
            headers: {
                Accept: 'application/json',
            },
            credentials: 'include',
        }
    )

    if (!response.ok) {
        throw new Error(
            `Failed to fetch comments: ${response.status} - ${await getErrorMessage(response)}`
        )
    }

    return response.json()
}

export async function createTicketComment(ticketId, content) {
    const response = await fetch(
        `${API_BASE_URL}/tickets/${ticketId}/comments`,
        {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            credentials: 'include',
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

export async function updateCustomerTicket(ticketId, ticketData) {
    const response = await fetch(
        `${API_BASE_URL}/tickets/${ticketId}`,
        {
            method: 'PATCH',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(ticketData),
        }
    )

    if (!response.ok) {
        throw new Error(
            `Failed to update ticket: ${response.status} - ${await getErrorMessage(response)}`
        )
    }

    return normalizeTicket(await response.json())
}

export async function getAssignedTickets() {
    const response = await fetch(
        `${API_BASE_URL}/tickets/assigned`,
        {
            method: 'GET',
            headers: {
                Accept: 'application/json',
            },
            credentials: 'include',
        }
    )

    if (!response.ok) {
        throw new Error(
            `Failed to fetch assigned tickets: ${response.status} - ${await getErrorMessage(response)}`
        )
    }

    const data = await response.json()

    return data.map(normalizeTicket)
}

export async function updateAssignedTicketStatus(ticketId, status) {
    const response = await fetch(
        `${API_BASE_URL}/tickets/${ticketId}/status`,
        {
            method: 'PATCH',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ status }),
        }
    )

    if (!response.ok) {
        throw new Error(
            `Failed to update ticket status: ${response.status} - ${await getErrorMessage(response)}`
        )
    }

    return normalizeTicket(await response.json())
}

export async function getAdminDashboardSummary() {
    const response = await fetch(
        `${API_BASE_URL}/tickets/admin/dashboard-summary`,
        {
            method: 'GET',
            headers: {
                Accept: 'application/json',
            },
            credentials: 'include',
        }
    )

    if (!response.ok) {
        throw new Error(
            `Failed to fetch admin dashboard: ${response.status} - ${await getErrorMessage(response)}`
        )
    }

    return response.json()
}

export async function getAdminTickets() {
    const response = await fetch(
        `${API_BASE_URL}/tickets/admin/all`,
        {
            method: 'GET',
            headers: {
                Accept: 'application/json',
            },
            credentials: 'include',
        }
    )

    if (!response.ok) {
        throw new Error(
            `Failed to fetch admin tickets: ${response.status} - ${await getErrorMessage(response)}`
        )
    }

    const data = await response.json()
    const tickets = Array.isArray(data) ? data : data.items ?? []

    return tickets.map(normalizeTicket)
}

export async function getAdminAgents() {
    const response = await fetch(`${API_BASE_URL}/users/admin/agents`, {
        headers: {
            Accept: 'application/json',
        },
        credentials: 'include',
    })

    if (!response.ok) {
        throw new Error(
            `Failed to fetch agents: ${response.status} - ${await getErrorMessage(response)}`
        )
    }

    const data = await response.json()

    return Array.isArray(data) ? data : data.items ?? []
}

export async function assignTicketToAgent(ticketId, agentId) {
    const response = await fetch(
        `${API_BASE_URL}/tickets/${ticketId}/assign/${agentId}`,
        {
            method: 'PATCH',
            headers: {
                Accept: 'application/json',
            },
            credentials: 'include',
        }
    )

    if (!response.ok) {
        throw new Error(
            `Failed to assign ticket: ${response.status} - ${await getErrorMessage(response)}`
        )
    }

    return response.json()
}

export async function deleteAdminTicket(ticketId) {
    const response = await fetch(
        `${API_BASE_URL}/tickets/admin/${ticketId}`,
        {
            method: 'DELETE',
            headers: {
                Accept: 'application/json',
            },
            credentials: 'include',
        }
    )

    if (!response.ok) {
        throw new Error(
            `Failed to delete ticket: ${response.status} - ${await getErrorMessage(response)}`
        )
    }
}

export async function getAdminAgentPerformance() {
    const response = await fetch(
        `${API_BASE_URL}/tickets/admin/agent-performance`,
        {
            headers: {
                Accept: 'application/json',
            },
            credentials: 'include',
        }
    )

    if (!response.ok) {
        throw new Error(
            `Failed to fetch agent performance: ${response.status} - ${await getErrorMessage(response)}`
        )
    }

    return response.json()
}

export async function getAdminTrends() {
    const response = await fetch(
        `${API_BASE_URL}/tickets/admin/trends`,
        {
            headers: {
                Accept: 'application/json',
            },
            credentials: 'include',
        }
    )

    if (!response.ok) {
        throw new Error(
            `Failed to fetch ticket trends: ${response.status} - ${await getErrorMessage(response)}`
        )
    }

    return response.json()
}

export async function updateAdminTicketStatus(ticketId, status) {
    const response = await fetch(
        `${API_BASE_URL}/tickets/${ticketId}/admin-status`,
        {
            method: 'PATCH',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ status }),
        }
    )

    if (!response.ok) {
        throw new Error(
            `Failed to update ticket status: ${response.status} - ${await getErrorMessage(response)}`
        )
    }

    return normalizeTicket(await response.json())
}
