import React, { useEffect, useState } from 'react';
import { useLocation } from "wouter";
import FormCard from '../components/FormCard';

export default function FormCatalog() {
    const [forms, setForms] = useState([]);
    const [, setLocation] = useLocation();

    useEffect(() => {
        // We will hardcode fallback for seamless dev experience if backend is down
        const defaultForms = [
            { id: "udyam-001", name: "Udyam Registration", authority: "Ministry of MSME", description: "Official MSME business registration form for small and medium enterprises." },
            { id: "gst-01", name: "GST Registration (REG-01)", authority: "CBIC", description: "Goods & Services Tax enrollment for businesses." },
            { id: "shop-est-01", name: "Shop & Establishment Act", authority: "State Labour Dept", description: "Local business licensing and registration." },
            { id: "fssai-01", name: "FSSAI Basic Registration", authority: "Food Safety Dept.", description: "Food business operator basic license." }
        ];

        fetch('http://localhost:8000/api/v1/forms')
            .then(res => res.json())
            .then(data => setForms(data))
            .catch(() => setForms(defaultForms));
    }, []);

    return (
        <div className="fade-in">
            <div className="page-header">
                <h2 className="page-title">Government Form Catalog</h2>
                <p className="page-desc">Select a form below to start the voice-guided auto-fill process.</p>
            </div>

            <div className="form-grid">
                {forms.map(form => (
                    <FormCard
                        key={form.id}
                        form={form}
                        onSelect={() => setLocation(`/registration/${form.id}`)}
                    />
                ))}
            </div>
        </div>
    );
}
