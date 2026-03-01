from pydantic import BaseModel
from typing import Dict, Any, List, Optional

class ProcessVoiceRequest(BaseModel):
    form_id: str
    transcript: str
    language: str = "en"

class FieldExtraction(BaseModel):
    value: Any
    confidence: float

class ProcessVoiceResponse(BaseModel):
    status: str
    form_id: str
    extracted_fields: Dict[str, FieldExtraction]
    unfilled_fields: List[str]
    processing_time_ms: int

class SubmitFormRequest(BaseModel):
    form_id: str
    fields: Dict[str, Any]
