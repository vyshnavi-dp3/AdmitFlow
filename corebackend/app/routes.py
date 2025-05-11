from flask import Blueprint, request, jsonify
from .services.analyzer import analyze_sop, analyze_lor
from pydantic import BaseModel
from typing import Optional, List

main_bp = Blueprint('main', __name__)

class CollegeInfo(BaseModel):
    name: str
    program: str
    department: Optional[str] = None
    keywords: Optional[List[str]] = None

class DocumentAnalysis(BaseModel):
    document: str
    college_info: CollegeInfo

@main_bp.route('/api/analyze/sop', methods=['POST'])
def analyze_sop_endpoint():
    try:
        data = request.get_json()
        analysis_request = DocumentAnalysis(**data)
        
        result = analyze_sop(
            sop_text=analysis_request.document,
            college_info=analysis_request.college_info
        )
        
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@main_bp.route('/api/analyze/lor', methods=['POST'])
def analyze_lor_endpoint():
    try:
        data = request.get_json()
        analysis_request = DocumentAnalysis(**data)
        
        result = analyze_lor(
            lor_text=analysis_request.document,
            college_info=analysis_request.college_info
        )
        
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@main_bp.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"}) 