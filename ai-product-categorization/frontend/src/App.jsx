import React, { useState, useEffect, useRef } from 'react';

const SYSTEM_PROMPT = `You are an expert ONDC (Open Network for Digital Commerce) taxonomy specialist for Indian e-commerce. Analyze the product and return ONLY a valid JSON object (no markdown, no explanation) with this structure:

{
  "category": {
    "l1": "Top-level category (e.g., Apparel & Clothing)",
    "l2": "Sub-category (e.g., Men's Wear)",
    "l3": "Product type (e.g., Jackets)",
    "l4": "Specific variant (e.g., Denim Jackets)"
  },
  "attributes": {
    "material": "Primary material",
    "target_gender": "Men/Women/Unisex/Kids",
    "age_group": "Adult/Kids/Infant/All Ages",
    "usage_type": "Casual/Formal/Ethnic/Sportswear/Party/Daily",
    "color_family": "Primary color",
    "closure_type": "Button/Zipper/Slip-on/N/A",
    "care_instructions": "Machine Wash/Hand Wash/Dry Clean/N/A",
    "occasion": "Everyday/Festive/Wedding/Office/Sports",
    "key_feature": "Most important feature in 5-7 words"
  },
  "ondc_category_code": "ONDC code e.g. RET12-AB",
  "hsn_code": "Approximate HSN code",
  "confidence_score": 0.95,
  "confidence_reasoning": "One sentence explaining confidence level",
  "seo_keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "similar_categories": ["Alternative category 1", "Alternative category 2"],
  "seller_tips": ["Actionable tip 1 for MSME seller", "Tip 2", "Tip 3"]
}

Rules:
- Use ONDC India taxonomy standards
- If input is in Hindi, return JSON in English
- Be specific for Indian market context
- Return ONLY raw JSON, nothing else`;

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');

:root {
  --bg-color: #080b14;
  --primary: #6366f1;
  --secondary: #8b5cf6;
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
  --text-main: #ffffff;
  --text-muted: rgba(255,255,255,0.45);
  --card-bg: rgba(255,255,255,0.04);
  --border-color: rgba(255,255,255,0.1);
  --font-main: 'Outfit', sans-serif;
  --font-mono: 'DM Mono', monospace;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-main);
  background-color: var(--bg-color);
  color: var(--text-main);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: #0d1117; }
::-webkit-scrollbar-thumb { background: #30363d; border-radius: 2px; }

@keyframes spin { 100% { transform: rotate(360deg); } }
@keyframes float { 
  0% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0); }
}
@keyframes pulse { 
  0% { opacity: 0.3; }
  50% { opacity: 0.7; }
  100% { opacity: 0.3; }
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.particles-container {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.blob-1 {
  position: absolute;
  top: -10%; left: -10%;
  width: 50vw; height: 50vw;
  background: radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 60%);
}

.blob-2 {
  position: absolute;
  bottom: -10%; right: -10%;
  width: 60vw; height: 60vw;
  background: radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 60%);
}

.blob-3 {
  position: absolute;
  top: 40%; right: 10%;
  width: 30vw; height: 30vw;
  background: radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 60%);
}

.particle {
  position: absolute;
  background: white;
  border-radius: 50%;
  animation: float linear infinite, pulse linear infinite;
}

.app-wrapper {
  position: relative;
  z-index: 10;
  max-width: 900px;
  margin: 0 auto;
  padding: 48px 20px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.glass-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: 24px;
}

