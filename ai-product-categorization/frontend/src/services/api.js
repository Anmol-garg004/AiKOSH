export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const defaultForms = [
    {
        id: "udyam-001",
        name: "Udyam Registration",
        authority: "Ministry of MSME",
        description: "Official MSME business registration form for small and medium enterprises.",
        img: "https://images.unsplash.com/photo-1604719312566-f4125f4aa4e1?auto=format&fit=crop&w=600&q=80",
        fields: ["owner_name", "business_name", "aadhaar", "pan", "address", "city", "district", "state", "pincode", "activity_type", "investment_amount"]
    },
    {
        id: "gst-01",
        name: "GST Registration (REG-01)",
        authority: "CBIC",
        description: "Goods & Services Tax enrollment for businesses.",
        img: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80",
        fields: ["legal_name", "pan", "state", "turnover", "pincode"]
    },
    {
        id: "shop-est-01",
        name: "Shop & Establishment Act",
        authority: "State Labour Dept.",
        description: "Local business licensing and registration.",
        img: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=600&q=80",
        fields: ["owner_name", "business_name", "address", "state", "employee_count"]
    },
    {
        id: "fssai-01",
        name: "FSSAI Basic Registration",
        authority: "Food Safety Dept.",
        description: "Food business operator basic license.",
        img: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=600&q=80",
        fields: ["owner_name", "business_name", "food_category", "address", "pincode"]
    }
];

export const fetchForms = async () => {
    try {
        const res = await fetch(`${API_URL}/forms`);
        if (!res.ok) throw new Error("Failed to fetch forms");
        const data = await res.json();
        // Merge images back into data since API doesn't have them
        return data.map((f, i) => ({ ...f, img: defaultForms[i]?.img || defaultForms[0].img }));
    } catch {
        return defaultForms;
    }
};

export const submitVoiceData = async (formId, transcript, language = 'en') => {
    const res = await fetch(`${API_URL}/voice/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ form_id: formId, transcript, language })
    });
    if (!res.ok) throw new Error("Voice processing failed");
    return res.json();
};

export const submitFinalForm = async (formId, fields) => {
    const res = await fetch(`${API_URL}/forms/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ form_id: formId, fields })
    });
    if (!res.ok) throw new Error("Form submission failed");
    return res.json();
};

export const predictCategory = async (description) => {
    const res = await fetch(`${API_URL}/categorize/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description })
    });
    if (!res.ok) throw new Error("Categorization failed");
    return res.json();
};

export const generateGuidedPrompt = async (field, language) => {
    try {
        const res = await fetch(`${API_URL}/voice/prompt`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ field, language })
        });
        if (!res.ok) return { prompt: `Please provide your ${field}` };
        return await res.json();
    } catch {
        return { prompt: `Please provide your ${field}` };
    }
};
