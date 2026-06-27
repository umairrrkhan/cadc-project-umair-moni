import React, { useState, useEffect } from 'react';
import { visionService } from '../service/visionService';
import { useNavigate } from 'react-router-dom';
import '../css/LibraryPage.css';

const LibraryPage = () => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadLibrary();
    }, []);

    const loadLibrary = async () => {
        try {
            setLoading(true);
            const result = await visionService.getLibrary();
            setImages(result.images || []);
        } catch (err) {
            setError('Failed to load library');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this image?')) return;
        try {
            await visionService.deleteImage(id);
            setImages(images.filter(img => img.id !== id));
        } catch (err) {
            alert('Failed to delete');
        }
    };

    if (loading) return <div className="loading">Loading your library...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="library-page">
            <div className="library-header">
                <h2>📚 My Vision Library</h2>
                <button onClick={() => navigate('/home')}>← Back to Chat</button>
            </div>

            {images.length === 0 ? (
                <div className="empty-library">
                    <div className="empty-icon">🖼️</div>
                    <p>No solved images yet</p>
                    <p className="empty-sub">Go to Vision tab and solve a math problem!</p>
                </div>
            ) : (
                <div className="image-grid">
                    {images.map((img) => (
                        <div key={img.id} className="image-card">
                            <img 
                                src={img.solvedImageKey} 
                                alt={img.title || 'Solved image'} 
                            />
                            <div className="image-info">
                                <span className="image-date">
                                    {new Date(img.createdAt).toLocaleDateString()}
                                </span>
                                <button 
                                    className="delete-btn"
                                    onClick={() => handleDelete(img.id)}
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LibraryPage;