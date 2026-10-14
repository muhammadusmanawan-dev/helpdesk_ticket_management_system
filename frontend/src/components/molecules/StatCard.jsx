import IconBadge from '../atoms/IconBadge'
import StatValue from '../atoms/StatValue'

function StatCard({ title, value, description, icon, color }) {
    return (
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-medium text-slate-500">
                        {title}
                    </p>
                    <StatValue value={value} />
                </div>

                {icon && <IconBadge icon={icon} color={color} />}
            </div>

            <p className="mt-4 text-xs text-slate-500">
                {description}
            </p>
        </article>
    )
}

export default StatCard
