import { Badge } from '@/components/ui/badge'

function StatusBadge({ status }) {
    const normalizedStatus = (status ?? 'Open').toLowerCase()

    const variantByStatus = {
        open: 'outline',
        assigned: 'secondary',
        in_progress: 'default',
        resolved: 'secondary',
        closed: 'outline',
    }

    const colorByStatus = {
        open: 'border-blue-200 bg-blue-50 text-blue-700',
        assigned: 'border-violet-200 bg-violet-50 text-violet-700',
        in_progress: 'border-amber-200 bg-amber-50 text-amber-700',
        resolved: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        closed: 'border-slate-200 bg-slate-100 text-slate-600',
    }

    const displayStatus = normalizedStatus
        .replaceAll('_', ' ')
        .replace(/\b\w/g, (character) => character.toUpperCase())

    return (
        <Badge
            variant={variantByStatus[normalizedStatus] ?? 'outline'}
            className={colorByStatus[normalizedStatus] ?? 'border-slate-200 bg-slate-50 text-slate-700'}
        >
            {displayStatus}
        </Badge>
    )
}

export default StatusBadge
