import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import TicketFilters from '../../components/molecules/TicketFilters'
import { filterTickets } from '../../utils/filterTickets'
import TicketTable from '../../components/organisms/TicketTable'
import {
    getAdminTickets,
    getAdminAgents,
    assignTicketToAgent,
    deleteAdminTicket,
} from '../../services/ticketService'

function AdminTickets({ onViewDetails }) {
    const queryClient = useQueryClient()
    const [search, setSearch] = useState('')
    const [actionError, setActionError] = useState('')
    const [priority, setPriority] = useState('All')
    const [status, setStatus] = useState('All')

    const {
        data: tickets = [],
        isLoading: ticketsLoading,
        error: ticketsError,
    } = useQuery({
        queryKey: ['adminTickets'],
        queryFn: getAdminTickets,
        enabled: true,
    })

    const {
        data: agents = [],
        isLoading: agentsLoading,
        error: agentsError,
    } = useQuery({
        queryKey: ['adminAgents'],
        queryFn: getAdminAgents,
        enabled: true,
    })

    async function refreshAdminData() {
        await Promise.all([
            queryClient.invalidateQueries({
                queryKey: ['adminTickets'],
            }),

            queryClient.invalidateQueries({
                queryKey: ['adminDashboardSummary'],
            })
        ])
    }

    const assignMutation = useMutation({
        mutationFn: ({ ticketId, agentId }) =>
            assignTicketToAgent(ticketId, agentId),
        onSuccess: refreshAdminData,
        onError: (error) => setActionError(error.message),
    })

    const deleteMutation = useMutation({
        mutationFn: (ticketId) => deleteAdminTicket(ticketId),
        onSuccess: refreshAdminData,
        onError: (error) => setActionError(error.message),
    })

    const filteredTickets = filterTickets(tickets, search, priority, status)

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

                <TicketFilters search={search} onSearchChange={setSearch} priority={priority} onPriorityChange={setPriority} status={status} onStatusChange={setStatus} />
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
