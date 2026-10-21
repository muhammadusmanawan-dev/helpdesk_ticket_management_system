export function filterTickets(tickets, search, priority, status) {
    const normalizedSearch = search.trim().toLowerCase()

    return tickets.filter((ticket) => {
        const title = (ticket.title ?? '').toLowerCase()
        const ticketPriority = (ticket.priority ?? 'Low').toLowerCase()
        const ticketStatus = (ticket.status ?? 'Open').toLowerCase().replaceAll('_', ' ')
        const matchesSearch = title.includes(normalizedSearch)
        const matchesPriority = priority === 'All' || ticketPriority === priority.toLowerCase()
        const matchesStatus = status === 'All' || ticketStatus === status.toLowerCase()

        return matchesSearch && matchesPriority && matchesStatus
    })
}
