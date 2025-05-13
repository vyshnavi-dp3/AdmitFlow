import React, { useEffect, useRef } from 'react';
import {
  Chart,
  ChartConfiguration,
  ChartType,
  BarController,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import './PredictionResults.css';

// Register Chart.js components
Chart.register(
  BarController,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend
);

interface SOPAnalysis {
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  summary: string;
  keywords?: string[];
}

interface LORAnalysis {
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  summary: string;
  recommenderCredibility?: number;
}

interface PredictionResult {
  probability: number;
  sopAnalysis: SOPAnalysis;
  lorAnalysis: LORAnalysis;
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

// Add interface for scatter plot data point
interface ScatterDataPoint {
  x: number;
  y: number;
}

const PredictionResults: React.FC<PredictionResultsProps> = ({ result, universityName, onBack }) => {
  const admittedCount = result.trainingRecords.filter(r => r.admit === 1).length;
  const totalCount = result.trainingRecords.length;
  const averageGre = result.trainingRecords.reduce((acc, curr) => acc + curr.gre, 0) / totalCount;
  const averageEng = result.trainingRecords.reduce((acc, curr) => acc + curr.eng, 0) / totalCount;

  // Chart refs
  const greDistributionRef = useRef<HTMLCanvasElement>(null);
  const admissionTrendRef = useRef<HTMLCanvasElement>(null);
  const experienceChartRef = useRef<HTMLCanvasElement>(null);

  // Chart instances refs
  const greChartRef = useRef<Chart | null>(null);
  const trendChartRef = useRef<Chart | null>(null);
  const experienceChartInstanceRef = useRef<Chart | null>(null);

  // Add new ref for comparison chart
  const comparisonChartRef = useRef<HTMLCanvasElement>(null);
  const comparisonChartInstanceRef = useRef<Chart | null>(null);

  // Get recent admits and rejects
  const recentAdmits = result.trainingRecords
    .filter(r => r.admit === 1)
    .slice(-5)
    .reverse();
  
  const recentRejects = result.trainingRecords
    .filter(r => r.admit === 0)
    .slice(-5)
    .reverse();

  useEffect(() => {
    // Cleanup function to destroy charts
    const cleanup = () => {
      if (greChartRef.current) {
        greChartRef.current.destroy();
        greChartRef.current = null;
      }
      if (trendChartRef.current) {
        trendChartRef.current.destroy();
        trendChartRef.current = null;
      }
      if (experienceChartInstanceRef.current) {
        experienceChartInstanceRef.current.destroy();
        experienceChartInstanceRef.current = null;
      }
      if (comparisonChartInstanceRef.current) {
        comparisonChartInstanceRef.current.destroy();
        comparisonChartInstanceRef.current = null;
      }
    };

    // Clean up existing charts
    cleanup();

    // GRE Score Distribution Chart
    if (greDistributionRef.current) {
      const ctx = greDistributionRef.current.getContext('2d');
      if (!ctx) return;

      const greRanges = {
        '260-280': 0,
        '281-300': 0,
        '301-320': 0,
        '321-340': 0
      };

      result.trainingRecords.forEach(record => {
        if (record.gre >= 260 && record.gre <= 280) greRanges['260-280']++;
        else if (record.gre <= 300) greRanges['281-300']++;
        else if (record.gre <= 320) greRanges['301-320']++;
        else greRanges['321-340']++;
      });

      greChartRef.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: Object.keys(greRanges),
          datasets: [{
            label: 'Number of Students',
            data: Object.values(greRanges),
            backgroundColor: '#ffb74d',
            borderColor: '#ff6b35',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'GRE Score Distribution',
              font: { size: 16 }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Number of Students'
              }
            }
          }
        }
      });
    }

    // Admission Rate Trend Chart
    if (admissionTrendRef.current) {
      const ctx = admissionTrendRef.current.getContext('2d');
      if (!ctx) return;

      const records = [...result.trainingRecords].reverse();
      const admissionRates = [];
      const labels = [];

      for (let i = 0; i < records.length; i += 5) {
        const batch = records.slice(i, i + 5);
        if (batch.length > 0) {
          const rate = (batch.filter(r => r.admit === 1).length / batch.length) * 100;
          admissionRates.push(rate);
          labels.push(`Batch ${Math.floor(i/5) + 1}`);
        }
      }

      trendChartRef.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Admission Rate (%)',
            data: admissionRates,
            borderColor: '#ff6b35',
            backgroundColor: 'rgba(255, 107, 53, 0.1)',
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Admission Rate Trend',
              font: { size: 16 }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              title: {
                display: true,
                text: 'Admission Rate (%)'
              }
            }
          }
        }
      });
    }

    // Work Experience vs Admission Chart
    if (experienceChartRef.current) {
      const ctx = experienceChartRef.current.getContext('2d');
      if (!ctx) return;

      const experienceRanges = {
        '0-6 months': { admitted: 0, rejected: 0 },
        '7-12 months': { admitted: 0, rejected: 0 },
        '13-24 months': { admitted: 0, rejected: 0 },
        '25+ months': { admitted: 0, rejected: 0 }
      };

      result.trainingRecords.forEach(record => {
        const exp = record.exp;
        const range = exp <= 6 ? '0-6 months' :
                     exp <= 12 ? '7-12 months' :
                     exp <= 24 ? '13-24 months' : '25+ months';
        
        if (record.admit === 1) {
          experienceRanges[range].admitted++;
        } else {
          experienceRanges[range].rejected++;
        }
      });

      experienceChartInstanceRef.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: Object.keys(experienceRanges),
          datasets: [
            {
              label: 'Admitted',
              data: Object.values(experienceRanges).map(r => r.admitted),
              backgroundColor: '#ffb74d'
            },
            {
              label: 'Rejected',
              data: Object.values(experienceRanges).map(r => r.rejected),
              backgroundColor: '#ff8a65'
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Work Experience Distribution',
              font: { size: 16 }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Number of Students'
              }
            }
          }
        }
      });
    }

    // Comparison Chart - Average Scores
    if (comparisonChartRef.current) {
      const ctx = comparisonChartRef.current.getContext('2d');
      if (!ctx) return;

      const admittedRecords = result.trainingRecords.filter(r => r.admit === 1);
      const rejectedRecords = result.trainingRecords.filter(r => r.admit === 0);

      const calculateAverage = (records: typeof result.trainingRecords, key: keyof typeof records[0]) => {
        return records.reduce((sum, record) => sum + record[key], 0) / records.length;
      };

      comparisonChartInstanceRef.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['GRE Score', 'English Score', 'Work Experience', 'Research Papers'],
          datasets: [
            {
              label: 'Admitted Students',
              data: [
                calculateAverage(admittedRecords, 'gre'),
                calculateAverage(admittedRecords, 'eng'),
                calculateAverage(admittedRecords, 'exp'),
                calculateAverage(admittedRecords, 'papers')
              ],
              backgroundColor: '#ffb74d',
              borderColor: '#ffb74d',
              borderWidth: 1
            },
            {
              label: 'Rejected Students',
              data: [
                calculateAverage(rejectedRecords, 'gre'),
                calculateAverage(rejectedRecords, 'eng'),
                calculateAverage(rejectedRecords, 'exp'),
                calculateAverage(rejectedRecords, 'papers')
              ],
              backgroundColor: '#ff8a65',
              borderColor: '#ff8a65',
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Average Scores Comparison',
              font: { size: 16 }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const value = context.raw as number;
                  const label = context.dataset.label;
                  const metric = context.label;
                  return `${label} - ${metric}: ${value.toFixed(1)}`;
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Average Score'
              }
            }
          }
        }
      });
    }

    // Cleanup on unmount
    return cleanup;
  }, [result]);

  // Calculate insights
  const calculateInsights = () => {
    const admittedRecords = result.trainingRecords.filter(r => r.admit === 1);
    const rejectedRecords = result.trainingRecords.filter(r => r.admit === 0);
    
    // Calculate average GRE difference
    const avgGreAdmitted = admittedRecords.reduce((sum, r) => sum + r.gre, 0) / admittedRecords.length;
    const avgGreRejected = rejectedRecords.reduce((sum, r) => sum + r.gre, 0) / rejectedRecords.length;
    const greDifference = avgGreAdmitted - avgGreRejected;

    // Calculate experience impact
    const avgExpAdmitted = admittedRecords.reduce((sum, r) => sum + r.exp, 0) / admittedRecords.length;
    const avgExpRejected = rejectedRecords.reduce((sum, r) => sum + r.exp, 0) / rejectedRecords.length;
    const expDifference = avgExpAdmitted - avgExpRejected;

    // Calculate research impact
    const avgPapersAdmitted = admittedRecords.reduce((sum, r) => sum + r.papers, 0) / admittedRecords.length;
    const avgPapersRejected = rejectedRecords.reduce((sum, r) => sum + r.papers, 0) / rejectedRecords.length;
    const papersDifference = avgPapersAdmitted - avgPapersRejected;

    return {
      greDifference,
      expDifference,
      papersDifference,
      avgGreAdmitted,
      avgExpAdmitted,
      avgPapersAdmitted
    };
  };

  const insights = calculateInsights();

  return (
    <div className="prediction-results">
      <div className="results-header">
        <button onClick={onBack} className="back-button">
          ← Back to Search
        </button>
        <h2>{universityName}</h2>
      </div>

      <div className="results-grid">
        {/* Left Column - Main Analysis */}
        <div className="main-analysis">
          {/* University Summary Card */}
          <div className="university-summary">
            <h3>University Overview</h3>
            <div className="university-info-grid">
              <div className="university-info-item">
                <span className="info-label">Location</span>
                <span className="info-value">Stanford, CA</span>
              </div>
              <div className="university-info-item">
                <span className="info-label">Program Type</span>
                <span className="info-value">Masters in Computer Science</span>
              </div>
              <div className="university-info-item">
                <span className="info-label">Duration</span>
                <span className="info-value">2 Years</span>
              </div>
            </div>

            <div className="university-stats">
              <div className="stat-box">
                <span className="stat-box-label">Acceptance Rate</span>
                <span className="stat-box-value">5.2%</span>
              </div>
              <div className="stat-box">
                <span className="stat-box-label">Avg GRE Score</span>
                <span className="stat-box-value">325</span>
              </div>
              <div className="stat-box">
                <span className="stat-box-label">Avg GPA</span>
                <span className="stat-box-value">3.8</span>
              </div>
              <div className="stat-box">
                <span className="stat-box-label">Class Size</span>
                <span className="stat-box-value">120</span>
              </div>
            </div>

            <div className="university-description">
              <p>
                Stanford University's Computer Science program is renowned for its cutting-edge research and innovative curriculum. 
                The program emphasizes both theoretical foundations and practical applications, preparing students for leadership roles 
                in technology and research.
              </p>
              <div className="highlight-tags">
                <span className="highlight-tag">Top 5 CS Program</span>
                <span className="highlight-tag">Research Focus</span>
                <span className="highlight-tag">Silicon Valley Location</span>
                <span className="highlight-tag">Industry Connections</span>
              </div>
            </div>
          </div>

          <div className="probability-card">
            <h3>Admission Probability</h3>
            <div className={`probability-value ${result.probability < 0.4 ? 'low' : result.probability < 0.7 ? 'medium' : 'high'}`}>
              {(result.probability * 100).toFixed(1)}%
            </div>
          </div>

          {/* SOP Analysis Card */}
          <div className="analysis-card sop-analysis">
            <h3>Statement of Purpose Analysis</h3>
            <div className="score-section">
              <div className="score-label">SOP Score:</div>
              <div className={`score-value ${result.sopAnalysis.score < 4 ? 'low' : result.sopAnalysis.score < 7 ? 'medium' : 'high'}`}>
                {result.sopAnalysis.score.toFixed(1)}/10
              </div>
            </div>
            <div className="analysis-section">
              <div className="summary-section">
                <h4>Summary</h4>
                <p>{result.sopAnalysis.summary}</p>
              </div>
              <div className="analysis-grid">
                <div className="analysis-column">
                  <h4>Strengths</h4>
                  <ul className="strength-list">
                    {result.sopAnalysis.strengths.map((strength, index) => (
                      <li key={`strength-${index}`}>{strength}</li>
                    ))}
                  </ul>
                </div>
                <div className="analysis-column">
                  <h4>Areas for Improvement</h4>
                  <ul className="weakness-list">
                    {result.sopAnalysis.weaknesses.map((weakness, index) => (
                      <li key={`weakness-${index}`}>{weakness}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="suggestions-section">
                <h4>Suggestions for Improvement</h4>
                <ul className="suggestion-list">
                  {result.sopAnalysis.suggestions.map((suggestion, index) => (
                    <li key={`suggestion-${index}`}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* LOR Analysis Card */}
          <div className="analysis-card lor-analysis">
            <h3>Letter of Recommendation Analysis</h3>
            <div className="score-section">
              <div className="score-label">LOR Score:</div>
              <div className={`score-value ${result.lorAnalysis.score < 4 ? 'low' : result.lorAnalysis.score < 7 ? 'medium' : 'high'}`}>
                {result.lorAnalysis.score.toFixed(1)}/10
              </div>
            </div>
            <div className="analysis-section">
              <div className="summary-section">
                <h4>Summary</h4>
                <p>{result.lorAnalysis.summary}</p>
              </div>
              <div className="analysis-grid">
                <div className="analysis-column">
                  <h4>Strengths</h4>
                  <ul className="strength-list">
                    {result.lorAnalysis.strengths.map((strength, index) => (
                      <li key={`lor-strength-${index}`}>{strength}</li>
                    ))}
                  </ul>
                </div>
                <div className="analysis-column">
                  <h4>Areas for Improvement</h4>
                  <ul className="weakness-list">
                    {result.lorAnalysis.weaknesses.map((weakness, index) => (
                      <li key={`lor-weakness-${index}`}>{weakness}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="suggestions-section">
                <h4>Suggestions for Improvement</h4>
                <ul className="suggestion-list">
                  {result.lorAnalysis.suggestions.map((suggestion, index) => (
                    <li key={`lor-suggestion-${index}`}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Recent Decisions Card - Moved here */}
          <div className="analysis-card recent-decisions">
            <h3>Recent Decisions</h3>
            <div className="decisions-grid">
              <div className="decisions-column">
                <h4>Recent Admits</h4>
                {result.trainingRecords
                  .filter(r => r.admit === 1)
                  .slice(-3)
                  .map((record, index) => (
                    <div key={`admit-${index}`} className="decision-card admit">
                      <div className="decision-stats">
                        <div className="stat-row">
                          <span>GRE:</span>
                          <strong>{record.gre}</strong>
                        </div>
                        <div className="stat-row">
                          <span>English:</span>
                          <strong>{record.eng}</strong>
                        </div>
                        <div className="stat-row">
                          <span>Experience:</span>
                          <strong>{record.exp} months</strong>
                        </div>
                        <div className="stat-row">
                          <span>Papers:</span>
                          <strong>{record.papers}</strong>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
              <div className="decisions-column">
                <h4>Recent Rejects</h4>
                {result.trainingRecords
                  .filter(r => r.admit === 0)
                  .slice(-3)
                  .map((record, index) => (
                    <div key={`reject-${index}`} className="decision-card reject">
                      <div className="decision-stats">
                        <div className="stat-row">
                          <span>GRE:</span>
                          <strong>{record.gre}</strong>
                        </div>
                        <div className="stat-row">
                          <span>English:</span>
                          <strong>{record.eng}</strong>
                        </div>
                        <div className="stat-row">
                          <span>Experience:</span>
                          <strong>{record.exp} months</strong>
                        </div>
                        <div className="stat-row">
                          <span>Papers:</span>
                          <strong>{record.papers}</strong>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Historical Data */}
        <div className="historical-data">
          <div className="analysis-card stats-card">
            <h3>Application Statistics</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Total Applications</span>
                <span className="stat-value">{result.trainingRecords.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Acceptance Rate</span>
                <span className="stat-value">
                  {((result.trainingRecords.filter(r => r.admit === 1).length / result.trainingRecords.length) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Avg GRE Score</span>
                <span className="stat-value">
                  {(result.trainingRecords.reduce((acc, curr) => acc + curr.gre, 0) / result.trainingRecords.length).toFixed(0)}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Avg Experience</span>
                <span className="stat-value">
                  {(result.trainingRecords.reduce((acc, curr) => acc + curr.exp, 0) / result.trainingRecords.length).toFixed(1)} months
                </span>
              </div>
            </div>
          </div>

          <div className="charts-container">
            <div className="chart-wrapper">
              <canvas ref={greDistributionRef}></canvas>
            </div>
            <div className="chart-wrapper">
              <canvas ref={admissionTrendRef}></canvas>
            </div>
            <div className="chart-wrapper">
              <canvas ref={experienceChartRef}></canvas>
            </div>
            <div className="chart-wrapper">
              <canvas ref={comparisonChartRef}></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionResults; 