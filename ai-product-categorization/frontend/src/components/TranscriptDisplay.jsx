import React from 'react';

export default function TranscriptDisplay({ transcript }) {
    const displayObj = transcript || "Waiting for speech...";

    return (
        <div className="transcript-box">
            <div className="transcript-header">Live Transcript</div>
            <div className="transcript-body">{displayObj}</div>
        </div>
    );
}
