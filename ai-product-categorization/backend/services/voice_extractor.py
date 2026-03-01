import json
import re
import time
from typing import Dict, Any, List

class VoiceExtractorService:
    def __init__(self):
        # Load form schemas to know what fields to look for
        with open("data/forms_catalog.json", "r") as f:
            self.catalog = json.load(f)
            
    def get_form_fields(self, form_id: str) -> List[str]:
        for form in self.catalog:
            if form["id"] == form_id:
                return form["fields"]
        return []

    def extract_fields(self, form_id: str, transcript: str) -> dict:
        """
        Mock NLP NER extractor using regex and heuristics.
        In production, replace this with Whisper + GPT-4 or fine-tuned NER model.
        """
        text = transcript.lower()
        
        extracted = {}
        fields_to_find = self.get_form_fields(form_id)
        
        # Heuristics for names
        name_match = re.search(r'(my name is|mera naam|i am) ([a-z\s]{3,20}) *(and|,|\.|my business)', text)
        if name_match and "owner_name" in fields_to_find:
            extracted["owner_name"] = {"value": name_match.group(2).title().strip(), "confidence": 0.95}
            
        # Business names
        biz_match = re.search(r'(business is|company is|run a business called|company ka naam) ([a-z\s]{3,30}) *(located|at|,|\.)', text)
        if biz_match and ("business_name" in fields_to_find or "legal_name" in fields_to_find):
            biz_name = biz_match.group(2).title().strip()
            if "business_name" in fields_to_find:
                extracted["business_name"] = {"value": biz_name, "confidence": 0.92}
            elif "legal_name" in fields_to_find:
                extracted["legal_name"] = {"value": biz_name, "confidence": 0.89}
        
        # Addresses
        address_match = re.search(r'(located at|address is|rehta hu|se) ([a-z0-9\s,-]{5,40}) (pune|mumbai|kanpur|delhi|bangalore)', text)
        if address_match and "address" in fields_to_find:
            extracted["address"] = {"value": address_match.group(2).title().strip(), "confidence": 0.88}
        
        # City
        cities = ["pune", "mumbai", "kanpur", "delhi", "bangalore"]
        for city in cities:
            if city in text:
                if "city" in fields_to_find:
                    extracted["city"] = {"value": city.title(), "confidence": 0.96}
                if "district" in fields_to_find:
                    extracted["district"] = {"value": city.title(), "confidence": 0.85}
                break

        # State
        states = ["maharashtra", "uttar pradesh", "delhi", "karnataka"]
        for state in states:
            if state in text and "state" in fields_to_find:
                extracted["state"] = {"value": state.title(), "confidence": 0.98}
                break

        # Pincode
        pin_match = re.search(r'(pincode|pin code|zip|code is) *[:\-]? *(\d{6})', text)
        if not pin_match:
            pin_match = re.search(r'\b(\d{6})\b', text)
        if pin_match and "pincode" in fields_to_find:
            extracted["pincode"] = {"value": pin_match.group(1) if len(pin_match.groups()) == 1 else pin_match.group(2), "confidence": 0.99}

        # Aadhaar
        aadhaar_match = re.search(r'(aadhaar|aadhar)[^\d]*(\d{4}[\s-]?\d{4}[\s-]?\d{4})', text)
        if aadhaar_match and "aadhaar" in fields_to_find:
            extracted["aadhaar"] = {"value": aadhaar_match.group(2).replace(" ", "").replace("-", ""), "confidence": 0.95}

        # PAN
        pan_match = re.search(r'(pan)[^\w]*([A-Z]{5}[0-9]{4}[A-Z]{1})', transcript.upper())
        if pan_match and "pan" in fields_to_find:
            extracted["pan"] = {"value": pan_match.group(2), "confidence": 0.97}
            
        # Turnover/Investment
        amount_match = re.search(r'(\d+)\s*(lakh|lakhs|crore|crores)', text)
        if amount_match:
            amt = f"{amount_match.group(1)} {amount_match.group(2).title()}"
            if "investment_amount" in fields_to_find:
                extracted["investment_amount"] = {"value": amt, "confidence": 0.85}
            if "turnover" in fields_to_find:
                extracted["turnover"] = {"value": amt, "confidence": 0.85}

        # Missing fields
        unfilled = [f for f in fields_to_find if f not in extracted]
        
        return {
            "extracted": extracted,
            "unfilled": unfilled
        }

extractor = VoiceExtractorService()
