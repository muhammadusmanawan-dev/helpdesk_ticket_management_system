import { apiClient } from './apiClient'

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

export async function getCustomerTickets() {
    const data = await apiClient('/tickets/', {
        params: { page: 1, size: 50 },
    })

    return data.items.map(normalizeTicket)
}

export async function createCustomerTicket(ticketData) {
    const data = await apiClient('/tickets/', {
        method: 'POST',
        body: ticketData,
    })

    return normalizeTicket(data)
}

export async function getTicketComments(ticketId) {
    return apiClient(`/tickets/${ticketId}/comments`)
}

export async function createTicketComment(ticketId, content) {
    return apiClient(`/tickets/${ticketId}/comments`, {
        method: 'POST',
        body: { content },
    })
}

export async function updateCustomerTicket(ticketId, ticketData) {
    const data = await apiClient(`/tickets/${ticketId}`, {
        method: 'PATCH',
        body: ticketData,
    })

    return normalizeTicket(data)
}

export async function getAssignedTickets() {
    const data = await apiClient('/tickets/assigned')

    return data.map(normalizeTicket)
}

export async function updateAssignedTicketStatus(ticketId, status) {
    const data = await apiClient(`/tickets/${ticketId}/status`, {
        method: 'PATCH',
        body: { status },
    })

    return normalizeTicket(data)
}

export async function getAdminDashboardSummary() {
    return apiClient('/tickets/admin/dashboard-summary')
}

export async function getAdminTickets() {
    const data = await apiClient('/tickets/admin/all')
    const tickets = Array.isArray(data) ? data : data.items ?? []

    return tickets.map(normalizeTicket)
}

export async function getAdminAgents() {
    const data = await apiClient('/users/admin/agents')

    return Array.isArray(data) ? data : data.items ?? []
}

export async function assignTicketToAgent(ticketId, agentId) {
    return apiClient(`/tickets/${ticketId}/assign/${agentId}`, {
        method: 'PATCH',
    })
}

export async function deleteAdminTicket(ticketId) {
    return apiClient(`/tickets/admin/${ticketId}`, {
        method: 'DELETE',
    })
}

export async function getAdminAgentPerformance() {
    return apiClient('/tickets/admin/agent-performance')
}

export async function getAdminTrends() {
    return apiClient('/tickets/admin/trends')
}

export async function updateAdminTicketStatus(ticketId, status) {
    const data = await apiClient(`/tickets/${ticketId}/admin-status`, {
        method: 'PATCH',
        body: { status },
    })

    return normalizeTicket(data)
}
