import { Eye, Trash2, UserRound } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import StatusBadge from '../atoms/StatusBadge'

function TicketTable({ tickets = [], onViewDetails, agents, onAssign, onDelete, assigningTicketId, deletingTicketId, hideCustomer = false }) {
    const showAdminActions = Boolean(onAssign || onDelete)
    const columnCount = (hideCustomer ? 4 : 5) + (showAdminActions ? 1 : 0)
    const priorityStyles = {
        low: 'border-slate-200 bg-slate-50 text-slate-600',
        medium: 'border-blue-200 bg-blue-50 text-blue-700',
        high: 'border-orange-200 bg-orange-50 text-orange-700',
        urgent: 'border-red-200 bg-red-50 text-red-700',
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse text-left">
                    <thead>
                        <tr className="bg-slate-50">
                            {['Ticket', ...(!hideCustomer ? ['Customer'] : []), 'Priority', 'Status', 'Action'].map((heading) => (
                                <th key={heading} className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">{heading}</th>
                            ))}
                            {showAdminActions && <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Admin Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {tickets.map((ticket) => {
                            const assignedAgentId = ticket.assigned_agent_id ?? ticket.assigned_to_id ?? ticket.agent_id ?? ''
                            const priority = (ticket.priority ?? 'low').toLowerCase()

                            return (
                                <tr key={ticket.id} className="h-14 transition-colors hover:bg-slate-50/80">
                                    <td className="px-5 py-4">
                                        <p className="max-w-[260px] truncate text-sm font-semibold text-slate-800">{ticket.title}</p>
                                        <p className="mt-1 text-xs text-slate-400">#{ticket.id}</p>
                                    </td>
                                    {!hideCustomer && (
                                        <td className="px-5 py-4 text-sm text-slate-600">{ticket.customer_id ?? 'Customer'}</td>
                                    )}
                                    <td className="px-5 py-4">
                                        <Badge variant="outline" className={priorityStyles[priority] ?? priorityStyles.low}>
                                            {priority.charAt(0).toUpperCase() + priority.slice(1)}
                                        </Badge>
                                    </td>
                                    <td className="px-5 py-4"><StatusBadge status={ticket.status ?? 'Open'} /></td>
                                    <td className="px-5 py-4">
                                        <Button type="button" variant="outline" size="sm" onClick={() => onViewDetails?.(ticket)} className="gap-2">
                                            <Eye size={15} /> View Details
                                        </Button>
                                    </td>
                                    {showAdminActions && (
                                        <td className="px-5 py-4">
                                            <div className="flex min-w-[160px] flex-col gap-2">
                                                {onAssign && (
                                                    <div className="relative">
                                                        <UserRound size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                        <select
                                                            value={assignedAgentId}
                                                            disabled={assigningTicketId === ticket.id}
                                                            onChange={(event) => onAssign(ticket.id, event.target.value)}
                                                            aria-label={`Assign agent to ${ticket.title}`}
                                                            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
                                                        >
                                                            <option value="">Select agent</option>
                                                            {(agents ?? []).map((agent) => (
                                                                <option key={agent.id} value={agent.id}>{agent.email}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                )}
                                                {onDelete && (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        disabled={deletingTicketId === ticket.id}
                                                        onClick={() => onDelete(ticket)}
                                                        className="justify-start gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                    >
                                                        <Trash2 size={14} />
                                                        {deletingTicketId === ticket.id ? 'Deleting...' : 'Delete'}
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            )
                        })}
                        {tickets.length === 0 && (
                            <tr>
                                <td colSpan={columnCount} className="h-14 px-5 text-center">
                                    <p className="text-sm font-medium text-slate-700">No matching tickets found</p>
                                </td>
                            </tr>
                        )}
                        {Array.from({ length: Math.max(0, 10 - tickets.length - (tickets.length === 0 ? 1 : 0)) }).map((_, index) => (
                            <tr key={`empty-${index}`} aria-hidden="true" className="h-14">
                                <td colSpan={columnCount} className="px-5">&nbsp;</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Separator />
        </div>
    )
}

export default TicketTable
