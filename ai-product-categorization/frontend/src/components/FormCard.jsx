import React from 'react';

export default function FormCard({ form, onSelect }) {
    return (
        <div className="card form-card">
            <div className="form-authority">{form.authority}</div>
            <h3 className="form-name">{form.name}</h3>
            <p className="form-desc">{form.description}</p>

            <div className="form-card-footer">
                <span className="badge badge-success">Available</span>
                <button className="btn btn-outline" onClick={onSelect}>Fill This Form</button>
            </div>
        </div>
    );
}
