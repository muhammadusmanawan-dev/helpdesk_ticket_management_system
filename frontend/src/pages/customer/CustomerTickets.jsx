import { useState } from 'react'

import SearchBar from '../../components/molecules/SearchBar'
import TicketTable from '../../components/organisms/TicketTable'
import CreateTicketForm from '../../components/organisms/CreateTicketForm'

function CustomerTickets({
    tickets = [],
    loading,
    error,
    onCreate,
    createLoading,
    createError,
    createSuccess,
    onViewDetails,
}) {
    const [search, setSearch] = useState('')

    const filteredTickets = tickets.filter((ticket) =>
        (ticket.title ?? '')
            .toLowerCase()
            .includes(search.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <CreateTicketForm
                onCreate={onCreate}
                loading={createLoading}
                error={createError}
                success={createSuccess}
            />

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">
                            My Tickets
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Create, search and manage your support tickets.
                        </p>
                    </div>

                    <SearchBar
                        value={search}
                        onChange={setSearch}
                    />
                </div>

                {error && (
                    <p className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        Could not load tickets: {error}
                    </p>
                )}

                {loading ? (
                    <p className="py-8 text-center text-sm text-slate-500">
                        Loading tickets...
                    </p>
                ) : (
                    <TicketTable
                        tickets={filteredTickets}
                        onViewDetails={onViewDetails}
                    />
                )}
            </section>
        </div>
    )
}

export default CustomerTickets
