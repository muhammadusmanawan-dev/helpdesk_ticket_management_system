import { Ticket, Clock3, ArrowUpRight, LoaderCircle, CircleCheck, Archive } from 'lucide-react'
import StatCard from '../../molecules/StatCard'

const statistics = [
    { key: 'total_tickets', title: 'Total Assigned', description: 'Tickets assigned to you', icon: Ticket, color: 'bg-blue-50 text-blue-700' },
    { key: 'open_tickets', title: 'Open', description: 'Waiting for action', icon: Clock3, color: 'bg-amber-50 text-amber-700' },
    { key: 'assigned_tickets', title: 'Assigned', description: 'Tickets awaiting work', icon: ArrowUpRight, color: 'bg-violet-50 text-violet-700' },
    { key: 'in_progress_tickets', title: 'In Progress', description: 'Currently being handled', icon: LoaderCircle, color: 'bg-cyan-50 text-cyan-700' },
    { key: 'resolved_tickets', title: 'Resolved', description: 'Successfully resolved', icon: CircleCheck, color: 'bg-emerald-50 text-emerald-700' },
    { key: 'closed_tickets', title: 'Closed', description: 'Closed tickets', icon: Archive, color: 'bg-slate-100 text-slate-700' },
]

function AgentStatCards({ summary = {} }) {
    return (
        <section aria-label="Agent ticket statistics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {statistics.map((stat) => (
                <StatCard
                    key={stat.key}
                    title={stat.title}
                    value={summary[stat.key] ?? 0}
                    description={stat.description}
                    icon={stat.icon}
                    color={stat.color}
                />
            ))}
        </section>
    )
}

export default AgentStatCards
