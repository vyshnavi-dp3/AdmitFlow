import React, { useState, useRef } from 'react';

interface University {
  university_id: number;
  university_name: string;
  university_global_rank: number;
  course_program_label: string;
  parent_course_name: string;
}

interface AdmissionFormProps {
  university: University;
  onSubmit: (data: any) => void;
}

const AdmissionForm: React.FC<AdmissionFormProps> = ({ university, onSubmit }) => {
  const [formData, setFormData] = useState({
    greScore: '',
    scoreType: 'toefl',
    score: '',
    workExpMonths: '',
    researchPapers: '',
  });

  const [sopFile, setSopFile] = useState<File | null>(null);
  const [lorFile, setLorFile] = useState<File | null>(null);
  const sopFileRef = useRef<HTMLInputElement>(null);
  const lorFileRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'sop' | 'lor') => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'sop') {
        setSopFile(file);
      } else {
        setLorFile(file);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      collegeId: university.university_id,
      greScore: parseInt(formData.greScore),
      scoreType: formData.scoreType,
      score: parseInt(formData.score),
      workExpMonths: parseInt(formData.workExpMonths),
      researchPapers: parseInt(formData.researchPapers),
      sopScore: 8, // Random score as requested
      lorScore: 9, // Random score as requested
      noOfPapers: parseInt(formData.researchPapers)
    };

    onSubmit(submitData);
  };

  return (
    <div className="form-container">
      <h3 className="form-title">Application Details for {university.university_name}</h3>
      <form onSubmit={handleSubmit} className="application-form">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="greScore">GRE Score</label>
            <input
              type="number"
              id="greScore"
              name="greScore"
              value={formData.greScore}
              onChange={handleChange}
              min="260"
              max="340"
              required
              placeholder="Enter your GRE score (260-340)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="scoreType">English Proficiency Test</label>
            <select
              id="scoreType"
              name="scoreType"
              value={formData.scoreType}
              onChange={handleChange}
              required
            >
              <option value="toefl">TOEFL</option>
              <option value="ielts">IELTS</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="score">
              {formData.scoreType === 'toefl' ? 'TOEFL Score' : 'IELTS Score'}
            </label>
            <input
              type="number"
              id="score"
              name="score"
              value={formData.score}
              onChange={handleChange}
              min={formData.scoreType === 'toefl' ? '0' : '0'}
              max={formData.scoreType === 'toefl' ? '120' : '9'}
              step={formData.scoreType === 'toefl' ? '1' : '0.5'}
              required
              placeholder={formData.scoreType === 'toefl' ? 'Enter TOEFL score (0-120)' : 'Enter IELTS score (0-9)'}
            />
          </div>

          <div className="form-group">
            <label htmlFor="workExpMonths">Work Experience (months)</label>
            <input
              type="number"
              id="workExpMonths"
              name="workExpMonths"
              value={formData.workExpMonths}
              onChange={handleChange}
              min="0"
              required
              placeholder="Enter work experience in months"
            />
          </div>

          <div className="form-group">
            <label htmlFor="researchPapers">Number of Research Papers</label>
            <input
              type="number"
              id="researchPapers"
              name="researchPapers"
              value={formData.researchPapers}
              onChange={handleChange}
              min="0"
              required
              placeholder="Enter number of research papers"
            />
          </div>

          <div className="form-group">
            <label htmlFor="sop">Statement of Purpose (PDF)</label>
            <input
              type="file"
              id="sop"
              ref={sopFileRef}
              onChange={(e) => handleFileChange(e, 'sop')}
              accept=".pdf"
              required
            />
            {sopFile && (
              <div className="file-info">
                Selected file: {sopFile.name}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="lor">Letter of Recommendation (PDF)</label>
            <input
              type="file"
              id="lor"
              ref={lorFileRef}
              onChange={(e) => handleFileChange(e, 'lor')}
              accept=".pdf"
              required
            />
            {lorFile && (
              <div className="file-info">
                Selected file: {lorFile.name}
              </div>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-button">
            Submit Application
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdmissionForm; 