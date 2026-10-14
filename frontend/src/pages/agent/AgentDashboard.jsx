import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
} from 'recharts'

import AgentStatCards from '../../components/organisms/agent/AgentStatCards'

const STATUS_COLORS = [
    '#6366f1',
    '#0ea5e9',
    '#f59e0b',
    '#10b981',
    '#64748b',
]

const PRIORITY_COLORS = [
    '#94a3b8',
    '#0ea5e9',
    '#f59e0b',
    '#ef4444',
]

const chartCard =
    'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'

function AgentDashboard({
    assignedTickets = [],
    loading,
    error,
}) {
    const statuses = [
        'Open',
        'Assigned',
        'In Progress',
        'Resolved',
        'Closed',
    ]

    const priorities = ['Low', 'Medium', 'High', 'Urgent']

    const totalTickets = assignedTickets.length

    const statusData = statuses.map((status) => ({
        name: status,
        value: assignedTickets.filter(
            (ticket) =>
                ticket.status?.toLowerCase() === status.toLowerCase()
        ).length,
    }))

    const priorityData = priorities.map((priority) => ({
        name: priority,
        value: assignedTickets.filter(
            (ticket) =>
                ticket.priority?.toLowerCase() === priority.toLowerCase()
        ).length,
    }))

    const getPercentage = (value) =>
        totalTickets > 0
            ? ((Number(value) / totalTickets) * 100).toFixed(1)
            : '0.0'

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
                    Could not load assigned tickets: {error}
                </p>
            )}

            <AgentStatCards tickets={assignedTickets} />

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <section className={chartCard}>
                    <h2 className="text-lg font-bold text-slate-900">
                        My Ticket Status
                    </h2>
                    <p className="mb-5 mt-1 text-sm text-slate-500">
                        Percentage distribution of your assigned tickets.
                    </p>

                    {statusData.some((item) => item.value > 0) ? (
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusData.filter(
                                            (item) => item.value > 0
                                        )}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="45%"
                                        outerRadius={100}
                                        label={({ name, value }) =>
                                            `${name}: ${getPercentage(value)}%`
                                        }
                                    >
                                        {statusData
                                            .filter((item) => item.value > 0)
                                            .map((item) => (
                                                <Cell
                                                    key={item.name}
                                                    fill={
                                                        STATUS_COLORS[
                                                        statuses.indexOf(item.name)
                                                        ]
                                                    }
                                                />
                                            ))}
                                    </Pie>

                                    <Tooltip
                                        formatter={(value, name) => [
                                            `${getPercentage(value)}% (${value} tickets)`,
                                            name,
                                        ]}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <p className="py-10 text-center text-sm text-slate-500">
                            No ticket status data available.
                        </p>
                    )}
                </section>

                <section className={chartCard}>
                    <h2 className="text-lg font-bold text-slate-900">
                        My Ticket Priorities
                    </h2>
                    <p className="mb-5 mt-1 text-sm text-slate-500">
                        Percentage distribution by ticket priority.
                    </p>

                    {priorityData.some((item) => item.value > 0) ? (
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={priorityData.filter(
                                            (item) => item.value > 0
                                        )}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="45%"
                                        outerRadius={100}
                                        label={({ name, value }) =>
                                            `${name}: ${getPercentage(value)}%`
                                        }
                                    >
                                        {priorityData
                                            .filter((item) => item.value > 0)
                                            .map((item) => (
                                                <Cell
                                                    key={item.name}
                                                    fill={
                                                        PRIORITY_COLORS[
                                                        priorities.indexOf(item.name)
                                                        ]
                                                    }
                                                />
                                            ))}
                                    </Pie>

                                    <Tooltip
                                        formatter={(value, name) => [
                                            `${getPercentage(value)}% (${value} tickets)`,
                                            name,
                                        ]}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <p className="py-10 text-center text-sm text-slate-500">
                            No ticket priority data available.
                        </p>
                    )}
                </section>
            </div>
        </div>
    )
}

export default AgentDashboard
