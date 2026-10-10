
function SearchBar({ value, onChange }) {
    return (
        <input
            className="search-input"
            type="search"
            placeholder="Search tickets..."
            value={value}
            onChange={(event) => onChange(event.target.value)}
        />
    )
}

export default SearchBar
