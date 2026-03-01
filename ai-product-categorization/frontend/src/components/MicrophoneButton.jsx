import React, { useState, useRef, useEffect } from 'react';

export default function MicrophoneButton({ onTranscriptUpdate, onStatusChange }) {
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);
    const latestTranscriptRef = useRef(''); // Track local transcript for TTS callback

    const speakConfirmation = (text) => {
        if (!text || text.trim() === '') return;

        // Cancel any currently playing speech to avoid overlapping
        window.speechSynthesis.cancel();

        const msg = new SpeechSynthesisUtterance();
        msg.text = `You said: ${text}. Is this information correct and ready to proceed?`;
        msg.lang = 'hi-IN'; // Uses Indian accent/voice, supporting both English & Hindi
        window.speechSynthesis.speak(msg);
    };

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            onStatusChange('Idle');
        } else {
            window.speechSynthesis.cancel(); // Cancel any existing speech if starting a new recording
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) {
                alert("Browser not supported. Use Chrome or Edge.");
                return;
            }

            const rc = new SpeechRecognition();
            rc.continuous = true;
            rc.interimResults = true;
            rc.lang = 'hi-IN';

            rc.onstart = () => {
                setIsListening(true);
                onStatusChange('Listening...');
                latestTranscriptRef.current = ''; // Reset local tracking
                onTranscriptUpdate(''); // Clear previous inputs exactly when mic starts
            };

            rc.onresult = (event) => {
                let trans = '';
                // Iterate from 0 to capture the whole mic session, enabling real-time "sath sath" replacement
                for (let i = 0; i < event.results.length; i++) {
                    trans += event.results[i][0].transcript;
                }
                latestTranscriptRef.current = trans; // Save to ref for TTS callback
                onTranscriptUpdate(trans);
            };

            rc.onerror = (e) => {
                console.error("Mic error:", e.error);
                setIsListening(false);
                onStatusChange('Error: ' + e.error);
            };

            rc.onend = () => {
                setIsListening(false);
                onStatusChange('Idle');
                speakConfirmation(latestTranscriptRef.current);
            };

            recognitionRef.current = rc;
            rc.start();
        }
    };

    return (
        <button
            className={`mic-button ${isListening ? 'active pulsing' : ''}`}
            onClick={toggleListening}
        >
            <span style={{ fontSize: '32px' }}>{isListening ? '🛑' : '🎙️'}</span>
        </button>
    );
}
