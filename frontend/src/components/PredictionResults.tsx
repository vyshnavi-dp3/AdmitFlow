import React from 'react';

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

interface PredictionResultsProps {
  result: PredictionResult;
  universityName: string;
  onBack: () => void;
}

const PredictionResults: React.FC<PredictionResultsProps> = ({ result, universityName, onBack }) => {
  const admittedCount = result.trainingRecords.filter(r => r.admit === 1).length;
  const totalCount = result.trainingRecords.length;
  const averageGre = result.trainingRecords.reduce((acc, curr) => acc + curr.gre, 0) / totalCount;
  const averageEng = result.trainingRecords.reduce((acc, curr) => acc + curr.eng, 0) / totalCount;

  // Get recent admits and rejects (last 5 of each)
  const recentAdmits = result.trainingRecords
    .filter(r => r.admit === 1)
    .slice(-5)
    .reverse();
  
  const recentRejects = result.trainingRecords
    .filter(r => r.admit === 0)
    .slice(-5)
    .reverse();

  return (
    <div className="results-container">
      <div className="results-header">
        <h2>Prediction Results for {universityName}</h2>
      </div>

      <div className="results-content">
        <div className="probability-section">
          <h3>Your Admission Probability</h3>
          <div className="probability-circle">
            <span className="probability-value">
              {(result.probability * 100).toFixed(2)}%
            </span>
          </div>
        </div>

        <div className="stats-section">
          <h3>Key Statistics</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <h4>Total Applications</h4>
              <span>{totalCount}</span>
            </div>
            <div className="stat-card">
              <h4>Admission Rate</h4>
              <span>
                {((admittedCount / totalCount) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="stat-card">
              <h4>Average GRE</h4>
              <span>
                {averageGre.toFixed(1)}
              </span>
            </div>
            <div className="stat-card">
              <h4>Average English</h4>
              <span>
                {averageEng.toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        <div className="history-section">
          <div className="history-grid">
            <div className="history-column">
              <h3>Recent Admits</h3>
              <div className="history-cards">
                {recentAdmits.map((record, index) => (
                  <div key={`admit-${index}`} className="history-card admit">
                    <div className="card-header">Admitted Student</div>
                    <div className="card-content">
                      <div className="card-stat">
                        <span className="label">GRE:</span>
                        <span className="value">{record.gre}</span>
                      </div>
                      <div className="card-stat">
                        <span className="label">English:</span>
                        <span className="value">{record.eng}</span>
                      </div>
                      <div className="card-stat">
                        <span className="label">Experience:</span>
                        <span className="value">{record.exp} months</span>
                      </div>
                      <div className="card-stat">
                        <span className="label">Papers:</span>
                        <span className="value">{record.papers}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="history-column">
              <h3>Recent Rejects</h3>
              <div className="history-cards">
                {recentRejects.map((record, index) => (
                  <div key={`reject-${index}`} className="history-card reject">
                    <div className="card-header">Rejected Student</div>
                    <div className="card-content">
                      <div className="card-stat">
                        <span className="label">GRE:</span>
                        <span className="value">{record.gre}</span>
                      </div>
                      <div className="card-stat">
                        <span className="label">English:</span>
                        <span className="value">{record.eng}</span>
                      </div>
                      <div className="card-stat">
                        <span className="label">Experience:</span>
                        <span className="value">{record.exp} months</span>
                      </div>
                      <div className="card-stat">
                        <span className="label">Papers:</span>
                        <span className="value">{record.papers}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="results-footer">
          <button className="back-button" onClick={onBack}>
            Back to Search
          </button>
        </div>
      </div>
    </div>
  );
};

export default PredictionResults; 