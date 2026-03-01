import React from 'react';

export default function FieldConfidenceBadge({ confidence }) {
    if (!confidence) return null;

    const confScore = Math.round(confidence * 100);
    const isHigh = confScore > 90;

    return (
        <span className={`conf-badge ${isHigh ? 'conf-high' : 'conf-warn'}`} title={`AI Confidence: ${confScore}%`}>
            {isHigh ? '✅ High' : '⚠️ Review'}
        </span>
    );
}
