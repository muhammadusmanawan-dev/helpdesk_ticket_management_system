const API_BASE_URL = 'http://127.0.0.1:8000'

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
        throw new Error(`Failed to fetch tickets: ${response.status}`)
    }

    const data = await response.json()

    return data.items.map((ticket) => ({
        ...ticket,
        priority:
            ticket.priority.charAt(0).toUpperCase() +
            ticket.priority.slice(1),

        status: ticket.status
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' '),

        customer: 'Customer',
    }))
}
