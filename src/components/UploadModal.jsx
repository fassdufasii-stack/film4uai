import React, { useState, useRef } from 'react';
import { X, UploadCloud, Film, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import './UploadModal.css';
import { uploadIndieMovie } from '../services/movieService';

const UploadModal = ({ isOpen, onClose }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [genre, setGenre] = useState('Drama');
    const [language, setLanguage] = useState('');
    const [videoFile, setVideoFile] = useState(null);
    const [posterFile, setPosterFile] = useState(null);

    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, success

    const videoInputRef = useRef(null);
    const posterInputRef = useRef(null);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!videoFile) return alert("Please select a video file.");

        setIsUploading(true);
        setUploadStatus('uploading');

        try {
            const movieData = {
                title,
                description: `AI Summary: ${description}`,
                tags: [genre, language],
                releaseDate: new Date().toISOString().split('T')[0],
            };

            await uploadIndieMovie(movieData, videoFile, posterFile);
            setUploadStatus('success');
            setTimeout(() => {
                onClose();
                setUploadStatus('idle');
                setTitle('');
                setDescription('');
                setVideoFile(null);
                setPosterFile(null);
            }, 2000);
        } catch (error) {
            console.error(error);
            alert(`Upload Error: ${error.message}`);
            setUploadStatus('idle');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content upload-premium">
                <button className="close-btn" onClick={onClose}><X size={24} /></button>

                {uploadStatus === 'success' ? (
                    <div className="success-state">
                        <CheckCircle2 size={80} color="#4ade80" />
                        <h2>Deployment Complete</h2>
                        <p>Your film is now being indexed by the AI nodes.</p>
                    </div>
                ) : (
                    <>
                        <h2 className="modal-title">Creator Studio</h2>
                        <p className="modal-subtitle">Upload your masterpiece to the AI Discovery Engine.</p>

                        <form onSubmit={handleSubmit} className="upload-form">
                            <div className="upload-grid">
                                {/* VIDEO DROP ZONE */}
                                <div
                                    className={`drop-zone ${videoFile ? 'has-file' : ''}`}
                                    onClick={() => videoInputRef.current.click()}
                                >
                                    <input
                                        type="file"
                                        ref={videoInputRef}
                                        hidden
                                        accept="video/*"
                                        onChange={(e) => setVideoFile(e.target.files[0])}
                                    />
                                    <Film size={32} className="icon" />
                                    <p>{videoFile ? videoFile.name : 'Choose Video File'}</p>
                                    <span className="file-hint"> Cinema Quality (Large GB Support)</span>
                                </div>

                                {/* POSTER DROP ZONE */}
                                <div
                                    className={`drop-zone small ${posterFile ? 'has-file' : ''}`}
                                    onClick={() => posterInputRef.current.click()}
                                >
                                    <input
                                        type="file"
                                        ref={posterInputRef}
                                        hidden
                                        accept="image/*"
                                        onChange={(e) => setPosterFile(e.target.files[0])}
                                    />
                                    <ImageIcon size={24} className="icon" />
                                    <p>{posterFile ? posterFile.name : 'Poster Image'}</p>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Title</label>
                                <input
                                    type="text"
                                    placeholder="Enter film title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>AI Description Helper</label>
                                <textarea
                                    placeholder="Briefly describe the theme, mood, and story..."
                                    rows="2"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                ></textarea>
                            </div>

                            <div className="form-row">
                                <div className="form-group half">
                                    <label>AI Genre</label>
                                    <select value={genre} onChange={(e) => setGenre(e.target.value)}>
                                        <option>Drama</option>
                                        <option>Sci-Fi</option>
                                        <option>Action</option>
                                        <option>Documentary</option>
                                        <option>Malayalam Indie</option>
                                    </select>
                                </div>
                                <div className="form-group half">
                                    <label>Display Language</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Malayalam"
                                        value={language}
                                        onChange={(e) => setLanguage(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <button type="submit" className="btn-submit" disabled={isUploading}>
                                {isUploading ? (
                                    <div className="loader-container">
                                        <span className="upload-loader"></span>
                                        Committing to AI Storage...
                                    </div>
                                ) : "Distribute to Channels"}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default UploadModal;
