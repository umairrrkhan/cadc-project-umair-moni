import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { noteService } from '../service/noteService';
import '../css/NotesPage.css';

const NotesPage = () => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const navigate = useNavigate();

useEffect(() => {
        loadNotes();
    }, []);

    const loadNotes = async () => {
        setLoading(true);
        try {
            const data = await noteService.getNotes();
            setNotes(data || []);
        } catch (error) {
            console.error('Failed to load notes:', error);
            alert('Could not load your notes.');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                alert('Files must be 10 MB or smaller.');
                e.target.value = '';
                return;
            }
            // Validate file type (images, pdf, txt, doc, docx)
            const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (!validTypes.includes(file.type)) {
                alert('Only images, PDFs, TXTs, and DOC/DOCX files are allowed.');
                e.target.value = '';
                return;
            }
            setSelectedFile(file);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            alert('Please select a file first.');
            return;
        }

        setUploading(true);
        try {
            await noteService.uploadNote(selectedFile);
            alert('File uploaded successfully!');
            setSelectedFile(null);
            document.getElementById('fileInput').value = ''; // Reset input
            loadNotes(); // Refresh the list
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('delete this note?')) return;
        try {
            await noteService.deleteNote(id);
            setNotes(notes.filter(n => n.id !== id));
        } catch (error) {
            alert('Failed to delete.');
        }
    };

    return (
        <div className="notes-page">
            <div className="notes-header">
                <h2>📁 My Notes Vault</h2>
                <button className="back-btn" onClick={() => navigate('/home')}>
                    ← Back to Chat
                </button>
            </div>

            {/* Upload Section */}
            <div className="upload-section">
                <input
                    id="fileInput"
                    type="file"
                    accept=".png,.jpg,.jpeg,.webp,.pdf,.txt,.doc,.docx"
                    onChange={handleFileChange}
                />
                <button 
                    className="upload-btn" 
                    onClick={handleUpload} 
                    disabled={uploading || !selectedFile}
                >
                    {uploading ? 'Uploading...' : 'Upload to Vault'}
                </button>
                {selectedFile && (
                    <span className="file-name">📎 {selectedFile.name}</span>
                )}
            </div>

            {/* Notes Grid */}
            {loading ? (
                <div className="loading-spinner">Loading your vault...</div>
            ) : notes.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📂</div>
                    <p>Your vault is empty</p>
                    <p className="empty-sub">Upload your first note (image, PDF, or document)</p>
                </div>
            ) : (
                <div className="notes-grid">
                    {notes.map((note) => (
                        <div key={note.id} className="note-card">
                            {/* If it's an image, show thumbnail */}
                            {note.fileType && note.fileType.startsWith('image/') ? (
                                <img src={note.s3Url} alt={note.fileName} className="note-thumbnail" />
                            ) : (
                                <div className="note-file-icon">
                                    {note.fileType === 'application/pdf' && '📄'}
                                    {note.fileType === 'text/plain' && '📝'}
                                    {(note.fileType === 'application/msword' || note.fileType.includes('word')) && '📃'}
                                    {!note.fileType && '📎'}
                                </div>
                            )}
                            <div className="note-info">
                                <a href={note.s3Url} target="_blank" rel="noopener noreferrer" className="note-name">
                                    {note.fileName}
                                </a>
                                <span className="note-date">
                                    {new Date(note.uploadedAt).toLocaleDateString()}
                                </span>
                                <button 
                                    className="delete-note-btn"
                                    onClick={() => handleDelete(note.id)}
                                >
                                    🗑️ Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NotesPage;
