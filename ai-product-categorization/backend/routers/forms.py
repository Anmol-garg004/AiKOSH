from fastapi import APIRouter
import json

router = APIRouter(
    prefix="/api/v1/forms",
    tags=["forms"]
)

@router.get("")
def get_forms():
    with open("data/forms_catalog.json", "r") as f:
        catalog = json.load(f)
    return catalog

@router.post("/submit")
def submit_form(payload: dict):
    # Mock submission logic
    return {"status": "success", "message": "Form submitted successfully", "form_id": payload.get("form_id")}
