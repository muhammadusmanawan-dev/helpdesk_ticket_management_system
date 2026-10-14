
import AdminStatCard from '../../molecules/AdminStatCard'

const statistics = [
    {
        key: 'total_tickets',
        title: 'Total Tickets',
        description: 'All tickets in the system',
        icon: '▤',
        color: 'bg-blue-50 text-blue-700',
    },
    {
        key: 'open_tickets',
        title: 'Open Tickets',
        description: 'Waiting for action',
        icon: '◷',
        color: 'bg-amber-50 text-amber-700',
    },
    {
        key: 'assigned_tickets',
        title: 'Assigned',
        description: 'Tickets with assigned status',
        icon: '↗',
        color: 'bg-violet-50 text-violet-700',
    },
    {
        key: 'in_progress_tickets',
        title: 'In Progress',
        description: 'Currently being handled',
        icon: '◌',
        color: 'bg-cyan-50 text-cyan-700',
    },
    {
        key: 'resolved_tickets',
        title: 'Resolved',
        description: 'Successfully resolved',
        icon: '✓',
        color: 'bg-emerald-50 text-emerald-700',
    },
    {
        key: 'closed_tickets',
        title: 'Closed',
        description: 'Closed support tickets',
        icon: '□',
        color: 'bg-slate-100 text-slate-700',
    },
    {
        key: 'total_agents',
        title: 'Total Agents',
        description: 'Total agent accounts',
        icon: '♙',
        color: 'bg-pink-50 text-pink-700',
    },
]

function AdminStatCards({ summary }) {
    return (
        <section
            aria-label="Ticket statistics"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
            {statistics.map((stat) => (
                <AdminStatCard
                    key={stat.key}
                    title={stat.title}
                    value={summary[stat.key]}
                    description={stat.description}
                    icon={stat.icon}
                    color={stat.color}
                />
            ))}
        </section>
    )
}

export default AdminStatCards
