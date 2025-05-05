import React, { useState } from 'react';
import UniversitySearch from './components/UniversitySearch';
import AdmissionForm from './components/AdmissionForm';
import ApplicationDetails from './components/ApplicationDetails';
import './App.css';

interface University {
  university_id: number;
  university_name: string;
  university_global_rank: number;
  course_program_label: string;
  parent_course_name: string;
}

function App() {
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);
  const [showApplicationDetails, setShowApplicationDetails] = useState(false);
  const [personalInfo, setPersonalInfo] = useState<any>(null);

  const handleUniversitySelect = (university: University) => {
    setSelectedUniversity(university);
  };

  const handlePersonalInfoSubmit = (formData: any) => {
    setPersonalInfo(formData);
    setShowApplicationDetails(true);
  };

  const handleApplicationDetailsSubmit = (formData: any) => {
    console.log('Complete application:', {
      university: selectedUniversity,
      personalInfo,
      applicationDetails: formData
    });
    // Here you would typically send the data to your backend
    alert('Application submitted successfully!');
    setSelectedUniversity(null);
    setShowApplicationDetails(false);
    setPersonalInfo(null);
  };

  const handleBack = () => {
    setShowApplicationDetails(false);
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1><span>AdmitFlow</span></h1>
      </header>
      <main className="main-content">
        {!selectedUniversity ? (
          <>
            <h2 className="section-title">Find Your Dream University</h2>
            <UniversitySearch onSelectUniversity={handleUniversitySelect} />
          </>
        ) : !showApplicationDetails ? (
          <>
            <h2 className="section-title">Complete Your Application</h2>
            <AdmissionForm
              university={selectedUniversity}
              onSubmit={handlePersonalInfoSubmit}
            />
          </>
        ) : (
          <>
            <h2 className="section-title">Additional Application Details</h2>
            <ApplicationDetails
              onSubmit={handleApplicationDetailsSubmit}
              onBack={handleBack}
            />
          </>
        )}
      </main>
    </div>
  );
}

export default App;
