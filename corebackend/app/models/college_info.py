from pydantic import BaseModel
from typing import Optional, List

class CollegeInfo(BaseModel):
    name: str
    program: str
    department: Optional[str] = None
    keywords: Optional[List[str]] = None

    def __hash__(self) -> int:
        """Make CollegeInfo hashable for caching."""
        return hash((
            self.name,
            self.program,
            self.department,
            tuple(self.keywords) if self.keywords else None
        )) 