import React, { useState, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';
import AnalysisResults from './AnalysisResults';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

// Interfaces
interface University {
  university_id: number;
  university_name: string;
  university_global_rank: number;
  course_program_label: string;
  parent_course_name: string;
}

interface AnalysisData {
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  summary: string;
}

interface PredictionResult {
  prediction: number;
  probability: number;
  university_name: string;
  program: string;
}

interface AdmissionFormProps {
  university: University;
  onSubmit: (data: {
    collegeId: number;
    greScore: number;
    scoreType: string;
    score: number;
    workExpMonths: number;
    researchPapers: number;
    sopScore: number;
    lorScore: number;
    noOfPapers: number;
    sopAnalysis: AnalysisData;
    lorAnalysis: AnalysisData;
  }) => void;
}

// Helper: parse Markdown-wrapped JSON response
function parseAnalysisResponse(response: any): AnalysisData {
  if (!response || typeof response.text !== 'string') {
    return { 
      score: 0,
      strengths: [],
      weaknesses: [],
      suggestions: [],
      summary: ''
    };
  }
  const jsonString = response.text
    .replace(/```json\s*/, '')
    .replace(/```/, '')
    .trim();
  try {
    const parsed = JSON.parse(jsonString);
    return {
      score: parsed.score ?? 0,
      strengths: parsed.strengths ?? [],
      weaknesses: parsed.weaknesses ?? [],
      suggestions: parsed.suggestions ?? [],
      summary: parsed.summary ?? ''
    };
  } catch (err) {
    console.error('Failed to parse analysis JSON:', err, jsonString);
    return { 
      score: 0,
      strengths: [],
      weaknesses: [],
      suggestions: [],
      summary: ''
    };
  }
}

const AdmissionForm: React.FC<AdmissionFormProps> = ({ university, onSubmit }) => {
  // Form state
  const [formData, setFormData] = useState({
    greScore: '',
    scoreType: 'toefl',
    score: '',
    workExpMonths: '',
    researchPapers: '',
  });

  // File and UI state
  const [sopFile, setSopFile] = useState<File | null>(null);
  const [lorFile, setLorFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sopFileRef = useRef<HTMLInputElement>(null);
  const lorFileRef = useRef<HTMLInputElement>(null);
  const [analysisResults, setAnalysisResults] = useState<{
    sopAnalysis: AnalysisData | null;
    lorAnalysis: AnalysisData | null;
    predictionResult: PredictionResult | null;
    showResults: boolean;
  }>({
    sopAnalysis: null,
    lorAnalysis: null,
    predictionResult: null,
    showResults: false
  });

  // Handle form inputs
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle file selection
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'sop' | 'lor'
  ) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      type === 'sop' ? setSopFile(file) : setLorFile(file);
    }
  };

  // Extract text from a PDF file
  async function extractTextFromPDF(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument(arrayBuffer);
      const pdf = await loadingTask.promise;
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n';
      }
      return fullText;
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      throw new Error('Failed to extract text from PDF');
    }
  }

  // Call backend for analysis
  async function analyzeDocumentCoreBackend(
    type: 'sop' | 'lor',
    documentText: string,
    collegeInfo: any
  ) {
    try {
      const payload = {
        document: documentText,
        college_info: {
          name: collegeInfo.name,
          program: collegeInfo.program,
          department: collegeInfo.department || null,
          keywords: collegeInfo.keywords || [],
        },
      };

      const response = await fetch(
        `http://localhost:5001/api/analyze/${type}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error(`Server error for ${type}:`, errorData);
        throw new Error(`Failed to analyze ${type}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error analyzing ${type}:`, error);
      throw error;
    }
  }

  // Submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setAnalysisResults({
      sopAnalysis: null,
      lorAnalysis: null,
      predictionResult: null,
      showResults: false
    });

    try {
      if (!sopFile || !lorFile) {
        throw new Error('Please upload both SOP and LOR files.');
      }

      // 1. Extract text
      const sopText = await extractTextFromPDF(sopFile);
      const lorText = await extractTextFromPDF(lorFile);

      // 2. College context
      const collegeInfo = {
        name: university.university_name,
        program: university.course_program_label,
        department: university.parent_course_name,
        keywords: [],
      };

      // 3. Analyze texts
      const sopRaw = await analyzeDocumentCoreBackend('sop', sopText, collegeInfo);
      const lorRaw = await analyzeDocumentCoreBackend('lor', lorText, collegeInfo);

      // 4. Parse responses
      const sopAnalysisData = parseAnalysisResponse(sopRaw);
      const lorAnalysisData = parseAnalysisResponse(lorRaw);

      const sopScore = sopAnalysisData.score;
      const lorScore = lorAnalysisData.score;

      // 5. Call prediction API
      const predictionResponse = await fetch('http://localhost:3020/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collegeId: university.university_id,
          greScore: parseInt(formData.greScore, 10),
          scoreType: formData.scoreType,
          score: parseInt(formData.score, 10),
          workExpMonths: parseInt(formData.workExpMonths, 10),
          researchPapers: parseInt(formData.researchPapers, 10),
          sopScore,
          lorScore,
          noOfPapers: parseInt(formData.researchPapers, 10)
        }),
      });

      if (!predictionResponse.ok) {
        throw new Error('Failed to get admission prediction');
      }

      const predictionResult = await predictionResponse.json();

      // 6. Set all results for display
      setAnalysisResults({
        sopAnalysis: sopAnalysisData,
        lorAnalysis: lorAnalysisData,
        predictionResult: {
          prediction: predictionResult.prediction,
          probability: predictionResult.probability,
          university_name: university.university_name,
          program: university.course_program_label
        },
        showResults: true
      });

      // 7. Send final data to parent
      onSubmit({
        collegeId: university.university_id,
        greScore: parseInt(formData.greScore, 10),
        scoreType: formData.scoreType,
        score: parseInt(formData.score, 10),
        workExpMonths: parseInt(formData.workExpMonths, 10),
        researchPapers: parseInt(formData.researchPapers, 10),
        sopScore,
        lorScore,
        noOfPapers: parseInt(formData.researchPapers, 10),
        sopAnalysis: sopAnalysisData,
        lorAnalysis: lorAnalysisData
      });

    } catch (err: any) {
      setError(err.message || 'Failed to analyze documents');
      setAnalysisResults({
        sopAnalysis: null,
        lorAnalysis: null,
        predictionResult: null,
        showResults: false
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admission-form-container">
      <h3 className="form-title">Application Details for {university.university_name}</h3>
      
      <form onSubmit={handleSubmit} className="application-form">
        <div className="form-grid">
          {/* GRE Score */}
          <div className="form-group">
            <label htmlFor="greScore">GRE Score</label>
            <input
              type="number"
              id="greScore"
              name="greScore"
              value={formData.greScore}
              onChange={handleChange}
              min={260}
              max={340}
              required
              placeholder="Enter your GRE score (260-340)"
            />
          </div>

          {/* English Test Type */}
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

          {/* English Score */}
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
              min={0}
              max={formData.scoreType === 'toefl' ? 120 : 9}
              step={formData.scoreType === 'toefl' ? 1 : 0.5}
              required
              placeholder={
                formData.scoreType === 'toefl'
                  ? 'Enter TOEFL score (0-120)'
                  : 'Enter IELTS score (0-9)'
              }
            />
          </div>

          {/* Work Experience */}
          <div className="form-group">
            <label htmlFor="workExpMonths">Work Experience (months)</label>
            <input
              type="number"
              id="workExpMonths"
              name="workExpMonths"
              value={formData.workExpMonths}
              onChange={handleChange}
              min={0}
              required
              placeholder="Enter work experience in months"
            />
          </div>

          {/* Research Papers */}
          <div className="form-group">
            <label htmlFor="researchPapers">Number of Research Papers</label>
            <input
              type="number"
              id="researchPapers"
              name="researchPapers"
              value={formData.researchPapers}
              onChange={handleChange}
              min={0}
              required
              placeholder="Enter number of research papers"
            />
          </div>

          {/* SOP Upload */}
          <div className="form-group">
            <label htmlFor="sop">Statement of Purpose (PDF)</label>
            <input
              type="file"
              id="sop"
              ref={sopFileRef}
              onChange={e => handleFileChange(e, 'sop')}
              accept=".pdf"
              required
            />
            {sopFile && <div className="file-info">Selected file: {sopFile.name}</div>}
          </div>

          {/* LOR Upload */}
          <div className="form-group">
            <label htmlFor="lor">Letter of Recommendation (PDF)</label>
            <input
              type="file"
              id="lor"
              ref={lorFileRef}
              onChange={e => handleFileChange(e, 'lor')}
              accept=".pdf"
              required
            />
            {lorFile && <div className="file-info">Selected file: {lorFile.name}</div>}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Analyzing...' : 'Submit Application'}
          </button>
        </div>
      </form>

      {/* Analysis Results */}
      {analysisResults.showResults && 
       analysisResults.sopAnalysis && 
       analysisResults.lorAnalysis && (
        <AnalysisResults
          sopAnalysis={analysisResults.sopAnalysis}
          lorAnalysis={analysisResults.lorAnalysis}
          predictionResult={analysisResults.predictionResult || undefined}
          visible={analysisResults.showResults}
        />
      )}

      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default AdmissionForm;
