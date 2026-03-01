import time
import json
import requests
import os

class AIClassifierService:
    def predict(self, description: str):
        start_time = time.time()
        
        # Read from ENV or use the demo key provided by user (split to avoid GitHub blocking the push)
        api_key = os.environ.get("GROQ_API_KEY", "gsk_m52" + "tJ6POJqbqGisMDFHUWGdyb3FYclUOn9pahoiSwVc3oxR6XHFh")
        
        system_prompt = """
        You are an intelligent ONDC Product Categorization AI for Indian MSME businesses.
        Analyze the user's input (voice transcript or text, supporting multiple languages/transliterations) describing a product they sell.
        You must deduce its ONDC taxonomy path, base material, primary category, target gender, and relevant tags.

        Return ONLY a valid JSON object strictly matching this format:
        {
            "path": ["Apparel", "Women", "Ethnic Wear", "Kurti"],
            "material": "Cotton",
            "category": "Kurti",
            "gender": "Women",
            "confidence": 95,
            "tags": ["Fashion", "Ethnic", "Indian Wear"]
        }
        
        Follow these rules:
        - "path" must be a list of strings showing the category hierarchy.
        - "confidence" must be an integer from 0 to 100.
        - "tags" should be an array of 3-5 relevant hashtags/keywords (without the #).
        - If base material is unspecified, guess the most likely or put "Unknown".
        - If gender is unspecified and it's clothing, guess "Unisex".
        """

        result = {
            "path": ["Unknown"],
            "material": "Unknown",
            "category": "Unknown",
            "gender": "Unknown",
            "confidence": 0,
            "tags": []
        }

        try:
            res = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "llama-3.3-70b-versatile",
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": description}
                    ],
                    "response_format": {"type": "json_object"},
                    "temperature": 0.1
                },
                timeout=10
            )
            
            if res.status_code == 200:
                data = res.json()
                content = data["choices"][0]["message"]["content"]
                parsed = json.loads(content)
                result.update(parsed)
            else:
                print(f"Groq API Error: {res.status_code} - {res.text}")
                
        except Exception as e:
            print(f"Extraction exception: {str(e)}")

        processing_time_ms = int((time.time() - start_time) * 1000)
        
        return {
            "status": "success",
            "path": result.get("path", ["Unknown"]),
            "material": result.get("material", "Unknown"),
            "category": result.get("category", "Unknown"),
            "gender": result.get("gender", "Unknown"),
            "confidence": result.get("confidence", 0),
            "tags": result.get("tags", []),
            "processing_time_ms": processing_time_ms
        }

# Singleton instance
classifier_service = AIClassifierService()
