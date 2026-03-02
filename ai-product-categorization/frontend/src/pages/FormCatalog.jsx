import React, { useEffect, useState } from 'react';
import { useLocation } from "wouter";
import FormCard from '../components/FormCard';
import { fetchForms } from '../services/api';

export default function FormCatalog() {
    const [forms, setForms] = useState([]);
    const [, setLocation] = useLocation();

    useEffect(() => {
        fetchForms()
            .then(data => setForms(data))
            .catch(console.error);
    }, []);

    return (
        <div className="fade-in">
            <div className="banner-header">
                <img src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80" alt="Forms Background" className="banner-image" />
                <div className="banner-content">
                    <h2 className="banner-title">Government Form Catalog</h2>
                    <p className="banner-desc">Select an official mandate below to begin the Voice AI automated registration process. No typing required.</p>
                </div>
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
