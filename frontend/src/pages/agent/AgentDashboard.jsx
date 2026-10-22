
import { useQuery } from '@tanstack/react-query'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'
import AgentStatCards from '../../components/organisms/agent/AgentStatCards'
import SplitText from '../../components/atoms/SplitText'
import AnimatedContent from '../../components/atoms/AnimatedContent'
import {
    getAgentDashboardSummary,
    getAgentPrioritySummary,
} from '../../services/ticketService'

const STATUS_COLORS = ['#6366f1', '#0ea5e9', '#f59e0b', '#10b981', '#64748b']
const PRIORITY_COLORS = ['#94a3b8', '#0ea5e9', '#f59e0b', '#ef4444']
const chartCard = 'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'

function AgentDashboard() {
    const { data, isLoading, error, refetch, isFetching } = useQuery({
        queryKey: ['agentDashboardSummary'],
        queryFn: getAgentDashboardSummary,
    })

    const {
        data: priorityCounts = {},
        isLoading: isPriorityLoading,
        error: priorityError,
        refetch: refetchPriorities,
        isFetching: isPriorityFetching,
    } = useQuery({
        queryKey: ['agentPrioritySummary'],
        queryFn: getAgentPrioritySummary,
    })

    const summary = data?.summary ?? data ?? {}

    const statuses = [
        { name: 'Open', key: 'open_tickets' },
        { name: 'Assigned', key: 'assigned_tickets' },
        { name: 'In Progress', key: 'in_progress_tickets' },
        { name: 'Resolved', key: 'resolved_tickets' },
        { name: 'Closed', key: 'closed_tickets' },
    ]

    const priorities = [
        { name: 'Low', key: 'low' },
        { name: 'Medium', key: 'medium' },
        { name: 'High', key: 'high' },
        { name: 'Urgent', key: 'urgent' },
    ]

    const totalTickets = Number(summary.total_tickets ?? 0)
    const statusData = statuses.map((item) => ({ name: item.name, value: Number(summary[item.key] ?? 0) }))
    const priorityData = priorities.map((item) => ({ name: item.name, value: Number(priorityCounts[item.key] ?? 0) }))
    const getPercentage = (value) => totalTickets > 0 ? ((Number(value) / totalTickets) * 100).toFixed(1) : '0.0'

    if (isLoading) return <p className="text-sm text-slate-500">Loading your dashboard...</p>

    if (error) {
        return <section className="rounded-2xl border border-red-200 bg-red-50 p-6"><p className="text-sm text-red-700">Could not load dashboard: {error.message}</p><button type="button" onClick={() => refetch()} className="mt-3 rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white">Try again</button></section>
    }

    return (
        <AnimatedContent trigger="mount" distance={20} duration={0.5} ease="power3.out" initialOpacity={0} stagger={0.12} className="space-y-6">
            <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div>
                    <p className="text-sm font-medium tracking-wide text-indigo-600">AGENT WORKSPACE</p>
                    <SplitText text="My Dashboard" tag="h2" className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl" splitType="words" from={{ opacity: 0, y: 25 }} to={{ opacity: 1, y: 0 }} duration={0.6} delay={0.1} stagger={0.08} ease="power3.out" textAlign="left" />
                    <p className="mt-2 text-sm leading-6 text-slate-500">Track your assigned tickets, their statuses, and priorities.</p>
                </div>
                <button type="button" onClick={() => { refetch(); refetchPriorities() }} disabled={isFetching || isPriorityFetching} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">{isFetching || isPriorityFetching ? 'Refreshing...' : 'Refresh data'}</button>
            </section>

            <AgentStatCards summary={summary} />

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <section className={chartCard}>
                    <h2 className="text-lg font-bold text-slate-900">My Ticket Status</h2>
                    <p className="mb-5 mt-1 text-sm text-slate-500">Status distribution across all your assigned tickets.</p>
                    {statusData.some((item) => item.value > 0) ? (
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={statusData.filter((item) => item.value > 0)} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius={100} label={({ name, value }) => `${name}: ${getPercentage(value)}%`}>
                                        {statusData.filter((item) => item.value > 0).map((item) => <Cell key={item.name} fill={STATUS_COLORS[statuses.findIndex((status) => status.name === item.name)]} />)}
                                    </Pie>
                                    <Tooltip formatter={(value, name) => [`${getPercentage(value)}% (${value} tickets)`, name]} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : <p className="py-10 text-center text-sm text-slate-500">No ticket status data available.</p>}
                </section>

                <section className={chartCard}>
                    <h2 className="text-lg font-bold text-slate-900">My Ticket Priorities</h2>
                    <p className="mb-5 mt-1 text-sm text-slate-500">Priority distribution across all your assigned tickets.</p>
                    {isPriorityLoading ? (
                        <p className="py-10 text-center text-sm text-slate-500">Loading priority data...</p>
                    ) : priorityError ? (
                        <div className="py-10 text-center">
                            <p className="text-sm text-red-700">Could not load priority data: {priorityError.message}</p>
                            <button type="button" onClick={() => refetchPriorities()} className="mt-3 rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white">Try again</button>
                        </div>
                    ) : priorityData.some((item) => item.value > 0) ? (
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={priorityData.filter((item) => item.value > 0)} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius={100} label={({ name, value }) => `${name}: ${getPercentage(value)}%`}>
                                        {priorityData.filter((item) => item.value > 0).map((item) => <Cell key={item.name} fill={PRIORITY_COLORS[priorities.findIndex((priority) => priority.name === item.name)]} />)}
                                    </Pie>
                                    <Tooltip formatter={(value, name) => [`${getPercentage(value)}% (${value} tickets)`, name]} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : <p className="py-10 text-center text-sm text-slate-500">No ticket priority data available.</p>}
                </section>
            </div>
        </AnimatedContent>
    )
}

export default AgentDashboard
