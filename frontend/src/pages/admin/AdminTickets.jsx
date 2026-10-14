
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import SearchBar from '../../components/molecules/SearchBar'
import TicketTable from '../../components/organisms/TicketTable'
import { getAdminTickets } from '../../services/ticketService'

function AdminTickets({ token, onViewDetails }) {
    const [search, setSearch] = useState('')

    const {
        data: tickets = [],
        isLoading,
        error,
    } = useQuery({
        queryKey: ['adminTickets', token],
        queryFn: () => getAdminTickets(token),
        enabled: Boolean(token),
    })

    const filteredTickets = tickets.filter((ticket) =>
        (ticket.title ?? '')
            .toLowerCase()
            .includes(search.toLowerCase())
    )

    return (
        <section className="tickets-section">
            <div className="section-heading">
                <div>
                    <p className="eyebrow">ADMIN WORKSPACE</p>
                    <h2>All Tickets</h2>
                    <p>View and manage support tickets.</p>
                </div>

                <SearchBar
                    value={search}
                    onChange={setSearch}
                />
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <p>Total Tickets</p>
                    <h3>{tickets.length}</h3>
                </div>
            </div>

            {isLoading && <p>Loading tickets...</p>}

            {error && (
                <p className="api-error">
                    Could not load tickets: {error.message}
                </p>
            )}

            {!isLoading && !error && (
                <TicketTable
                    tickets={filteredTickets}
                    onViewDetails={onViewDetails}
                />
            )}
        </section>
    )
}

export default AdminTickets