.title-gradient {
  background: linear-gradient(135deg, #ffffff, #a5b4fc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 900;
  font-size: clamp(32px, 5vw, 48px);
  line-height: 1.1;
  text-align: center;
}

.input-field {
  width: 100%;
  background: rgba(0,0,0,0.3);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 16px;
  color: white;
  font-family: var(--font-main);
  font-size: 16px;
  transition: all 0.3s ease;
}

.input-field:focus {
  outline: none;
  border-color: rgba(99,102,241,0.5);
  box-shadow: 0 0 0 2px rgba(99,102,241,0.1);
}

textarea.input-field {
  resize: vertical;
  min-height: 120px;
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  border: none;
  border-radius: 12px;
  color: white;
  padding: 16px 32px;
  font-family: inherit;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 8px 32px rgba(99,102,241,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(99,102,241,0.4);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-secondary {
  background: transparent;
  border: 1px solid var(--border-color);
  color: white;
  padding: 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(255,255,255,0.05);
}

.loader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  gap: 24px;
}

.rings {
  position: relative;
  width: 64px;
  height: 64px;
}

.ring {
  position: absolute;
  border-radius: 50%;
  border: 2px solid transparent;
  animation: spin linear infinite;
}

.ring-1 {
  inset: 0;
  border-top-color: var(--primary);
  animation-duration: 1s;
}

.ring-2 {
  inset: 8px;
  border-right-color: var(--success);
  animation-duration: 1.5s;
  animation-direction: reverse;
}

.ring-3 {
  inset: 16px;
  border-bottom-color: var(--warning);
  animation-duration: 2s;
}

.tab-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  padding: 12px 24px;
  font-family: inherit;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.tab-btn.active {
  background: rgba(99,102,241,0.2);
  color: #c4b5fd;
}

.mono-pill {
  font-family: var(--font-mono);
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 4px;
  background: rgba(0,0,0,0.5);
  border: 1px solid var(--border-color);
  color: var(--text-muted);
}

.fade-in {
  animation: fadeIn 0.4s ease forwards;
}

.history-card {
  border: 1px solid var(--border-color);
  background: rgba(255,255,255,0.02);
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
}
.history-card:hover {
  background: rgba(255,255,255,0.04);
  border-color: rgba(99,102,241,0.3);
}

.badge-top {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(99,102,241,0.1);
  border: 1px solid rgba(99,102,241,0.2);
  padding: 6px 16px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  color: #a5b4fc;
}

.pulsing-dot {
  width: 6px;
  height: 6px;
  background: #a5b4fc;
  border-radius: 50%;
  box-shadow: 0 0 10px #a5b4fc;
  animation: pulse 1.5s infinite;
}
`;

const Loader = () => (
    <div className="loader-container fade-in">
        <div className="rings">
            <div className="ring ring-1" />
            <div className="ring ring-2" />
            <div className="ring ring-3" />
        </div>
        <div style={{ textAlign: 'center' }}>
            <p style={{ fontWeight: 600, color: '#fff', fontSize: '18px' }}>AI Analysis in Progress</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Mapping to ONDC taxonomy...</p>
        </div>
    </div>
);

const ConfidenceRing = ({ score }) => {
    const percentage = Math.round((parseFloat(score) || 0) * 100);
    const color = percentage >= 85 ? 'var(--success)' : percentage >= 65 ? 'var(--warning)' : 'var(--error)';
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = Math.max(0, circumference - ((percentage / 100) * circumference));

    return (
        <div style={{ position: 'relative', width: '80px', height: '80px', flexShrink: 0 }}>
            <svg width="80" height="80" viewBox="0 0 80 80" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="40" cy="40" r={radius} fill="transparent" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
                <circle
                    cx="40" cy="40" r={radius}
                    fill="transparent"
                    stroke={color}
                    strokeWidth="6"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                />
            </svg>
            <div style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '16px', color: '#fff'
            }}>
                {percentage}%
            </div>
        </div>
    );
};

const CategoryBreadcrumb = ({ category }) => {
    if (!category) return null;
    const parts = [category.l1, category.l2, category.l3, category.l4].filter(Boolean);

    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
            {parts.map((part, i) => {
                const isLast = i === parts.length - 1;
                return (
                    <React.Fragment key={i}>
                        <div style={{
                            background: isLast ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
                            color: isLast ? '#c4b5fd' : 'var(--text-muted)',
                            border: `1px solid ${isLast ? 'rgba(99,102,241,0.3)' : 'var(--border-color)'}`,
                            padding: '6px 14px',
                            borderRadius: '999px',
                            fontSize: '13px',
                            fontWeight: isLast ? 600 : 400
                        }}>
                            {part}
                        </div>
                        {!isLast && (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

const AttributeTag = ({ label, value }) => (
    <div style={{
        background: 'rgba(0,0,0,0.3)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
    }}>
        <span style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
            {label.replace(/_/g, ' ')}
        </span>
        <span style={{ fontSize: '13px', color: '#fff', fontWeight: 500 }}>
            {value || 'N/A'}
        </span>
    </div>
);

const SAMPLE_PRODUCTS = [
    { title: "Men's Blue Denim Jacket", desc: "Classic fit men's blue denim jacket with button closure and 4 pockets. 100% Cotton, machine washable." },
    { title: "महिलाओं की सिल्क साड़ी", desc: "उत्सव और शादी के लिए सुंदर लाल और सोने की जरी वाली बनारसी सिल्क साड़ी। ब्लाउज पीस के साथ।" },
    { title: "Leather Sandals for Women", desc: "Casual everyday flat sandals for women. Genuine brown leather with ankle strap." },
    { title: "Stainless Steel Water Bottle 1L", desc: "Vacuum insulated double-wall steel thermo flask. Keeps water cold for 24 hrs. BPA free." },
    { title: "Kids Cotton Kurta Set", desc: "Yellow cotton ethnic kurta pajama set for 3-4 year old boys. Perfect for Diwali." }
];

export default function App() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);
    const [activeTab, setActiveTab] = useState('attributes');
    const [history, setHistory] = useState([]);
    const resultRef = useRef(null);
    const [showJson, setShowJson] = useState(false);

    // Background particles
    const [particles, setParticles] = useState([]);
    useEffect(() => {
        setParticles(Array.from({ length: 20 }).map(() => ({
            width: Math.random() * 3 + 1 + 'px',
            height: Math.random() * 3 + 1 + 'px',
            top: Math.random() * 100 + '%',
            left: Math.random() * 100 + '%',
            animationDuration: (Math.random() * 3 + 3) + 's',
            animationDelay: Math.random() * 2 + 's'
        })));
    }, []);

    const handleCategorize = async (e) => {
        e?.preventDefault();
        if (!title.trim()) return;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            // Create user prompt from template
            const userPrompt = `Product Title: ${title}\nProduct Description: ${description}`;

            // In a real scenario without an API key injected locally, this will fail with 401. 
            // For demonstration in local without env var, we'll try to use the key if available.
            // If we only have a mock backend we could call the local backend, but the prompt says to call Anthropic via fetch. 
            const apiKey = import.meta.env?.VITE_ANTHROPIC_API_KEY || window.anthropicApiKey || '';

            let parsed;

            // Ensure we have a valid key if making direct call (otherwise we must use our mock route).
            // Taking a hybrid approach for safety so the frontend doesn't just crash.
            if (apiKey) {
                const response = await fetch('https://api.anthropic.com/v1/messages', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'anthropic-version': '2023-06-01',
                        'x-api-key': apiKey,
                        'anthropic-dangerous-direct-browser-access': 'true'
                    },
                    body: JSON.stringify({
                        model: 'claude-3-sonnet-20240229',
                        max_tokens: 1000,
                        system: SYSTEM_PROMPT,
                        messages: [{ role: 'user', content: userPrompt }]
                    })
                });

                if (!response.ok) {
                    throw new Error(`API Error: ${response.status} ${response.statusText}`);
                }

                const data = await response.json();
                const content = data.content?.[0]?.text || '';
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (!jsonMatch) throw new Error("Invalid format received from AI.");
                parsed = JSON.parse(jsonMatch[0]);
            } else {
                // Fallback to local API structure if anthropic key is missing
                const response = await fetch('http://localhost:8000/api/v1/categorize', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title, description, language: 'en' })
                });

                if (!response.ok) {
                    throw new Error("Missing Anthropic API Key and local python backend failed.");
                }
                const data = await response.json();
                // Map local api to expected claude format for the UI
                parsed = {
                    category: {
                        l1: data.category_path?.[0] || 'Unknown',
                        l2: data.category_path?.[1] || '',
                        l3: data.category_path?.[2] || '',
                        l4: data.category_path?.[3] || ''
                    },
                    attributes: data.attributes || {},
                    ondc_category_code: "RET12",
                    hsn_code: "1234.56",
                    confidence_score: data.confidence || 0.85,
                    confidence_reasoning: "Categorized using local mock backend.",
                    seo_keywords: ["mock", "test", "local"],
                    similar_categories: ["Mocked Alternative 1", "Mocked Alternative 2"],
                    seller_tips: ["Add more accurate description for better results.", "Include images."]
                };
            }

            setResult(parsed);
            setHistory(prev => [{ title, parsed, date: new Date() }, ...prev].slice(0, 4));

            setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

        } catch (err) {
            setError(err.message || 'Failed to categorize product');
        } finally {
            setLoading(false);
        }
    };

    const loadSample = (sample) => {
        setTitle(sample.title);
        setDescription(sample.desc);
        setError(null);
        setResult(null);
    };

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: STYLES }} />

            <div className="particles-container">
                <div className="blob-1" />
                <div className="blob-2" />
                <div className="blob-3" />
                {particles.map((p, i) => (
                    <div key={i} className="particle" style={p} />
                ))}
            </div>

            <div className="app-wrapper">
                <header style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                    <div className="badge-top">
                        <div className="pulsing-dot" />
                        ONDC · TEAM INITIATIVE
                    </div>
                    <h1 className="title-gradient">MSME Product Asserts</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '18px', textAlign: 'center', maxWidth: '600px' }}>
                        Instantly map your inventory to the official ONDC taxonomy framework using AI.
                    </p>
                </header>

                <main style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <form className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} onSubmit={handleCategorize}>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                            {SAMPLE_PRODUCTS.map((prod, i) => (
                                <button
                                    key={i} type="button"
                                    onClick={() => loadSample(prod)}
                                    style={{
                                        background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)',
                                        color: '#c4b5fd', fontSize: '12px', padding: '6px 12px', borderRadius: '999px',
                                        cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s'
                                    }}
                                    onMouseOver={e => e.target.style.background = 'rgba(255,255,255,0.1)'}
                                    onMouseOut={e => e.target.style.background = 'rgba(255,255,255,0.05)'}
                                >
                                    {prod.title}
                                </button>
                            ))}
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px' }}>Product Title *</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Enter exact product name..."
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px' }}>Product Description</label>
                            <textarea
                                className="input-field"
                                placeholder="Include material, details, audience..."
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '16px', paddingTop: '8px' }}>
                            <button
                                type="button"
                                onClick={() => { setTitle(''); setDescription(''); setResult(null); setError(null); }}
                                className="btn-secondary"
                                disabled={loading}
                            >
                                Clear
                            </button>
                            <button type="submit" className="btn-primary" style={{ flexGrow: 1 }} disabled={loading || !title}>
                                {loading ? (
                                    <><span style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> Analyzing...</>
                                ) : 'Categorize Product'}
                            </button>
                        </div>
                    </form>

                    {error && (
                        <div className="glass-card fade-in" style={{ borderColor: 'var(--error)', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--error)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                            <div style={{ color: '#fca5a5' }}>{error}</div>
                        </div>
                    )}

                    {loading && <Loader />}

                    {result && (
                        <div className="glass-card fade-in" ref={resultRef} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px' }}>
                                <div style={{ flexGrow: 1 }}>
                                    <h3 style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Predicted ONDC Taxonomy</h3>
                                    <CategoryBreadcrumb category={result.category} />

                                    <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                                        <div className="mono-pill">ONDC: {result.ondc_category_code}</div>
                                        <div className="mono-pill">HSN: {result.hsn_code || 'N/A'}</div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ textAlign: 'right', maxWidth: '200px' }}>
                                        <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                            {result.confidence_reasoning}
                                        </div>
                                    </div>
                                    <ConfidenceRing score={result.confidence_score} />
                                </div>
                            </div>

                            <div style={{ borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', display: 'flex' }}>
                                {['attributes', 'seo & keywords', 'seller tips'].map(tab => (
                                    <button
                                        key={tab}
                                        className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                                        onClick={() => setActiveTab(tab)}
                                        style={{ flex: 1, textTransform: 'capitalize', borderRadius: 0 }}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            <div style={{ minHeight: '200px' }} className="fade-in" key={activeTab}>
                                {activeTab === 'attributes' && (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px' }}>
                                        {Object.entries(result.attributes || {}).map(([key, val]) => (
                                            <AttributeTag key={key} label={key} value={val} />
                                        ))}
                                    </div>
                                )}

                                {activeTab === 'seo & keywords' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                        <div>
                                            <h4 style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>SEO Tags for Listing</h4>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                {(result.seo_keywords || []).map((kw, i) => (
                                                    <div key={i} style={{ background: 'rgba(99,102,241,0.1)', color: '#c4b5fd', padding: '6px 12px', borderRadius: '6px', fontSize: '13px' }}>
                                                        #{kw.replace(/\s+/g, '')}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>Similar Mappings</h4>
                                            <ul style={{ color: 'white', fontSize: '14px', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                {(result.similar_categories || []).map((cat, i) => (
                                                    <li key={i}>{cat}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'seller tips' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {(result.seller_tips || []).map((tip, i) => (
                                            <div key={i} style={{
                                                borderLeft: '3px solid var(--success)',
                                                background: 'rgba(255,255,255,0.03)',
                                                padding: '16px',
                                                borderRadius: '0 8px 8px 0',
                                                display: 'flex', gap: '12px', alignItems: 'flex-start'
                                            }}>
                                                <div style={{ background: 'var(--success)', color: '#000', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px', flexShrink: 0 }}>
                                                    {i + 1}
                                                </div>
                                                <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)', lineHeight: 1.6 }}>
                                                    {tip}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div>
                                <button
                                    onClick={() => setShowJson(!showJson)}
                                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        {showJson ? <polyline points="18 15 12 9 6 15" /> : <polyline points="6 9 12 15 18 9" />}
                                    </svg>
                                    {showJson ? 'Hide Raw JSON' : 'View Raw API Response'}
                                </button>

                                {showJson && (
                                    <pre className="fade-in" style={{
                                        marginTop: '12px', background: '#0d1117', border: '1px solid var(--border-color)',
                                        padding: '16px', borderRadius: '8px', overflowX: 'auto',
                                        fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--success)'
                                    }}>
                                        {JSON.stringify(result, null, 2)}
                                    </pre>
                                )}
                            </div>

                        </div>
                    )}

                    {history.length > 0 && !loading && !result && (
                        <div className="fade-in" style={{ marginTop: '24px' }}>
                            <h3 style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>Recent Classifications</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {history.map((item, i) => (
                                    <div key={i} className="history-card" onClick={() => {
                                        setTitle(item.title);
                                        setResult(item.parsed);
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ fontWeight: 500, color: 'white', marginBottom: '4px' }}>{item.title}</div>
                                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                                    {item.parsed.category?.l4 || item.parsed.category?.l3 || item.parsed.category?.l1}
                                                </div>
                                            </div>
                                            <div style={{ color: (item.parsed.confidence_score || 0) >= 0.85 ? 'var(--success)' : 'var(--warning)', fontWeight: 600, fontSize: '14px' }}>
                                                {Math.round((item.parsed.confidence_score || 0) * 100)}%
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </main>

                <footer style={{ marginTop: '32px', borderTop: '1px solid var(--border-color)', paddingTop: '32px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', fontSize: '24px', filter: 'grayscale(1) opacity(0.5)', marginBottom: '16px' }}>
                        <span>👔</span><span>👟</span><span>🏠</span><span>📱</span><span>🏋️</span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '12px', lineHeight: 1.6 }}>
                        Powered by Claude AI · Built for ONDC TEAM Initiative<br />
                        Empowering Indian MSMEs
                    </p>
                </footer>
            </div>
        </>
    );
}
