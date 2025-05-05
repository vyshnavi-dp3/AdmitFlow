import React, { useState, useEffect } from 'react';
import { AlertCircle, ArrowRight, FileText, School, Award } from 'lucide-react';
import { evaluateDocument, universityStandards } from './RagBackend';

// Main component
const DocumentAnalyzer = () => {
  const [documentType, setDocumentType] = useState('SOP');
  const [university, setUniversity] = useState('Stanford University');
  const [documentText, setDocumentText] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    wordCount: 0,
    keywordMatches: {},
  });
  const [selectedTab, setSelectedTab] = useState('editor');

  const universities = Object.keys(universityStandards);

  // Example template documents to help users get started
  const templateDocuments = {
    SOP: {
      "Stanford University": "I am writing to express my strong interest in the Computer Science Ph.D. program at Stanford University. My research interests lie at the intersection of artificial intelligence and healthcare, specifically focusing on developing novel machine learning algorithms for medical image analysis. During my undergraduate studies at [University Name], I had the opportunity to work on several research projects that have prepared me for the rigorous academic environment at Stanford. In collaboration with Professor [Name], I developed a deep learning model for early detection of pulmonary nodules in CT scans, which resulted in a publication at [Conference Name]. This experience solidified my passion for research and innovation. I am particularly drawn to Stanford's AI Lab and the work being done by Professors [Names]. Their research aligns perfectly with my interests, and I believe their mentorship would be invaluable as I pursue my doctoral studies. I hope to contribute to the Stanford community both academically and personally, bringing my unique perspective as a [background/characteristic]. Long-term, I aspire to lead research initiatives that bridge the gap between theoretical AI advancements and practical healthcare applications.",
      "MIT": "My application to MIT's Electrical Engineering doctoral program is motivated by my passion for developing next-generation semiconductor technologies. As an undergraduate researcher at [University Name], I built and optimized a novel FPGA-based system that improved processing speeds by 35% compared to existing solutions. This hands-on experience with hardware design and implementation taught me the value of practical engineering alongside theoretical knowledge. I've been following the groundbreaking work at MIT's Microsystems Technology Laboratory, particularly Professor [Name]'s research on quantum computing architectures. The opportunity to contribute to such cutting-edge research under their guidance would be instrumental in achieving my goal of pushing the boundaries of computing hardware. Beyond my technical capabilities, I bring strong leadership experience from founding my university's Robotics Club, where I led a team of 15 students to a first-place finish in the [Competition Name]. MIT's culture of technical excellence, innovation, and collaboration is exactly the environment where I believe I can make meaningful contributions while growing as a researcher."
    },
    LOR: {
      "Stanford University": "It is with great enthusiasm that I recommend [Student Name] for your Ph.D. program in Biology. As [Student]'s research advisor for three years, I have witnessed firsthand their exceptional analytical abilities and innovative approach to complex biological problems. [Student] has worked in my laboratory investigating cellular mechanisms of neurodegeneration, where they demonstrated remarkable technical skills and scientific intuition. Their research resulted in a first-author publication in [Journal Name], placing them in the top 2% of undergraduate researchers I have mentored in my 15-year career. What truly sets [Student] apart is their ability to think across disciplinary boundaries, connecting concepts from molecular biology, genetics, and computational methods to design novel experimental approaches. They led a team of four other students in developing an innovative assay that reduced our experimental time by 40%. Beyond their technical abilities, [Student] possesses outstanding character and work ethic. When faced with unexpected experimental results that contradicted our initial hypothesis, they showed remarkable resilience, completely redesigning the experiment and ultimately making a discovery that opened a new research direction for our lab. Based on my experience mentoring graduate students who have gone on to successful careers at institutions like Stanford, I can confidently say that [Student] has the intellectual capability, research skills, and personal qualities to excel in your program and make significant contributions to the field.",
      "MIT": "I am writing to strongly recommend [Student] for MIT's Computer Science graduate program. As the lead engineer at [Company], I have directly supervised [Student]'s work on our core infrastructure team for the past two years. During this time, [Student] has consistently demonstrated exceptional technical abilities, problem-solving skills, and collaborative spirit that would make them an ideal fit for MIT. [Student] single-handedly redesigned our database architecture, implementing an innovative sharding solution that improved query performance by 200% and reduced operational costs by 30%. This technical achievement required not only advanced knowledge of distributed systems but also creative thinking to overcome seemingly intractable problems. When we encountered a critical production issue that was causing significant customer impact, [Student] worked tirelessly to diagnose and resolve the problem, demonstrating remarkable persistence and analytical thinking. They identified a subtle race condition that had eluded our entire engineering team and implemented a robust fix that has prevented any recurrence. What impresses me most about [Student] is their ability to clearly communicate complex technical concepts to both technical and non-technical stakeholders. They have presented their work at company-wide meetings and have mentored junior engineers with patience and clarity. [Student] ranks in the top 1% of engineers I have worked with throughout my 15-year career in the industry. Their combination of technical excellence, innovative thinking, and collaborative approach would make them an outstanding addition to MIT's program."
    }
  };

  // Real-time document analysis
  useEffect(() => {
    if (documentText.trim() === '') {
      setRealTimeMetrics({
        wordCount: 0,
        keywordMatches: {},
      });
      return;
    }

    const words = documentText.split(/\s+/).filter(word => word.length > 0);
    
    // Calculate keyword matches if university and document type are selected
    let keywordMatches = {};
    if (university && documentType && universityStandards[university]) {
      const criteria = universityStandards[university][documentType.toLowerCase()].criteria;
      
      criteria.forEach(criterion => {
        const matches = criterion.keywords.filter(keyword => {
          const regex = new RegExp(keyword, 'i');
          return documentText.match(regex);
        });
        
        keywordMatches[criterion.name] = {
          matched: matches.length,
          total: criterion.keywords.length,
          percentage: Math.round((matches.length / criterion.keywords.length) * 100)
        };
      });
    }
    
    setRealTimeMetrics({
      wordCount: words.length,
      keywordMatches,
    });
  }, [documentText, university, documentType]);

  const handleEvaluate = () => {
    if (!documentText.trim()) {
      alert("Please enter your document text first");
      return;
    }
    
    setIsLoading(true);
    
    // Simulate processing time for RAG evaluation
    setTimeout(() => {
      const result = evaluateDocument(documentText, university, documentType);
      setEvaluation(result);
      setIsLoading(false);
      setSelectedTab('results');
    }, 1500);
  };

  const loadTemplate = () => {
    if (templateDocuments[documentType] && templateDocuments[documentType][university]) {
      setDocumentText(templateDocuments[documentType][university]);
    } else {
      alert("No template available for this combination");
    }
  };

  // Render different tabs
  const renderTabContent = () => {
    switch (selectedTab) {
      case 'editor':
        return (
          <div className="flex flex-col">
            <div className="flex mb-4">
              <button 
                onClick={loadTemplate}
                className="py-1 px-3 bg-blue-50 text-blue-600 rounded-md text-sm hover:bg-blue-100"
              >
                Load Example Template
              </button>
            </div>
            <textarea 
              value={documentText}
              onChange={(e) => setDocumentText(e.target.value)}
              className="w-full p-3 border rounded-md h-80 font-mono text-sm"
              placeholder={`Enter your ${documentType} text here...`}
            />
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm">
                <span className={realTimeMetrics.wordCount < (universityStandards[university]?.[documentType.toLowerCase()]?.minimumWords || 0) 
                  ? "text-red-500" 
                  : "text-green-500"}>
                  Word count: {realTimeMetrics.wordCount}
                </span>
                {university && documentType && universityStandards[university] && (
                  <span className="text-gray-500 ml-2">
                    (Recommended: {universityStandards[university][documentType.toLowerCase()].idealWords} words)
                  </span>
                )}
              </div>
              <button 
                onClick={handleEvaluate}
                disabled={isLoading || !documentText.trim()}
                className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300"
              >
                {isLoading ? 'Analyzing...' : 'Evaluate Document'}
              </button>
            </div>
          </div>
        );
      
      case 'results':
        return evaluation ? (
          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-6 p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="text-lg font-semibold">{documentType} for {university}</h3>
                <p className="text-sm text-gray-600">Word count: {evaluation.wordCount}</p>
              </div>
              <div className="flex flex-col items-center">
                <div className={`text-4xl font-bold ${
                  evaluation.score >= 8 ? 'text-green-600' : 
                  evaluation.score >= 6 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {evaluation.score}/10
                </div>
                <div className="text-sm text-gray-600">Overall Score</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3 flex items-center">
                  <Award size={18} className="mr-2" />
                  Criteria Scores
                </h3>
                <div className="space-y-3">
                  {Object.entries(evaluation.analysis).map(([criterion, score]) => (
                    <div key={criterion} className="flex flex-col">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm">{criterion}</span>
                        <span className={`font-medium ${
                          score >= 8 ? 'text-green-600' : 
                          score >= 5 ? 'text-yellow-600' : 'text-red-600'
                        }`}>{score}/10</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            score >= 8 ? 'bg-green-500' : 
                            score >= 5 ? 'bg-yellow-500' : 'bg-red-500'
                          }`} 
                          style={{ width: `${score * 10}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3 flex items-center">
                  <AlertCircle size={18} className="mr-2" />
                  Key Recommendations
                </h3>
                <ul className="space-y-2">
                  {evaluation.recommendations && evaluation.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start">
                      <ArrowRight size={16} className="text-blue-600 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="border rounded-lg p-4 mb-6">
              <h3 className="font-semibold mb-3">Detailed Feedback</h3>
              <ul className="space-y-2">
                {evaluation.feedback.map((item, index) => (
                  <li key={index} className="flex items-start py-1">
                    <div className={`w-2 h-2 rounded-full mr-2 mt-1.5 ${
                      item.includes("excellent") || item.includes("strong") ? "bg-green-500" :
                      item.includes("average") ? "bg-yellow-500" : "bg-blue-400"
                    }`}></div>
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold mb-2 text-blue-800">University Requirements</h3>
              <p className="text-sm text-blue-800 mb-2">
                <strong>{university} {documentType} Focus:</strong> {universityStandards[university][documentType.toLowerCase()].emphasis}
              </p>
              <p className="text-sm text-blue-700">
                For successful applications, ensure your document thoroughly addresses the key criteria above, 
                particularly those where your scores are lower.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <p>No evaluation results yet. Please evaluate your document first.</p>
            <button 
              onClick={() => setSelectedTab('editor')}
              className="mt-4 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Go to Editor
            </button>
          </div>
        );
      
      case 'metrics':
        return (
          <div className="flex flex-col">
            <h3 className="font-semibold mb-4">Real-time Document Metrics</h3>
            
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Word Count</h4>
              <div className="flex items-center">
                <div className="w-full bg-gray-200 rounded-full h-4 mr-4">
                  {university && documentType && universityStandards[university] && (
                    <div 
                      className={`h-4 rounded-full ${
                        realTimeMetrics.wordCount >= universityStandards[university][documentType.toLowerCase()].idealWords ? 'bg-green-500' :
                        realTimeMetrics.wordCount >= universityStandards[university][documentType.toLowerCase()].minimumWords ? 'bg-yellow-500' : 'bg-red-500'
                      }`} 
                      style={{ 
                        width: `${Math.min(100, (realTimeMetrics.wordCount / universityStandards[university][documentType.toLowerCase()].idealWords) * 100)}%` 
                      }}
                    ></div>
                  )}
                </div>
                <span className="text-sm font-medium w-20">{realTimeMetrics.wordCount} words</span>
              </div>
              {university && documentType && universityStandards[university] && (
                <div className="mt-1 text-xs text-gray-500 flex justify-between">
                  <span>Minimum: {universityStandards[university][documentType.toLowerCase()].minimumWords}</span>
                  <span>Ideal: {universityStandards[university][documentType.toLowerCase()].idealWords}</span>
                </div>
              )}
            </div>
            
            <h4 className="text-sm font-medium mb-2">Keyword Coverage</h4>
            {Object.entries(realTimeMetrics.keywordMatches).map(([criterion, data]) => (
              <div key={criterion} className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs">{criterion}</span>
                  <span className="text-xs">{data.matched}/{data.total} keywords ({data.percentage}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      data.percentage >= 70 ? 'bg-green-500' : 
                      data.percentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                    }`} 
                    style={{ width: `${data.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
            
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <p className="text-xs text-gray-700">
                <strong>Note:</strong> These metrics provide real-time analysis as you write. 
                For a comprehensive evaluation including context and quality assessment, use the "Evaluate Document" button.
              </p>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col p-6 max-w-5xl mx-auto bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-2 text-center">LOR & SOP RAG Evaluation System</h1>
      <p className="text-center text-gray-600 mb-6">
        Analyze and improve your application documents using retrieval-augmented generation
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">Target University</label>
          <select 
            value={university}
            onChange={(e) => setUniversity(e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            {universities.map(uni => (
              <option key={uni} value={uni}>{uni}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="flex border-b mb-6">
        <button
          className={`py-2 px-4 font-medium ${selectedTab === 'editor' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setSelectedTab('editor')}
        >
          Document Editor
        </button>
        <button
          className={`py-2 px-4 font-medium ${selectedTab === 'metrics' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setSelectedTab('metrics')}
        >
          Real-time Metrics
        </button>
        <button
          className={`py-2 px-4 font-medium ${selectedTab === 'results' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setSelectedTab('results')}
          disabled={!evaluation}
        >
          Evaluation Results
        </button>
      </div>
      
      <div className="flex-1">
        {renderTabContent()}
      </div>
      
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>RAG-powered document evaluation system. Data is processed locally.</p>
      </div>
    </div>
  );
};

export default DocumentAnalyzer;