from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.chains import LLMChain
from langchain_community.tools import DuckDuckGoSearchRun
from typing import Dict, Any
import os
from ..models.college_info import CollegeInfo

# Check for OpenAI API key
if not os.getenv("OPENAI_API_KEY"):
    raise ValueError(
        "OPENAI_API_KEY environment variable is not set. "
        "Please set it in your .env file or environment variables."
    )

# Initialize LLM
llm = ChatOpenAI(
    model="gpt-4-turbo-preview",
    temperature=0.7,
    api_key=os.getenv("OPENAI_API_KEY")
)

# Initialize search tool
search = DuckDuckGoSearchRun()

def get_college_context(college_info: CollegeInfo) -> str:
    """Search for college information and return relevant context."""
    search_query = f"{college_info.name} {college_info.program} {college_info.department} graduate program requirements admission criteria"
    search_results = search.run(search_query)
    return search_results

def analyze_sop(sop_text: str, college_info: CollegeInfo) -> Dict[str, Any]:
    """Analyze SOP using LangChain and return score with feedback."""
    
    # Get college context
    college_context = get_college_context(college_info)
    
    # Create prompt template
    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are an expert graduate school admissions counselor. 
        Analyze the Statement of Purpose (SOP) for the given university and program.
        Consider the following aspects:
        1. Alignment with program goals
        2. Research interests and experience
        3. Writing quality and clarity
        4. Motivation and fit
        5. Future goals and potential
        
        Provide a score out of 10 and detailed feedback with specific suggestions for improvement.
        Use the following college context to inform your analysis:
        {college_context}
        """),
        ("user", """Please analyze this SOP for {college_name} {program}:
        
        SOP:
        {sop_text}
        
        Provide your analysis in the following JSON format:
        {{
            "score": <score out of 10>,
            "strengths": [<list of key strengths>],
            "weaknesses": [<list of areas for improvement>],
            "suggestions": [<specific suggestions for improvement>],
            "summary": "<brief overall assessment>"
        }}
        """)
    ])
    
    # Create and run chain
    chain = LLMChain(llm=llm, prompt=prompt)
    result = chain.invoke({
        "college_context": college_context,
        "college_name": college_info.name,
        "program": college_info.program,
        "sop_text": sop_text
    })
    
    return result

def analyze_lor(lor_text: str, college_info: CollegeInfo) -> Dict[str, Any]:
    """Analyze LOR using LangChain and return score with feedback."""
    
    # Get college context
    college_context = get_college_context(college_info)
    
    # Create prompt template
    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are an expert graduate school admissions counselor. 
        Analyze the Letter of Recommendation (LOR) for the given university and program.
        Consider the following aspects:
        1. Credibility of the recommender
        2. Specific examples and anecdotes
        3. Comparison with other students
        4. Strength of endorsement
        5. Alignment with program requirements
        
        Provide a score out of 10 and detailed feedback with specific suggestions for improvement.
        Use the following college context to inform your analysis:
        {college_context}
        """),
        ("user", """Please analyze this LOR for {college_name} {program}:
        
        LOR:
        {lor_text}
        
        Provide your analysis in the following JSON format:
        {{
            "score": <score out of 10>,
            "strengths": [<list of key strengths>],
            "weaknesses": [<list of areas for improvement>],
            "suggestions": [<specific suggestions for improvement>],
            "summary": "<brief overall assessment>"
        }}
        """)
    ])
    
    # Create and run chain
    chain = LLMChain(llm=llm, prompt=prompt)
    result = chain.invoke({
        "college_context": college_context,
        "college_name": college_info.name,
        "program": college_info.program,
        "lor_text": lor_text
    })
    
    return result 