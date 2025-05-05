import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

interface University {
  university_id: number;
  university_name: string;
  university_global_rank: number;
  course_program_label: string;
  parent_course_name: string;
}

interface UniversitySearchProps {
  onSelectUniversity: (university: University) => void;
}

const UniversitySearch: React.FC<UniversitySearchProps> = ({ onSelectUniversity }) => {
  const [universities, setUniversities] = useState<University[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const response = await axios.get('http://localhost:3020/api/universitys');
        if (response.data.success) {
          setUniversities(response.data.data);
        } else {
          setError('Failed to fetch universities');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching universities:', error);
        setError('Failed to fetch universities. Please make sure the backend server is running.');
        setLoading(false);
      }
    };

    fetchUniversities();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredUniversities = universities.filter(university =>
    university.university_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setShowDropdown(true);
  };

  const handleUniversitySelect = (university: University) => {
    setSearchTerm(university.university_name);
    setShowDropdown(false);
    onSelectUniversity(university);
  };

  if (loading) {
    return <div className="loading">Loading universities...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="search-container">
      <div className="search-input-container" ref={dropdownRef}>
        <input
          type="text"
          className="search-input"
          placeholder="Search universities..."
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setShowDropdown(true)}
        />
        {showDropdown && (
          <div className="search-dropdown">
            {filteredUniversities.length > 0 ? (
              filteredUniversities.map((university) => (
                <div
                  key={university.university_id}
                  className="dropdown-item"
                  onClick={() => handleUniversitySelect(university)}
                >
                  {university.university_name}
                </div>
              ))
            ) : (
              <div className="no-results">No universities found</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UniversitySearch; 