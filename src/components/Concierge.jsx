import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, X, Sparkles, Loader2 } from 'lucide-react';
import './Concierge.css';
import { getAIRecommendations, getDirectChatReply } from '../services/gptService';

const Concierge = ({ movies, onSelectMovie, onRecommendations }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        { role: 'ai', text: 'Hello! I am Film4u AI, your AI-first OTT intelligence assistant. How can I help you navigate the content universe today?' }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsTyping(true);

        try {
            // Run both in parallel for speed and reliability
            const [aiResponse, recommendedIds] = await Promise.all([
                getDirectChatReply(userMsg).catch(err => `Chat focus is offline, but I'm still scanning the catalog. ${err.message}`),
                getAIRecommendations(userMsg, movies).catch(() => []) // Silently fallback to [] if recs fail
            ]);

            setMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);

            if (recommendedIds && recommendedIds.length > 0) {
                onRecommendations && onRecommendations(recommendedIds);
            }
        } catch (err) {
            setMessages(prev => [...prev, { role: 'ai', text: "My analytical core is recalibrating. Please try again in a moment." }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className={`concierge-wrapper ${isOpen ? 'open' : ''}`}>
            <button className="concierge-trigger" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <X size={24} /> : <Bot size={24} />}
                <span className="pulse-ai"></span>
            </button>

            <div className="concierge-window">
                <div className="concierge-header">
                    <div className="header-content-left">
                        <div className="header-info">
                            <Sparkles size={16} className="icon-gold" />
                            <span className="gpt-badge">AI ACTIVE</span>
                        </div>
                        <h3>Film4u AI Assistant</h3>
                    </div>
                    <button className="close-concierge mobile-only" onClick={() => setIsOpen(false)}>
                        <X size={20} />
                    </button>
                </div>

                <div className="concierge-messages" ref={scrollRef}>
                    {messages.length > 0 ? messages.map((m, i) => (
                        <div key={`msg-${i}`} className={`msg-bubble ${m.role || 'ai'}`}>
                            <strong style={{
                                display: 'block',
                                minHeight: '1.2em',
                                color: 'inherit',
                                pointerEvents: 'auto'
                            }}>
                                {String(m.text || "AI Error: Message Content Null")}
                            </strong>
                        </div>
                    )) : (
                        <div className="msg-bubble ai"><strong>Connecting to Film4u Intelligence...</strong></div>
                    )}
                    {isTyping && (
                        <div className="msg-bubble ai typing">
                            <Loader2 size={16} className="animate-spin" />
                            <strong>Neural Processing...</strong>
                        </div>
                    )}
                </div>

                <form onSubmit={handleSend} className="concierge-input">
                    <input
                        type="text"
                        placeholder="Search mood, genre, or OTT info..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <button type="submit"><Send size={18} /></button>
                </form>
            </div>
        </div>
    );
};

export default Concierge;
