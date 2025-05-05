/**
 * RAG-based LOR/SOP Evaluation System
 * 
 * This system evaluates Letters of Recommendation (LORs) and Statements of Purpose (SOPs)
 * based on university-specific standards, providing a score and improvement suggestions.
 */

// University-specific evaluation criteria database (in a real system, this would be stored in a proper database)
const universityStandards = {
    // Criteria are weighted by importance (0-1)
    "Stanford University": {
      lor: {
        criteria: [
          { name: "Specific examples of achievements", weight: 0.9, keywords: ["accomplishment", "achievement", "success", "led", "created", "developed", "implemented"] },
          { name: "Leadership qualities", weight: 0.8, keywords: ["leader", "leadership", "initiative", "team", "guided", "directed", "managed"] },
          { name: "Innovation and creative thinking", weight: 0.9, keywords: ["innovat", "creativ", "novel", "solution", "original", "design", "approach"] },
          { name: "Comparison to peers", weight: 0.7, keywords: ["top", "best", "exceptional", "outstanding", "percentile", "cohort", "compare"] },
          { name: "Research potential", weight: 1.0, keywords: ["research", "study", "investigation", "analysis", "experiment", "publication", "discovery"] },
          { name: "Character and work ethic", weight: 0.7, keywords: ["character", "integrity", "ethics", "honest", "diligen", "hardworking", "commit"] },
          { name: "Overcoming challenges", weight: 0.6, keywords: ["challeng", "obstacle", "adversity", "difficult", "overcome", "persever", "resilient"] }
        ],
        emphasis: "Research excellence, leadership, and innovation potential",
        minimumWords: 500,
        idealWords: 750
      },
      sop: {
        criteria: [
          { name: "Clear research focus", weight: 1.0, keywords: ["research", "focus", "interest", "topic", "question", "problem", "objective"] },
          { name: "Alignment with faculty", weight: 0.9, keywords: ["faculty", "professor", "advisor", "lab", "work with", "collaborate", "mentor"] },
          { name: "Past research experience", weight: 0.8, keywords: ["experience", "project", "study", "conducted", "analyzed", "publication", "finding"] },
          { name: "Long-term vision", weight: 0.7, keywords: ["vision", "future", "goal", "plan", "career", "aspire", "contribute"] },
          { name: "Specific reasons for Stanford", weight: 0.8, keywords: ["Stanford", "program", "department", "specific", "unique", "resources", "opportunity"] },
          { name: "Demonstrated perseverance", weight: 0.6, keywords: ["persever", "challeng", "obstacle", "overcome", "difficult", "resilient", "persist"] },
          { name: "Unique perspective", weight: 0.7, keywords: ["unique", "perspective", "diverse", "background", "experience", "contribute", "bring"] }
        ],
        emphasis: "Research fit, clarity of purpose, and demonstrated excellence",
        minimumWords: 750,
        idealWords: 1000
      }
    },
    
    "MIT": {
      lor: {
        criteria: [
          { name: "Technical aptitude", weight: 1.0, keywords: ["technical", "skill", "aptitude", "ability", "proficient", "expert", "competent"] },
          { name: "Problem-solving skills", weight: 0.9, keywords: ["problem", "solve", "solution", "approach", "analytical", "tackle", "address"] },
          { name: "Innovation and creativity", weight: 0.9, keywords: ["innovat", "creativ", "original", "novel", "idea", "design", "develop"] },
          { name: "Collaboration abilities", weight: 0.8, keywords: ["collaborat", "team", "work with", "together", "contribute", "partner", "cooperat"] },
          { name: "Quantifiable achievements", weight: 0.8, keywords: ["result", "achievement", "score", "rank", "award", "recognition", "impact"] },
          { name: "Technical contributions", weight: 0.9, keywords: ["contribut", "develop", "create", "implement", "build", "design", "engineer"] },
          { name: "Persistence", weight: 0.7, keywords: ["persist", "determin", "driven", "commit", "dedication", "focus", "effort"] }
        ],
        emphasis: "Technical excellence, innovation, and collaborative potential",
        minimumWords: 500,
        idealWords: 700
      },
      sop: {
        criteria: [
          { name: "Technical depth", weight: 0.9, keywords: ["technical", "expertise", "skill", "proficiency", "knowledge", "understand", "master"] },
          { name: "Hands-on project experience", weight: 1.0, keywords: ["project", "build", "develop", "implement", "create", "design", "construct"] },
          { name: "Clear research direction", weight: 0.9, keywords: ["research", "direction", "goal", "objective", "aim", "focus", "interest"] },
          { name: "Connection to MIT", weight: 0.8, keywords: ["MIT", "laboratory", "professor", "faculty", "program", "department", "research group"] },
          { name: "Initiative and leadership", weight: 0.7, keywords: ["initiative", "lead", "start", "found", "organize", "establish", "direct"] },
          { name: "Problem-solving mindset", weight: 0.9, keywords: ["problem", "solution", "solve", "approach", "methodology", "tackle", "address"] },
          { name: "Interdisciplinary interests", weight: 0.6, keywords: ["interdisciplinary", "cross", "multiple", "combine", "integrate", "across", "diverse"] }
        ],
        emphasis: "Technical depth, hands-on experience, and innovative thinking",
        minimumWords: 700,
        idealWords: 1000
      }
    },
    
    "Harvard University": {
      lor: {
        criteria: [
          { name: "Intellectual curiosity", weight: 0.9, keywords: ["intellectual", "curious", "inquire", "question", "explore", "seek", "learn"] },
          { name: "Leadership and impact", weight: 1.0, keywords: ["leader", "impact", "influence", "change", "community", "initiative", "role"] },
          { name: "Unique perspective", weight: 0.8, keywords: ["unique", "perspective", "background", "diverse", "different", "distinct", "unusual"] },
          { name: "Ethical character", weight: 0.8, keywords: ["ethic", "integrity", "moral", "character", "honest", "principle", "value"] },
          { name: "Potential contribution", weight: 0.9, keywords: ["potential", "contribute", "impact", "future", "promise", "prospect", "capability"] },
          { name: "Comparison to peers", weight: 0.7, keywords: ["outstanding", "exceptional", "superior", "excellent", "remarkable", "distinguished", "compare"] },
          { name: "Personal growth", weight: 0.7, keywords: ["growth", "develop", "improve", "progress", "evolve", "mature", "transform"] }
        ],
        emphasis: "Leadership potential, intellectual depth, and ethical character",
        minimumWords: 600,
        idealWords: 800
      },
      sop: {
        criteria: [
          { name: "Intellectual journey", weight: 0.9, keywords: ["intellectual", "journey", "path", "develop", "grow", "evolve", "transform"] },
          { name: "Leadership experiences", weight: 1.0, keywords: ["lead", "role", "position", "initiative", "direct", "head", "found"] },
          { name: "Broader societal impact", weight: 0.9, keywords: ["impact", "society", "community", "world", "change", "improve", "address"] },
          { name: "Connection to Harvard", weight: 0.8, keywords: ["Harvard", "value", "mission", "tradition", "community", "resource", "opportunity"] },
          { name: "Interdisciplinary interests", weight: 0.7, keywords: ["interdisciplinary", "across", "multiple", "combine", "integrate", "intersection", "diverse"] },
          { name: "Reflective thinking", weight: 0.8, keywords: ["reflect", "introspect", "consider", "contemplate", "examine", "evaluate", "understand"] },
          { name: "Unique contribution", weight: 0.8, keywords: ["unique", "contribution", "bring", "offer", "add", "perspective", "enrich"] }
        ],
        emphasis: "Personal narrative, leadership, and contribution to community",
        minimumWords: 800,
        idealWords: 1200
      }
    },
    
    "UC Berkeley": {
      lor: {
        criteria: [
          { name: "Academic excellence", weight: 0.9, keywords: ["academic", "excellence", "scholar", "intellectual", "study", "learn", "knowledge"] },
          { name: "Research aptitude", weight: 1.0, keywords: ["research", "investigation", "inquiry", "analysis", "methodology", "study", "experiment"] },
          { name: "Social awareness", weight: 0.8, keywords: ["social", "society", "community", "aware", "conscious", "engage", "involve"] },
          { name: "Resilience", weight: 0.7, keywords: ["resilient", "overcome", "challenge", "adapt", "persist", "endure", "withstand"] },
          { name: "Independence", weight: 0.8, keywords: ["independen", "self-direct", "initiative", "autonomy", "self-motivat", "drive", "proactive"] },
          { name: "Collaborative abilities", weight: 0.8, keywords: ["collaborat", "team", "cooperat", "together", "partner", "joint", "collective"] },
          { name: "Technical skills", weight: 0.9, keywords: ["technical", "skill", "ability", "proficien", "talent", "aptitude", "expert"] }
        ],
        emphasis: "Research potential, social impact, and collaborative abilities",
        minimumWords: 500,
        idealWords: 750
      },
      sop: {
        criteria: [
          { name: "Research interests", weight: 0.9, keywords: ["research", "interest", "focus", "area", "topic", "question", "investigate"] },
          { name: "Research experience", weight: 0.9, keywords: ["experience", "conducted", "worked", "project", "study", "analysis", "experiment"] },
          { name: "Social impact", weight: 0.8, keywords: ["impact", "social", "society", "community", "change", "improve", "contribute"] },
          { name: "Diversity of perspective", weight: 0.8, keywords: ["diverse", "perspective", "background", "experience", "unique", "different", "varied"] },
          { name: "Berkeley-specific interest", weight: 0.7, keywords: ["Berkeley", "program", "faculty", "department", "research", "specific", "unique"] },
          { name: "Career goals", weight: 0.7, keywords: ["career", "goal", "aspiration", "aim", "future", "plan", "professional"] },
          { name: "Personal challenges", weight: 0.6, keywords: ["challenge", "obstacle", "difficult", "overcome", "adversity", "struggle", "hardship"] }
        ],
        emphasis: "Research preparation, social awareness, and unique perspective",
        minimumWords: 750,
        idealWords: 1000
      }
    },
    
    "Yale University": {
      lor: {
        criteria: [
          { name: "Intellectual depth", weight: 0.9, keywords: ["intellectual", "depth", "think", "analyze", "conceptual", "theoretical", "abstract"] },
          { name: "Interdisciplinary thinking", weight: 0.8, keywords: ["interdisciplinary", "across", "multiple", "diverse", "integrate", "connect", "bridge"] },
          { name: "Leadership impact", weight: 0.9, keywords: ["leader", "impact", "influence", "guide", "direct", "inspire", "motivate"] },
          { name: "Character qualities", weight: 0.8, keywords: ["character", "quality", "integrity", "ethics", "moral", "value", "principle"] },
          { name: "Communication skills", weight: 0.7, keywords: ["communicat", "articulate", "express", "convey", "discuss", "present", "write"] },
          { name: "Critical thinking", weight: 0.8, keywords: ["critical", "thinking", "analyze", "evaluate", "assess", "judge", "consider"] },
          { name: "Inclusive excellence", weight: 0.7, keywords: ["inclusive", "diverse", "equity", "respect", "difference", "perspective", "background"] }
        ],
        emphasis: "Intellectual breadth, leadership, and character development",
        minimumWords: 600,
        idealWords: 800
      },
      sop: {
        criteria: [
          { name: "Intellectual journey", weight: 0.9, keywords: ["intellectual", "journey", "path", "development", "growth", "evolution", "progression"] },
          { name: "Interdisciplinary interests", weight: 0.8, keywords: ["interdisciplinary", "across", "multiple", "combine", "integrate", "connect", "diverse"] },
          { name: "Service and engagement", weight: 0.8, keywords: ["service", "engage", "community", "volunteer", "contribute", "participate", "involve"] },
          { name: "Values alignment", weight: 0.7, keywords: ["value", "align", "principle", "belief", "mission", "ethos", "philosophy"] },
          { name: "Yale-specific programs", weight: 0.7, keywords: ["Yale", "program", "specific", "resource", "center", "opportunity", "initiative"] },
          { name: "Campus diversity", weight: 0.6, keywords: ["diversity", "inclusive", "community", "contribute", "perspective", "background", "experience"] },
          { name: "Goal articulation", weight: 0.8, keywords: ["goal", "aim", "objective", "purpose", "plan", "intention", "aspiration"] }
        ],
        emphasis: "Intellectual journey, service orientation, and interdisciplinary thinking",
        minimumWords: 700,
        idealWords: 1000
      }
    }
  };
  
  /**
   * Core RAG evaluation function that analyzes a document against university-specific criteria
   */
  function evaluateDocument(text, university, docType) {
    if (!universityStandards[university]) {
      return {
        score: 0,
        feedback: ["University not found in our database."],
        analysis: {}
      };
    }
  
    // Prepare document for analysis
    const standards = universityStandards[university][docType.toLowerCase()];
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;
    
    // Initialize scoring variables
    let totalScore = 0;
    let totalWeight = 0;
    const criteriaScores = {};
    const feedback = [];
    
    // Word count evaluation
    if (wordCount < standards.minimumWords) {
      feedback.push(`The document is too short (${wordCount} words). Aim for at least ${standards.minimumWords} words to fully address all criteria.`);
    } else if (wordCount > standards.idealWords * 1.5) {
      feedback.push(`The document is too long (${wordCount} words). Consider focusing your message to around ${standards.idealWords} words for better impact.`);
    }
    
    // Evaluate each criterion
    standards.criteria.forEach(criterion => {
      let criterionScore = 0;
      let keywordsPresent = 0;
      
      // Check for keyword presence
      criterion.keywords.forEach(keyword => {
        const regex = new RegExp(keyword, 'i');
        const matches = text.match(new RegExp(regex, 'gi')) || [];
        if (matches.length > 0) {
          keywordsPresent++;
          
          // Bonus points for multiple mentions of important keywords
          if (matches.length > 1 && criterion.weight >= 0.8) {
            criterionScore += Math.min(3, matches.length - 1);
          }
        }
      });
      
      // Basic score based on keyword coverage
      const keywordCoverage = keywordsPresent / criterion.keywords.length;
      criterionScore += keywordCoverage * 10;
      
      // Apply weighting
      const weightedScore = criterionScore * criterion.weight;
      totalScore += weightedScore;
      totalWeight += criterion.weight;
      
      // Store individual criterion score (out of 10)
      const normalizedCriterionScore = Math.min(10, Math.round(criterionScore));
      criteriaScores[criterion.name] = normalizedCriterionScore;
      
      // Generate feedback for low scores
      if (normalizedCriterionScore < 5) {
        const suggestedKeywords = criterion.keywords.slice(0, 3).join(", ");
        feedback.push(`Strengthen "${criterion.name}" (score: ${normalizedCriterionScore}/10). Consider incorporating terms like: ${suggestedKeywords}.`);
      } else if (normalizedCriterionScore < 8) {
        feedback.push(`Enhance your discussion of "${criterion.name}" (score: ${normalizedCriterionScore}/10). Provide more specific examples.`);
      }
    });
    
    // Normalize final score to 1-10 scale
    const finalScore = Math.min(10, Math.max(1, Math.round((totalScore / totalWeight) * 10) / 10));
    
    // Add university-specific emphasis feedback
    feedback.push(`To succeed at ${university}, focus on ${standards.emphasis.toLowerCase()}.`);
    
    // Add overall assessment
    if (finalScore < 4) {
      feedback.unshift(`This document needs significant improvement to meet ${university}'s standards.`);
    } else if (finalScore < 7) {
      feedback.unshift(`This document is average but could be significantly stronger for ${university}.`);
    } else if (finalScore < 9) {
      feedback.unshift(`This is a strong document that meets most of ${university}'s standards.`);
    } else {
      feedback.unshift(`This is an excellent document that strongly aligns with ${university}'s expectations.`);
    }
    
    return {
      score: finalScore,
      feedback,
      analysis: criteriaScores,
      wordCount,
      recommendations: generateRecommendations(criteriaScores, university, docType)
    };
  }
  
  /**
   * Generate specific recommendations based on criteria scores
   */
  function generateRecommendations(criteriaScores, university, docType) {
    const standards = universityStandards[university][docType.toLowerCase()];
    const recommendations = [];
    
    // Find the weakest areas
    const weakestCriteria = Object.entries(criteriaScores)
      .sort((a, b) => a[1] - b[1])
      .slice(0, 3);
      
    // Generate specific recommendations for improvement
    weakestCriteria.forEach(([criterion, score]) => {
      const criterionObj = standards.criteria.find(c => c.name === criterion);
      
      if (criterionObj) {
        if (score < 3) {
          recommendations.push(`Missing ${criterion}: This is a critical area for ${university}. Add a dedicated paragraph that addresses this directly using specific examples.`);
        } else if (score < 6) {
          recommendations.push(`Strengthen ${criterion}: Expand your current content with more specific details and examples that demonstrate this quality.`);
        } else {
          recommendations.push(`Enhance ${criterion}: While present, this could be more impactful with quantifiable results or more vivid examples.`);
        }
      }
    });
    
    // Add university-specific strategic recommendation
    recommendations.push(`Strategic focus: For ${university}, ensure your ${docType} emphasizes ${standards.emphasis} throughout the document.`);
    
    return recommendations;
  }
  
  /**
   * Main function to process and evaluate a document
   */
  function processDocument(text, university, docType) {
    // Input validation
    if (!text || text.trim().length === 0) {
      return {
        error: "Empty document provided",
        score: 0
      };
    }
    
    if (!university || !universityStandards[university]) {
      return {
        error: "University not found in our database",
        score: 0
      };
    }
    
    if (!docType || (docType.toLowerCase() !== "lor" && docType.toLowerCase() !== "sop")) {
      return {
        error: "Invalid document type. Please specify 'LOR' or 'SOP'",
        score: 0
      };
    }
    
    // Process and evaluate the document
    const preprocessedText = preprocessText(text);
    const evaluation = evaluateDocument(preprocessedText, university, docType);
    
    return {
      ...evaluation,
      university,
      documentType: docType,
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * Text preprocessing function to clean and normalize text
   */
  function preprocessText(text) {
    // Remove extra whitespace
    text = text.replace(/\s+/g, ' ').trim();
    
    // Remove common unwanted characters
    text = text.replace(/[^\w\s.,;:?!()\-"']/g, '');
    
    return text;
  }
  
  // Export functions for use in the frontend
  export {
    processDocument,
    evaluateDocument,
    universityStandards
  };