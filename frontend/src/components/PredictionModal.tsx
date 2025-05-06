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

interface PredictionModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: PredictionResult | null;
  universityName: string;
}

const PredictionModal: React.FC<PredictionModalProps> = ({ isOpen, onClose, result, universityName }) => {
  if (!isOpen || !result) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Prediction Results for {universityName}</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        
        <div className="modal-body">
          <div className="probability-section">
            <h3>Your Admission Probability</h3>
            <div className="probability-circle">
              <span className="probability-value">
                {(result.probability * 100).toFixed(2)}%
              </span>
            </div>
          </div>

          <div className="historical-data-section">
            <h3>Historical Data Analysis</h3>
            <div className="records-grid">
              {result.trainingRecords.map((record, index) => (
                <div key={index} className="record-card">
                  <div className="record-header">
                    <span className={`status ${record.admit ? 'admitted' : 'rejected'}`}>
                      {record.admit ? 'Admitted' : 'Rejected'}
                    </span>
                  </div>
                  <div className="record-details">
                    <div className="detail-item">
                      <span className="label">GRE Score:</span>
                      <span className="value">{record.gre}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">English Score:</span>
                      <span className="value">{record.eng}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Experience:</span>
                      <span className="value">{record.exp} months</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Research Papers:</span>
                      <span className="value">{record.papers}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="back-to-search" onClick={onClose}>
            Back to University Search
          </button>
        </div>
      </div>
    </div>
  );
};

export default PredictionModal; 