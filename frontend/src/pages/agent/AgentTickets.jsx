import { useState } from 'react'
import TicketTable from '../../components/organisms/TicketTable'
import TicketFilters from '../../components/molecules/TicketFilters'
import { filterTickets } from '../../utils/filterTickets'

function AgentTickets({
    assignedTickets = [],
    loading,
    error,
    page,
    setPage,
    totalPages,
    totalTickets,
    onViewDetails,
}) {
    const [search, setSearch] = useState('')
    const [priority, setPriority] = useState('All')
    const [status, setStatus] = useState('All')

    const filteredTickets = filterTickets(assignedTickets, search, priority, status)

    function handleFilterChange(setter, value) {
        setter(value)
        setPage(1)
    }

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h2 className="text-lg font-bold text-slate-900">My Assigned Tickets</h2>
                    <p className="mt-1 text-sm text-slate-500">
                        View and manage tickets assigned to you.
                    </p>
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

            {error && (
                <p className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    Could not load assigned tickets: {error}
                </p>
            )}

            {loading ? (
                <p className="py-8 text-center text-sm text-slate-500">
                    Loading assigned tickets...
                </p>
            ) : (
                <>
                    <TicketTable tickets={filteredTickets} onViewDetails={onViewDetails} />
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm text-slate-500">
                            Total: {totalTickets} tickets
                            {totalPages > 0 && ` · Page ${page} of ${totalPages}`}
                        </p>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setPage((current) => current - 1)}
                                disabled={page <= 1 || loading}
                                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium disabled:opacity-40"
                            >
                                Previous
                            </button>
                            <button
                                type="button"
                                onClick={() => setPage((current) => current + 1)}
                                disabled={page >= totalPages || totalPages === 0 || loading}
                                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium disabled:opacity-40"
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

export default AgentTickets
