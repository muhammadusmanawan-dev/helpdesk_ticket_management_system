function StatValue({ value }) {
    return (
        <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            {value ?? 0}
        </p>
    )
}

export default StatValue
