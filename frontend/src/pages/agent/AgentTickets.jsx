import { useState } from 'react'

import SearchBar from '../../components/molecules/SearchBar'
import TicketTable from '../../components/organisms/TicketTable'

function AgentTickets({
    assignedTickets = [],
    loading,
    error,
    onViewDetails,
}) {
    const [search, setSearch] = useState('')

    const filteredTickets = assignedTickets.filter((ticket) =>
        (ticket.title ?? '')
            .toLowerCase()
            .includes(search.toLowerCase())
    )

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h2 className="text-lg font-bold text-slate-900">
                        My Assigned Tickets
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        View and manage tickets assigned to you.
                    </p>
                </div>

                <SearchBar
                    value={search}
                    onChange={setSearch}
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
                <TicketTable
                    tickets={filteredTickets}
                    onViewDetails={onViewDetails}
                />
            )}
        </section>
    )
}

export default AgentTickets
