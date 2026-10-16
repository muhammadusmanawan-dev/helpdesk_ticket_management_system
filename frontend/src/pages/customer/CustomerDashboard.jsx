import StatCard from '../../components/molecules/StatCard'

function CustomerDashboard({ tickets = [], loading, error }) {
    if (loading) {
        return (
            <p className="text-sm text-slate-500">
                Loading your dashboard...
            </p>
        )
    }

    return (
        <div className="space-y-6">
            {error && (
                <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    Could not load tickets: {error}
                </p>
            )}

            <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    title="Total tickets"
                    value={tickets.length}
                    description="Your support requests"
                />

                <StatCard
                    title="Open"
                    value={tickets.filter(
                        (ticket) => ticket.status === 'Open'
                    ).length}
                    description="Waiting for action"
                />

                <StatCard
                    title="In progress"
                    value={tickets.filter(
                        (ticket) => ticket.status === 'In Progress'
                    ).length}
                    description="Currently being handled"
                />

                <StatCard
                    title="Resolved"
                    value={tickets.filter(
                        (ticket) => ticket.status === 'Resolved'
                    ).length}
                    description="Resolved support requests"
                />
            </section>
        </div>
    )
}

export default CustomerDashboard
