from fastapi import APIRouter
from models.schemas import CategorizeRequest, CategorizeResponse
from services.classifier import classifier_service

router = APIRouter(
    prefix="/api/v1/categorize",
    tags=["categorize"]
)

@router.post("/predict", response_model=CategorizeResponse)
def predict_category(req: CategorizeRequest):
    return classifier_service.predict(req.description)
