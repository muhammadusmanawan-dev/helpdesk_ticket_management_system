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
    const [page, setPage] = useState(1)
    const pageSize = 10

    const {
        data: ticketsData,
        isLoading: ticketsLoading,
        error: ticketsError,
    } = useQuery({
        queryKey: ['adminTickets', page, pageSize],
        queryFn: () => getAdminTickets(page, pageSize),
    })

    const tickets = ticketsData?.items ?? []
    const totalTickets = ticketsData?.total ?? 0
    const totalPages = ticketsData?.pages ?? 0

    const {
        data: agents = [],
        isLoading: agentsLoading,
        error: agentsError,
    } = useQuery({
        queryKey: ['adminAgents'],
        queryFn: getAdminAgents,
    })

    async function refreshAdminData() {
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['adminTickets'] }),
            queryClient.invalidateQueries({ queryKey: ['adminDashboardSummary'] }),
        ])
    }

    const assignMutation = useMutation({
        mutationFn: ({ ticketId, agentId }) => assignTicketToAgent(ticketId, agentId),
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

    function handleFilterChange(setter, value) {
        setter(value)
        setPage(1)
    }

    return (
        <section className="tickets-section">
            <div className="section-heading">
                <div>
                    <p className="eyebrow">ADMIN WORKSPACE</p>
                    <h2>All Tickets</h2>
                    <p>View, assign, and manage support tickets.</p>
                </div>
                <TicketFilters
                    search={search}
                    onSearchChange={(value) => handleFilterChange(setSearch, value)}
                    priority={priority}
                    onPriorityChange={(value) => handleFilterChange(setPriority, value)}
                    status={status}
                    onStatusChange={(value) => handleFilterChange(setStatus, value)}
                />
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <p>Total Tickets</p>
                    <h3>{totalTickets}</h3>
                </div>
            </div>

            {ticketsLoading && <p>Loading tickets...</p>}
            {ticketsError && (
                <p className="api-error">Could not load tickets: {ticketsError.message}</p>
            )}
            {agentsError && (
                <p className="api-error">Could not load agents: {agentsError.message}</p>
            )}
            {actionError && <p className="api-error">{actionError}</p>}

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
                            assignMutation.isPending ? assignMutation.variables?.ticketId : null
                        }
                        deletingTicketId={
                            deleteMutation.isPending ? deleteMutation.variables : null
                        }
                    />

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm text-slate-500">
                            Total: {totalTickets} tickets
                            {totalPages > 0 && ` · Page ${page} of ${totalPages}`}
                        </p>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setPage((current) => current - 1)}
                                disabled={page <= 1 || ticketsLoading}
                                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Previous
                            </button>
                            <button
                                type="button"
                                onClick={() => setPage((current) => current + 1)}
                                disabled={page >= totalPages || totalPages === 0 || ticketsLoading}
                                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </>
            )}
        </section>
    )
}

export default AdminTickets
