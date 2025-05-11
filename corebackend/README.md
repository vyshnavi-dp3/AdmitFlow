# Core Backend - SOP and LOR Analyzer

This Flask-based backend service provides APIs for analyzing Statement of Purpose (SOP) and Letters of Recommendation (LOR) for graduate school applications. It uses LangChain and GPT-4 to provide detailed analysis and scoring.

## Features

- SOP Analysis with scoring and feedback
- LOR Analysis with scoring and feedback
- Web search integration for college-specific context
- Detailed improvement suggestions
- JSON-formatted responses

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create a `.env` file:
```bash
cp .env.example .env
```
Then edit `.env` and add your OpenAI API key and other configuration.

## Running the Service

Development mode:
```bash
python run.py
```

Production mode (using gunicorn):
```bash
gunicorn -w 4 -b 0.0.0.0:5001 run:app
```

## API Endpoints

### Analyze SOP
```http
POST /api/analyze/sop
Content-Type: application/json

{
    "document": "Your SOP text here...",
    "college_info": {
        "name": "University Name",
        "program": "Program Name",
        "department": "Department Name",
        "keywords": ["keyword1", "keyword2"]
    }
}
```

### Analyze LOR
```http
POST /api/analyze/lor
Content-Type: application/json

{
    "document": "Your LOR text here...",
    "college_info": {
        "name": "University Name",
        "program": "Program Name",
        "department": "Department Name",
        "keywords": ["keyword1", "keyword2"]
    }
}
```

## Response Format

Both endpoints return a JSON response in the following format:
```json
{
    "score": 8.5,
    "strengths": [
        "Strong research experience",
        "Clear career goals"
    ],
    "weaknesses": [
        "Could provide more specific examples",
        "Research interests could be better aligned"
    ],
    "suggestions": [
        "Add more details about research methodology",
        "Include specific project outcomes"
    ],
    "summary": "Overall strong application with room for improvement in specific areas."
}
```

## Health Check

```http
GET /health
```

Returns:
```json
{
    "status": "healthy"
}
``` 