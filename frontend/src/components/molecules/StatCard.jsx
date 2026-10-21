import { Card, CardContent } from '../ui/card'

function StatCard({ title, value, description, icon: Icon, color }) {
    return (
        <Card className="border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
            <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="text-sm font-medium text-slate-500">{title}</p>
                        <p className="mt-2 text-2xl font-bold text-slate-900">{value ?? 0}</p>
                    </div>
                    {Icon && <div className={`rounded-xl p-3 ${color}`}><Icon size={22} strokeWidth={1.8} /></div>}
                </div>
                <p className="mt-4 text-xs text-slate-500">{description}</p>
            </CardContent>
        </Card>
    )
}

export default StatCard
