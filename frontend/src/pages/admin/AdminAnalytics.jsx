
import { useQuery } from '@tanstack/react-query'
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from 'recharts'

import {
    getAdminAgentPerformance,
    getAdminTrends,
} from '../../services/ticketService'

function AdminAnalytics({ token }) {
    const {
        data: agents = [],
        isLoading: agentsLoading,
        error: agentsError,
        refetch: refetchAgents,
    } = useQuery({
        queryKey: ['adminAgentPerformance', token],
        queryFn: () => getAdminAgentPerformance(token),
        enabled: Boolean(token),
    })

    const {
        data: trends = [],
        isLoading: trendsLoading,
        error: trendsError,
        refetch: refetchTrends,
    } = useQuery({
        queryKey: ['adminTicketTrends', token],
        queryFn: () => getAdminTrends(token),
        enabled: Boolean(token),
    })

    const chartCard =
        'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'

    if (agentsLoading || trendsLoading) {
        return (
            <section className={chartCard}>
                <p className="text-sm text-slate-500">
                    Loading admin analytics...
                </p>
            </section>
        )
    }

    const hasAgentError = Boolean(agentsError)
    const hasTrendsError = Boolean(trendsError)

    return (
        <div className="space-y-6">
            <section className="rounded-2xl bg-gradient-to-r from-indigo-700 via-blue-700 to-sky-600 p-6 text-white">
                <p className="text-sm font-medium text-blue-100">
                    ADMIN WORKSPACE
                </p>
                <h2 className="mt-2 text-2xl font-bold">
                    Analytics
                </h2>
                <p className="mt-2 text-sm text-blue-100">
                    Review agent performance and ticket activity.
                </p>
            </section>

            {hasAgentError && (
                <section className="rounded-xl border border-red-200 bg-red-50 p-4">
                    <p className="text-sm text-red-700">
                        Could not load agent performance: {agentsError.message}
                    </p>
                    <button
                        type="button"
                        onClick={() => refetchAgents()}
                        className="mt-2 text-sm font-semibold text-red-800 underline"
                    >
                        Try again
                    </button>
                </section>
            )}

            {!hasAgentError && (
                <>
                    <section className={chartCard}>
                        <h3 className="text-lg font-bold text-slate-900">
                            Agent Ticket Performance
                        </h3>
                        <p className="mb-5 mt-1 text-sm text-slate-500">
                            Compare assigned and resolved tickets for each agent.
                        </p>

                        {agents.length > 0 ? (
                            <div
                                className="w-full"
                                style={{ height: Math.max(260, agents.length * 75) }}
                            >
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={agents}
                                        layout="vertical"
                                        margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" allowDecimals={false} />
                                        <YAxis
                                            type="category"
                                            dataKey="email"
                                            width={150}
                                            tick={{ fontSize: 12 }}
                                        />
                                        <Tooltip />
                                        <Legend />
                                        <Bar
                                            dataKey="assigned_tickets"
                                            name="Assigned"
                                            fill="#6366f1"
                                            radius={[0, 4, 4, 0]}
                                        />
                                        <Bar
                                            dataKey="resolved_tickets"
                                            name="Resolved"
                                            fill="#10b981"
                                            radius={[0, 4, 4, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <p className="py-10 text-center text-sm text-slate-500">
                                No agent performance data available.
                            </p>
                        )}
                    </section>

                    <section className={chartCard}>
                        <h3 className="text-lg font-bold text-slate-900">
                            Average Resolution Time
                        </h3>
                        <p className="mb-5 mt-1 text-sm text-slate-500">
                            Average time taken to resolve tickets, in hours.
                        </p>

                        {agents.length > 0 ? (
                            <div
                                className="w-full"
                                style={{ height: Math.max(240, agents.length * 65) }}
                            >
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={agents}
                                        layout="vertical"
                                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" />
                                        <YAxis
                                            type="category"
                                            dataKey="email"
                                            width={150}
                                            tick={{ fontSize: 12 }}
                                        />
                                        <Tooltip
                                            formatter={(value) => [
                                                `${Number(value).toFixed(1)} hours`,
                                                'Average resolution time',
                                            ]}
                                        />
                                        <Bar
                                            dataKey="average_resolution_hours"
                                            name="Average hours"
                                            fill="#f59e0b"
                                            radius={[0, 4, 4, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <p className="py-10 text-center text-sm text-slate-500">
                                No resolution-time data available.
                            </p>
                        )}
                    </section>
                </>
            )}

            {hasTrendsError ? (
                <section className="rounded-xl border border-red-200 bg-red-50 p-4">
                    <p className="text-sm text-red-700">
                        Could not load ticket trends: {trendsError.message}
                    </p>
                    <button
                        type="button"
                        onClick={() => refetchTrends()}
                        className="mt-2 text-sm font-semibold text-red-800 underline"
                    >
                        Try again
                    </button>
                </section>
            ) : (
                <section className={chartCard}>
                    <h3 className="text-lg font-bold text-slate-900">
                        Ticket Trends — Last 7 Days
                    </h3>
                    <p className="mb-5 mt-1 text-sm text-slate-500">
                        Compare tickets created and resolved each day.
                    </p>

                    {trends.length > 0 ? (
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={trends}
                                    margin={{ top: 10, right: 15, left: 0, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={(date) => date.slice(5)}
                                        tick={{ fontSize: 12 }}
                                    />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip labelFormatter={(date) => `Date: ${date}`} />
                                    <Legend />
                                    <Bar
                                        dataKey="created"
                                        name="Created"
                                        fill="#6366f1"
                                        radius={[4, 4, 0, 0]}
                                    />
                                    <Bar
                                        dataKey="resolved"
                                        name="Resolved"
                                        fill="#10b981"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <p className="py-10 text-center text-sm text-slate-500">
                            No ticket trend data available.
                        </p>
                    )}
                </section>
            )}
        </div>
    )
}

export default AdminAnalytics
