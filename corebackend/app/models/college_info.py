from pydantic import BaseModel
from typing import Optional, List

class CollegeInfo(BaseModel):
    name: str
    program: str
    department: Optional[str] = None
    keywords: Optional[List[str]] = None 