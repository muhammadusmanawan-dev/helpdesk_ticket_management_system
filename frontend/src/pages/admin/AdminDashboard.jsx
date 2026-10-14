import { useQuery } from '@tanstack/react-query'
import { getAdminDashboardSummary } from '../../services/ticketService'
import AdminStatCards from '../../components/organisms/admin/AdminStatCards'

function AdminDashboard({ token }) {
    const {
        data: summary,
        isLoading,
        error,
        refetch,
        isFetching,
    } = useQuery({
        queryKey: ['adminDashboardSummary', token],
        queryFn: () => getAdminDashboardSummary(token),
        enabled: Boolean(token),
    })
    if (isLoading) {
        return (
            <section className="rounded-2xl border border-slate-200 bg-white p-8">
                <p className="text-sm text-slate-500">
                    Loading dashboard statistics...
                </p>
            </section>
        )
    }

    if (error) {
        return (
            <section className="rounded-2xl border border-red-200 bg-red-50 p-6">
                <h2 className="font-semibold text-red-800">
                    Could not load dashboard
                </h2>

                <p className="mt-2 text-sm text-red-700">
                    {error.message}
                </p>

                <button
                    type="button"
                    onClick={() => refetch()}
                    className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
                >
                    Try again
                </button>
            </section>
        )
    }
    return (
        <div className="space-y-8">
            <section className="overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-700 via-blue-700 to-sky-600 p-6 text-white shadow-sm sm:p-8">
                <p className="text-sm font-medium text-blue-100">
                    ADMIN WORKSPACE
                </p>

                <div className="mt-3 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                            Dashboard Overview
                        </h2>

                        <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">
                            Monitor support tickets and get a quick overview of your helpdesk activity.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className="w-fit rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20 disabled:cursor-wait disabled:opacity-60"
                    >
                        {isFetching ? 'Refreshing...' : 'Refresh data'}
                    </button>
                </div>
            </section>

            <section>
                <div className="mb-4">
                    <h3 className="text-lg font-bold text-slate-900">
                        Support Overview
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                        Current ticket and agent statistics.
                    </p>
                </div>

                <AdminStatCards summary={summary} />
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="font-bold text-slate-900">
                    Next steps
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                    Ticket management, agent assignment, and analytics will be available in their dedicated admin pages.
                </p>
            </section>
        </div>
    )
}

export default AdminDashboard
