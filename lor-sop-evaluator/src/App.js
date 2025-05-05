import React, { useState } from 'react';
import RagEvaluator from './components/RagEvaluator';
import DocumentAnalyzer from './components/DocumentAnalyzer';
import './App.css';
import './custom-styles.css';
function App() {
  const [activeComponent, setActiveComponent] = useState('evaluator');

  return (
    <div className="App">
      <header className="App-header">
        <h1>LOR/SOP Evaluation System</h1>
        <div className="component-tabs">
          <button 
            onClick={() => setActiveComponent('evaluator')}
            className={activeComponent === 'evaluator' ? 'active' : ''}
          >
            Basic Evaluator
          </button>
          <button 
            onClick={() => setActiveComponent('analyzer')}
            className={activeComponent === 'analyzer' ? 'active' : ''}
          >
            Advanced Analyzer
          </button>
        </div>
      </header>
      
      <main>
        {activeComponent === 'evaluator' ? <RagEvaluator /> : <DocumentAnalyzer />}
      </main>
      
      <footer>
        <p>RAG-powered document evaluation system</p>
      </footer>
    </div>
  );
}

export default App;