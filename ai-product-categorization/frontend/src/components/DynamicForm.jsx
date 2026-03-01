import React from 'react';
import FieldConfidenceBadge from './FieldConfidenceBadge';

export default function DynamicForm({ formDef, extractedData, onChange }) {
    if (!formDef) return <div className="loading">Loading official form...</div>;

    return (
        <div className="dynamic-form">
            <div className="official-form-header">
                <h3 className="form-title">{formDef.name}</h3>
                <span className="badge badge-neutral">{formDef.authority}</span>
            </div>

            <div className="form-fields mock-gov-layout">
                {formDef.fields.map(field => {
                    const fieldName = field.name || field;
                    let label = field.label || fieldName.replace(/_/g, ' ');
                    label = label.charAt(0).toUpperCase() + label.slice(1);

                    const extractedValue = extractedData?.[fieldName]?.value || '';
                    const confidence = extractedData?.[fieldName]?.confidence;

                    return (
                        <div className={`form-row ${extractedValue ? 'filled' : 'empty'}`} key={fieldName}>
                            <label>
                                {label}
                                <FieldConfidenceBadge confidence={confidence} />
                            </label>
                            <input
                                type={field.type || "text"}
                                className="gov-input"
                                name={fieldName}
                                value={extractedValue}
                                onChange={(e) => onChange(fieldName, e.target.value)}
                                placeholder="---"
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
