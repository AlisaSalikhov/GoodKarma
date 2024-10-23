import React, { useState } from 'react';

const SearchAndFilter = ({ onSearch, onFilter }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [maxDistance, setMaxDistance] = useState('');
  const [foodType, setFoodType] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleFilter = () => {
    onFilter({
      expirationDate,
      maxDistance: maxDistance ? parseInt(maxDistance) : null,
      foodType
    });
  };

  return (
    <div className="search-and-filter">
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search food items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>
      <div className="filters">
        <input
          type="date"
          placeholder="Expiration date"
          value={expirationDate}
          onChange={(e) => setExpirationDate(e.target.value)}
        />
        <input
          type="number"
          placeholder="Max distance (km)"
          value={maxDistance}
          onChange={(e) => setMaxDistance(e.target.value)}
        />
        <select
          value={foodType}
          onChange={(e) => setFoodType(e.target.value)}
        >
          <option value="">All food types</option>
          <option value="fruits">Fruits</option>
          <option value="vegetables">Vegetables</option>
          <option value="grains">Grains</option>
          <option value="protein">Protein</option>
          <option value="dairy">Dairy</option>
          <option value="other">Other</option>
        </select>
        <button onClick={handleFilter}>Apply Filters</button>
      </div>
    </div>
  );
};

export default SearchAndFilter;
