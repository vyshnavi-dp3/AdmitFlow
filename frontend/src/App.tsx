import React, { useState } from 'react';
import UniversitySearch from './components/UniversitySearch';
import AdmissionForm from './components/AdmissionForm';
import PredictionResults from './components/PredictionResults';
import './App.css';

interface University {
  university_id: number;
  university_name: string;
  university_global_rank: number;
  course_program_label: string;
  parent_course_name: string;
}

interface PredictionResult {
  probability: number;
  trainingRecords: Array<{
    gre: number;
    eng: number;
    exp: number;
    papers: number;
    admit: number;
  }>;
}

function App() {
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUniversitySelect = (university: University) => {
    setSelectedUniversity(university);
    setPredictionResult(null);
    setError(null);
  };

  const handleFormSubmit = async (formData: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:3020/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collegeId: selectedUniversity?.university_id,
          greScore: formData.greScore,
          scoreType: formData.scoreType,
          score: formData.score,
          workExpMonths: formData.workExpMonths,
          sopScore: formData.sopScore,
          lorScore: formData.lorScore,
          noOfPapers: formData.noOfPapers
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get prediction');
      }

      setPredictionResult(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get prediction');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToSearch = () => {
    setSelectedUniversity(null);
    setPredictionResult(null);
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1><span>Path2Admit</span></h1>
      </header>
      <main className="main-content">
        {!selectedUniversity ? (
          <>
            <h2 className="section-title">Find Your Dream University</h2>
            <UniversitySearch onSelectUniversity={handleUniversitySelect} />
          </>
        ) : predictionResult ? (
          <PredictionResults
            result={predictionResult}
            universityName={selectedUniversity.university_name}
            onBack={handleBackToSearch}
          />
        ) : (
          <>
            <h2 className="section-title">Complete Your Application</h2>
            <AdmissionForm
              university={selectedUniversity}
              onSubmit={handleFormSubmit}
            />
            
            {loading && (
              <div className="loading-message">
                Calculating your admission probability...
              </div>
            )}

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
