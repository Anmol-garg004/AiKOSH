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
        name_match = re.search(r'(my name is|mera naam|i am|माय नेम इस|मेरा नाम) ([a-z\u0900-\u097F\s]{3,20})', text)
        if name_match and "owner_name" in fields_to_find:
            val = name_match.group(2).strip()
            # Clean up trailing words if needed
            val = re.sub(r'(आई|I|and|my|मेरा).*', '', val).strip()
            extracted["owner_name"] = {"value": val.title() if val.isascii() else val, "confidence": 0.95}
            
        # Business names
        biz_match = re.search(r'(business is|company is|run a business called|company ka naam|कंपनी का नाम|बिज़नेस का नाम) ([a-z\u0900-\u097F\s]{3,30})', text)
        if biz_match and ("business_name" in fields_to_find or "legal_name" in fields_to_find):
            biz_name = biz_match.group(2).strip()
            biz_name = biz_name.title() if biz_name.isascii() else biz_name
            if "business_name" in fields_to_find:
                extracted["business_name"] = {"value": biz_name, "confidence": 0.92}
            elif "legal_name" in fields_to_find:
                extracted["legal_name"] = {"value": biz_name, "confidence": 0.89}
        
        # Addresses
        address_match = re.search(r'(लिव इन|रहता हूँ|लिव|located at|address is|rehta hu|se|में|इन) ([a-z\u0900-\u097F0-9\s,-]{5,40})', text)
        if address_match and "address" in fields_to_find:
            val = address_match.group(2).strip()
            val = re.sub(r'(उत्तर प्रदेश|महाराष्ट्र|माय|my).*', '', val).strip()
            extracted["address"] = {"value": val.title() if val.isascii() else val, "confidence": 0.88}
        
        # City
        cities = ["pune", "mumbai", "kanpur", "delhi", "bangalore", "noida", "पुणे", "मुंबई", "कानपुर", "दिल्ली", "बैंगलोर", "नोएडा"]
        for city in cities:
            if city in text:
                city_mapped = "Noida" if city == "नोएडा" else city.title()
                if "city" in fields_to_find:
                    extracted["city"] = {"value": city_mapped, "confidence": 0.96}
                if "district" in fields_to_find:
                    extracted["district"] = {"value": city_mapped, "confidence": 0.85}
                break

        # State
        states = ["maharashtra", "uttar pradesh", "delhi", "karnataka", "महाराष्ट्र", "उत्तर प्रदेश", "दिल्ली", "कर्नाटक"]
        for state in states:
            if state in text and "state" in fields_to_find:
                state_mapped = "Uttar Pradesh" if state == "उत्तर प्रदेश" else state.title()
                extracted["state"] = {"value": state_mapped, "confidence": 0.98}
                break

        # Pincode
        pin_match = re.search(r'(पिन कोड|पिनकोड|pincode|pin code|zip|code is) *[:\-]? *(\d{5,6})', text)
        if not pin_match:
            pin_match = re.search(r'\b(\d{6})\b', text)
        if pin_match and "pincode" in fields_to_find:
            val = pin_match.group(1) if len(pin_match.groups()) == 1 else pin_match.group(2)
            extracted["pincode"] = {"value": val.replace(" ", ""), "confidence": 0.99}

        # Aadhaar
        aadhaar_match = re.search(r'(आधार|आधार नंबर|aadhaar|aadhar)[^\d]*(\d{4}[\s-]?\d{4}[\s-]?\d{3,4})', text)
        if aadhaar_match and "aadhaar" in fields_to_find:
            val = aadhaar_match.group(2).replace(" ", "").replace("-", "")
            extracted["aadhaar"] = {"value": val, "confidence": 0.95}

        # PAN
        pan_match = re.search(r'(पैन|pan)[^\w]*([A-Za-z]{5}[0-9]{4}[A-Za-z]{1})', transcript)
        if pan_match and "pan" in fields_to_find:
            extracted["pan"] = {"value": pan_match.group(2).upper(), "confidence": 0.97}
            
        # Turnover/Investment
        amount_match = re.search(r'(\d+)\s*(lakh|lakhs|crore|crores|लाख|करोड़)', text)
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
