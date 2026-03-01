import React from 'react';
import { useLocation } from "wouter";

export default function Dashboard() {
    const [, setLocation] = useLocation();

    return (
        <div className="fade-in">
            <div className="hero-section">
                <h2 className="hero-title">Simplify Governance with Voice</h2>
                <p className="hero-subtitle">
                    Fill your MSME registration forms in minutes — just speak your details naturally in Hindi or English.
                </p>
                <button className="btn btn-primary btn-large" onClick={() => setLocation('/registration')}>
                    Start Auto-Fill Registration →
                </button>
            </div>

            <div className="stats-row grid-3">
                <div className="stat-card">
                    <div className="stat-val">4</div>
                    <div className="stat-label">Forms Available</div>
                </div>
                <div className="stat-card">
                    <div className="stat-val">2</div>
                    <div className="stat-label">Supported Languages</div>
                </div>
                <div className="stat-card">
                    <div className="stat-val">100%</div>
                    <div className="stat-label">Paperless</div>
                </div>
            </div>
        </div>
    );
}
