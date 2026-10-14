import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import SearchBar from '../../components/molecules/SearchBar'
import TicketTable from '../../components/organisms/TicketTable'
import {
    getAdminTickets,
    getAdminAgents,
    assignTicketToAgent,
    deleteAdminTicket,
} from '../../services/ticketService'

function AdminTickets({ token, onViewDetails }) {
    const queryClient = useQueryClient()
    const [search, setSearch] = useState('')
    const [actionError, setActionError] = useState('')

    const {
        data: tickets = [],
        isLoading,
        error,
    } = useQuery({
        queryKey: ['adminTickets', token],
        queryFn: () => getAdminTickets(token),
        enabled: Boolean(token),
    })

    const {
        data: agents = [],
        isLoading: agentsLoading,
        error: agentsError,
    } = useQuery({
        queryKey: ['adminAgents', token],
        queryFn: () => getAdminAgents(token),
        enabled: Boolean(token),
    })

    async function refreshAdminData() {
        await Promise.all([
            queryClient.invalidateQueries({
                queryKey: ['adminTickets', token],
            }),
            queryClient.invalidateQueries({
                queryKey: ['adminDashboardSummary', token],
            }),
        ])
    }

    const assignMutation = useMutation({
        mutationFn: ({ ticketId, agentId }) =>
            assignTicketToAgent(ticketId, agentId, token),
        onSuccess: refreshAdminData,
        onError: (error) => setActionError(error.message),
    })

    const deleteMutation = useMutation({
        mutationFn: (ticketId) => deleteAdminTicket(ticketId, token),
        onSuccess: refreshAdminData,
        onError: (error) => setActionError(error.message),
    })

    const filteredTickets = tickets.filter((ticket) =>
        (ticket.title ?? '')
            .toLowerCase()
            .includes(search.toLowerCase())
    )

    function handleAssign(ticketId, agentId) {
        if (!agentId) return

        setActionError('')
        assignMutation.mutate({ ticketId, agentId })
    }

    function handleDelete(ticket) {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${ticket.title}"?`
        )

        if (!confirmed) return

        setActionError('')
        deleteMutation.mutate(ticket.id)
    }

    return (
        <section className="tickets-section">
            <div className="section-heading">
                <div>
                    <p className="eyebrow">ADMIN WORKSPACE</p>
                    <h2>All Tickets</h2>
                    <p>View, assign, and manage support tickets.</p>
                </div>

                <SearchBar value={search} onChange={setSearch} />
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <p>Total Tickets</p>
                    <h3>{tickets.length}</h3>
                </div>
            </div>

            {ticketsLoading && <p>Loading tickets...</p>}

            {ticketsError && (
                <p className="api-error">
                    Could not load tickets: {ticketsError.message}
                </p>
            )}

            {agentsError && (
                <p className="api-error">
                    Could not load agents: {agentsError.message}
                </p>
            )}

            {actionError && (
                <p className="api-error">{actionError}</p>
            )}

            {!ticketsLoading && !ticketsError && (
                <>
                    {agentsLoading && <p>Loading agents...</p>}

                    <TicketTable
                        tickets={filteredTickets}
                        onViewDetails={onViewDetails}
                        agents={agents}
                        onAssign={handleAssign}
                        onDelete={handleDelete}
                        assigningTicketId={
                            assignMutation.isPending
                                ? assignMutation.variables?.ticketId
                                : null
                        }
                        deletingTicketId={
                            deleteMutation.isPending
                                ? deleteMutation.variables
                                : null
                        }
                    />
                </>
            )}
        </section>
    )
}

export default AdminTickets
