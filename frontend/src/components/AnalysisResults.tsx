import React from 'react';

interface AnalysisData {
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  summary: string;
  college_context?: string;
  college_name?: string;
  program?: string;
  lor_text?: string;
  document?: string;
}

interface PredictionResult {
  prediction: number;
  probability: number;
  university_name: string;
  program: string;
}

interface AnalysisResultsProps {
  sopAnalysis: AnalysisData;
  lorAnalysis: AnalysisData;
  predictionResult?: PredictionResult;
  visible: boolean;
}

const SummaryCard: React.FC<{
  title: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
  summary: string;
  colorClass: string;
}> = ({ title, score, strengths, weaknesses, summary, colorClass }) => (
  <div className={`p-6 bg-white rounded-lg shadow-lg border ${colorClass} hover:shadow-xl transition-shadow duration-200`}>
    <div className="flex justify-between items-start mb-4">
      <h3 className="text-xl font-bold">{title}</h3>
      <div className="text-2xl font-bold text-indigo-600">
        {score}/10
      </div>
    </div>
    
    <div className="space-y-4">
      <div>
        <h4 className="font-semibold text-green-600 mb-2">Key Strengths</h4>
        <ul className="space-y-1">
          {strengths.slice(0, 2).map((strength, index) => (
            <li key={index} className="text-sm text-gray-600 flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              {strength}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="font-semibold text-red-600 mb-2">Areas to Improve</h4>
        <ul className="space-y-1">
          {weaknesses.slice(0, 2).map((weakness, index) => (
            <li key={index} className="text-sm text-gray-600 flex items-start">
              <span className="text-red-500 mr-2">!</span>
              {weakness}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="font-semibold text-gray-700 mb-2">Quick Summary</h4>
        <p className="text-sm text-gray-600 line-clamp-3">{summary}</p>
      </div>
    </div>
  </div>
);

const PredictionCard: React.FC<{ prediction: PredictionResult }> = ({ prediction }) => (
  <div className="p-6 bg-white rounded-lg shadow-lg border border-blue-200 hover:shadow-xl transition-shadow duration-200 mb-8">
    <h3 className="text-xl font-bold mb-4 text-blue-800">Admission Prediction</h3>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="prediction-score text-center p-4 bg-blue-50 rounded-lg">
        <div className="text-3xl font-bold text-blue-600 mb-2">
          {(prediction.probability * 100).toFixed(1)}%
        </div>
        <div className="text-sm text-blue-700">
          Admission Probability
        </div>
      </div>

      <div className="prediction-result text-center p-4 bg-blue-50 rounded-lg">
        <div className="text-2xl font-bold text-blue-600 mb-2">
          {prediction.prediction === 1 ? 'Likely' : 'Unlikely'}
        </div>
        <div className="text-sm text-blue-700">
          Admission Prediction
        </div>
      </div>
    </div>

    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <div className="text-gray-700">
        <div className="mb-2">
          <span className="font-semibold">University:</span> {prediction.university_name}
        </div>
        <div>
          <span className="font-semibold">Program:</span> {prediction.program}
        </div>
      </div>
    </div>
  </div>
);

const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  sopAnalysis,
  lorAnalysis,
  predictionResult,
  visible
}) => {
  if (!visible) return null;

  return (
    <div className="analysis-results max-w-6xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Application Analysis Results</h2>

      {/* Prediction Results */}
      {predictionResult && <PredictionCard prediction={predictionResult} />}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <SummaryCard
          title="Statement of Purpose"
          score={sopAnalysis.score}
          strengths={sopAnalysis.strengths}
          weaknesses={sopAnalysis.weaknesses}
          summary={sopAnalysis.summary}
          colorClass="border-indigo-200"
        />
        <SummaryCard
          title="Letter of Recommendation"
          score={lorAnalysis.score}
          strengths={lorAnalysis.strengths}
          weaknesses={lorAnalysis.weaknesses}
          summary={lorAnalysis.summary}
          colorClass="border-purple-200"
        />
      </div>

      {/* College Context */}
      <div className="mb-8 p-6 bg-white rounded-lg shadow-lg border border-gray-200">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Analysis Context</h3>
        <div className="mb-6">
          <h4 className="font-semibold text-indigo-700 mb-2">College Information</h4>
          <p className="text-gray-700 bg-indigo-50 p-4 rounded">
            {sopAnalysis.college_context || lorAnalysis.college_context || 'No college context available'}
          </p>
        </div>
      </div>

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SOP Analysis */}
        <div className="analysis-section p-6 bg-white rounded-lg shadow-lg border border-gray-200">
          <h3 className="text-xl font-semibold mb-4 text-indigo-700">Statement of Purpose - Detailed Analysis</h3>
          
          <div className="mb-6">
            <h4 className="font-semibold text-green-600 text-lg mb-2 flex items-center">
              <span className="mr-2">✓</span> All Strengths
            </h4>
            <ul className="list-none space-y-2">
              {sopAnalysis.strengths.map((strength, index) => (
                <li key={index} className="pl-4 border-l-4 border-green-400 bg-green-50 p-2 rounded">
                  {strength}
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-6">
            <h4 className="font-semibold text-red-600 text-lg mb-2 flex items-center">
              <span className="mr-2">!</span> All Areas for Improvement
            </h4>
            <ul className="list-none space-y-2">
              {sopAnalysis.weaknesses.map((weakness, index) => (
                <li key={index} className="pl-4 border-l-4 border-red-400 bg-red-50 p-2 rounded">
                  {weakness}
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-6">
            <h4 className="font-semibold text-blue-600 text-lg mb-2 flex items-center">
              <span className="mr-2">💡</span> Suggestions
            </h4>
            <ul className="list-none space-y-2">
              {sopAnalysis.suggestions.map((suggestion, index) => (
                <li key={index} className="pl-4 border-l-4 border-blue-400 bg-blue-50 p-2 rounded">
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-700 text-lg mb-2">Full Analysis</h4>
            <p className="text-gray-600 bg-gray-50 p-4 rounded border border-gray-200">
              {sopAnalysis.summary}
            </p>
          </div>
        </div>

        {/* LOR Analysis */}
        <div className="analysis-section p-6 bg-white rounded-lg shadow-lg border border-gray-200">
          <h3 className="text-xl font-semibold mb-4 text-purple-700">Letter of Recommendation - Detailed Analysis</h3>
          
          <div className="mb-6">
            <h4 className="font-semibold text-green-600 text-lg mb-2 flex items-center">
              <span className="mr-2">✓</span> All Strengths
            </h4>
            <ul className="list-none space-y-2">
              {lorAnalysis.strengths.map((strength, index) => (
                <li key={index} className="pl-4 border-l-4 border-green-400 bg-green-50 p-2 rounded">
                  {strength}
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-6">
            <h4 className="font-semibold text-red-600 text-lg mb-2 flex items-center">
              <span className="mr-2">!</span> All Areas for Improvement
            </h4>
            <ul className="list-none space-y-2">
              {lorAnalysis.weaknesses.map((weakness, index) => (
                <li key={index} className="pl-4 border-l-4 border-red-400 bg-red-50 p-2 rounded">
                  {weakness}
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-6">
            <h4 className="font-semibold text-blue-600 text-lg mb-2 flex items-center">
              <span className="mr-2">💡</span> Suggestions
            </h4>
            <ul className="list-none space-y-2">
              {lorAnalysis.suggestions.map((suggestion, index) => (
                <li key={index} className="pl-4 border-l-4 border-blue-400 bg-blue-50 p-2 rounded">
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-700 text-lg mb-2">Full Analysis</h4>
            <p className="text-gray-600 bg-gray-50 p-4 rounded border border-gray-200">
              {lorAnalysis.summary}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResults; 