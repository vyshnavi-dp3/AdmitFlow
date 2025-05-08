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
    <div className="results-container">
      <div className="results-header">
        <h2>Prediction Results for {universityName}</h2>
      </div>
      
      <div className="results-content">
        {/* Top Section - Probability and Stats */}
        <div className="top-section">
          {/* Admission Probability */}
          <div className="probability-section">
            <h3>Your Admission Probability</h3>
            <div className="probability-circle">
              <span className="probability-value">
                {(result.probability * 100).toFixed(2)}%
              </span>
            </div>
          </div>

          {/* Key Statistics */}
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
        </div>

        {/* Analytics Section - University Summary */}
        <div className="analytics-section">
          <h3>University Summary</h3>
          <div className="analytics-grid">
            <div className="analytics-card">
              <h4>GRE Score Distribution</h4>
              <div className="chart-container">
                <canvas ref={greDistributionRef}></canvas>
              </div>
            </div>
            <div className="analytics-card">
              <h4>Admission Rate Trend</h4>
              <div className="chart-container">
                <canvas ref={admissionTrendRef}></canvas>
              </div>
            </div>
            <div className="analytics-card">
              <h4>Work Experience Distribution</h4>
              <div className="chart-container">
                <canvas ref={experienceChartRef}></canvas>
              </div>
            </div>
            <div className="analytics-card">
              <h4>Average Scores Comparison</h4>
              <div className="chart-container">
                <canvas ref={comparisonChartRef}></canvas>
              </div>
            </div>
          </div>
        </div>

        {/* University Insights Section */}
        <div className="insights-section">
          <h3>University Insights</h3>
          <div className="insights-grid">
            <div className="insight-card">
              <h4>
                <span className="insight-icon">📊</span>
                GRE Score Impact
              </h4>
              <p>
                Admitted students typically score {Math.abs(insights.greDifference).toFixed(1)} points 
                {insights.greDifference > 0 ? ' higher' : ' lower'} on the GRE compared to rejected applicants. 
                The average GRE score for admitted students is {insights.avgGreAdmitted.toFixed(1)}.
              </p>
            </div>

            <div className="insight-card">
              <h4>
                <span className="insight-icon">💼</span>
                Work Experience
              </h4>
              <p>
                Successful applicants have {Math.abs(insights.expDifference).toFixed(1)} months 
                {insights.expDifference > 0 ? ' more' : ' less'} work experience on average. 
                The typical admitted student has {insights.avgExpAdmitted.toFixed(1)} months of experience.
              </p>
            </div>

            <div className="insight-card">
              <h4>
                <span className="insight-icon">📚</span>
                Research Experience
              </h4>
              <p>
                Admitted students have {Math.abs(insights.papersDifference).toFixed(1)} 
                {insights.papersDifference > 0 ? ' more' : ' fewer'} research papers on average. 
                Successful applicants typically have {insights.avgPapersAdmitted.toFixed(1)} papers.
              </p>
            </div>
          </div>
        </div>

        {/* History Section - Recent Admits and Rejects */}
        <div className="history-section">
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