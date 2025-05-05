import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Search, Upload, X } from 'lucide-react';
import { evaluateDocument, universityStandards } from './RagBackend';

// Main application component
const RagEvaluator = () => {
  const [documentType, setDocumentType] = useState('LOR');
  const [university, setUniversity] = useState('Stanford University');
  const [documentText, setDocumentText] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleEvaluate = () => {
    if (!documentText.trim()) {
      alert("Please enter your document text first");
      return;
    }
    
    setIsLoading(true);
    
    // Simulate processing time
    setTimeout(() => {
      const result = evaluateDocument(documentText, university, documentType);
      setEvaluation(result);
      setIsLoading(false);
    }, 1000);
  };

  const universitiesList = Object.keys(universityStandards);

  return (
    <div className="flex flex-col p-6 max-w-4xl mx-auto bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6 text-center">LOR & SOP Evaluation System</h1>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">Document Type</label>
          <select 
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            <option value="LOR">Letter of Recommendation</option>
            <option value="SOP">Statement of Purpose</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">University</label>
          <select 
            value={university}
            onChange={(e) => setUniversity(e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            {universitiesList.map(uni => (
              <option key={uni} value={uni}>{uni}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Paste your {documentType} here:</label>
        <textarea 
          value={documentText}
          onChange={(e) => setDocumentText(e.target.value)}
          className="w-full p-2 border rounded-md h-40"
          placeholder={`Enter your ${documentType} text here...`}
        />
      </div>
      
      <button 
  onClick={handleEvaluate}
  disabled={isLoading}
  className="evaluate-button"
>
        {isLoading ? 'Evaluating...' : 'Evaluate Document'}
      </button>
      
      {evaluation && (
        <div className="border rounded-md p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Evaluation Results</h2>
            <div className="flex items-center">
              <span className="mr-2">Score:</span>
              <span className={`text-xl font-bold ${
                evaluation.score >= 8 ? 'text-green-600' : 
                evaluation.score >= 6 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {evaluation.score}/10
              </span>
            </div>
          </div>
          
          <div className="mb-4">
            <h3 className="font-medium mb-2">Criteria Analysis:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {Object.entries(evaluation.analysis).map(([criterion, score]) => (
                <div key={criterion} className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    score >= 8 ? 'bg-green-500' : 
                    score >= 5 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <div className="text-sm">{criterion}: <span className="font-medium">{score}/10</span></div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Suggested Improvements:</h3>
            <ul className="space-y-2">
              {evaluation.feedback.map((item, index) => (
                <li key={index} className="flex items-start">
                  <AlertCircle size={16} className="text-blue-600 mr-2 mt-1" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-700">
              <strong>University Focus:</strong> {universityStandards[university][documentType.toLowerCase()].emphasis}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RagEvaluator;