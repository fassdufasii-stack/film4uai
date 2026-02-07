import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Search, Loader2 } from 'lucide-react';
import './VoiceSearch.css';

const VoiceSearch = ({ onVoiceCommand }) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isSupported, setIsSupported] = useState(true);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setIsSupported(false);
        }
    }, []);

    const startListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.lang = 'en-US'; // Can be expanded to 'ml-IN' for Malayalam
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsListening(true);
            setTranscript('AI is listening...');
        };

        recognition.onresult = (event) => {
            const command = event.results[0][0].transcript;
            setTranscript(`"${command}"`);
            onVoiceCommand(command);
        };

        recognition.onerror = (event) => {
            console.error("Speech Recognition Error:", event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
            setTimeout(() => setTranscript(''), 3000);
        };

        recognition.start();
    };

    if (!isSupported) return null;

    return (
        <div className="voice-search-container">
            <button
                className={`voice-btn ${isListening ? 'listening' : ''}`}
                onClick={startListening}
                title="AI Voice Discovery"
            >
                {isListening ? <Loader2 className="animate-spin" size={20} /> : <Mic size={20} />}
            </button>

            {transcript && (
                <div className="voice-transcript-overlay">
                    <div className="transcript-box">
                        <span className="pulse-dot"></span>
                        <p>{transcript}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VoiceSearch;
