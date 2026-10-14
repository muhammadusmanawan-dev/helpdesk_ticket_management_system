import { useQuery } from '@tanstack/react-query'
import AdminStatCards from "../../components/organisms/admin/AdminStatCards";

import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
} from 'recharts'

import {
    getAdminDashboardSummary,
    getAdminAgentPerformance,
    getAdminTrends,
} from '../../services/ticketService'

const STATUS_COLORS = [
    '#6366f1',
    '#0ea5e9',
    '#f59e0b',
    '#10b981',
    '#64748b',
]

const chartCard =
    'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'

function AdminDashboard({ token }) {
    const {
        data: summary,
        isLoading: summaryLoading,
        error: summaryError,
        refetch: refetchSummary,
        isFetching: summaryFetching,
    } = useQuery({
        queryKey: ['adminDashboardSummary', token],
        queryFn: () => getAdminDashboardSummary(token),
        enabled: Boolean(token),
    })

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

    const statusData = [
        { name: 'Open', value: summary?.open_tickets ?? 0 },
        { name: 'Assigned', value: summary?.assigned_tickets ?? 0 },
        { name: 'In Progress', value: summary?.in_progress_tickets ?? 0 },
        { name: 'Resolved', value: summary?.resolved_tickets ?? 0 },
        { name: 'Closed', value: summary?.closed_tickets ?? 0 },
    ]

    const hasTickets = statusData.some((status) => status.value > 0)

    if (summaryLoading) {
        return (
            <section className={chartCard}>
                <p className="text-sm text-slate-500">
                    Loading dashboard...
                </p>
            </section>
        )
    }

    if (summaryError) {
        return (
            <section className="rounded-2xl border border-red-200 bg-red-50 p-6">
                <h2 className="font-semibold text-red-800">
                    Could not load dashboard
                </h2>
                <p className="mt-2 text-sm text-red-700">
                    {summaryError.message}
                </p>
                <button
                    type="button"
                    onClick={() => refetchSummary()}
                    className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white"
                >
                    Try again
                </button>
            </section>
        )
    }

    return (
        <div className="space-y-6">
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
                            Monitor ticket statuses, agent performance, and
                            support activity in one place.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            refetchSummary()
                            refetchAgents()
                            refetchTrends()
                        }}
                        disabled={summaryFetching}
                        className="w-fit rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/20 disabled:opacity-60"
                    >
                        {summaryFetching ? 'Refreshing...' : 'Refresh data'}
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

            {/* Chart 1: Ticket status pie chart */}
            <section className={chartCard}>
                <h3 className="text-lg font-bold text-slate-900">
                    Ticket Status Distribution
                </h3>
                <p className="mb-5 mt-1 text-sm text-slate-500">
                    Current tickets grouped by status.
                </p>

                {hasTickets ? (
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="45%"
                                    outerRadius={100}
                                    paddingAngle={3}
                                    label={({ name, value }) =>
                                        value > 0 ? `${name}: ${value}` : ''
                                    }
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell
                                            key={entry.name}
                                            fill={STATUS_COLORS[index]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <p className="py-10 text-center text-sm text-slate-500">
                        No tickets available to display.
                    </p>
                )}
            </section>

            {/* Chart 2: Agent assigned vs resolved tickets */}
            <section className={chartCard}>
                <h3 className="text-lg font-bold text-slate-900">
                    Agent Ticket Performance
                </h3>
                <p className="mb-5 mt-1 text-sm text-slate-500">
                    Compare assigned and resolved tickets for each agent.
                </p>

                {agentsLoading ? (
                    <p className="py-8 text-sm text-slate-500">
                        Loading agent performance...
                    </p>
                ) : agentsError ? (
                    <p className="text-sm text-red-700">
                        Could not load agent performance: {agentsError.message}
                    </p>
                ) : agents.length > 0 ? (
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
                    <p className="py-8 text-sm text-slate-500">
                        No agent performance data available.
                    </p>
                )}
            </section>

            {/* Chart 3: Average resolution time */}
            <section className={chartCard}>
                <h3 className="text-lg font-bold text-slate-900">
                    Average Resolution Time
                </h3>
                <p className="mb-5 mt-1 text-sm text-slate-500">
                    Average time taken to resolve tickets, in hours.
                </p>

                {!agentsLoading && !agentsError && agents.length > 0 ? (
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
                ) : agentsLoading ? (
                    <p className="py-8 text-sm text-slate-500">
                        Loading resolution times...
                    </p>
                ) : agentsError ? (
                    <p className="text-sm text-red-700">
                        Could not load resolution times.
                    </p>
                ) : (
                    <p className="py-8 text-sm text-slate-500">
                        No resolution-time data available.
                    </p>
                )}
            </section>

            {/* Chart 4: Last 7 days ticket trends */}
            <section className={chartCard}>
                <h3 className="text-lg font-bold text-slate-900">
                    Ticket Trends — Last 7 Days
                </h3>
                <p className="mb-5 mt-1 text-sm text-slate-500">
                    Compare tickets created and resolved each day.
                </p>

                {trendsLoading ? (
                    <p className="py-8 text-sm text-slate-500">
                        Loading ticket trends...
                    </p>
                ) : trendsError ? (
                    <p className="text-sm text-red-700">
                        Could not load ticket trends: {trendsError.message}
                    </p>
                ) : trends.length > 0 ? (
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
                                <Tooltip
                                    labelFormatter={(date) => `Date: ${date}`}
                                />
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
                    <p className="py-8 text-sm text-slate-500">
                        No ticket trend data available.
                    </p>
                )}
            </section>
        </div>
    )
}

export default AdminDashboard
