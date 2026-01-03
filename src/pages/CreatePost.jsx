import React, { useState } from 'react';
import API from '../api';
import { FaPaperPlane, FaMagic, FaImage } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const CreatePost = () => {
    const [content, setContent] = useState('');
    const [image, setImage] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const navigate = useNavigate();

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        setUploading(true);
        try {
            const { data } = await API.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setImage(data.imageUrl);
        } catch (err) {
            console.error(err);
            alert('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        try {
            await API.post('/posts', { content, image });
            navigate('/feed');
        } catch (err) {
            console.error(err);
        }
    };

    const handleAIEnhance = async (type, tone) => {
        if (!content.trim()) return alert("Please write some text first!");
        setAiLoading(true);
        try {
            const { data } = await API.post('/ai/enhance', { content, type, tone });
            if (type === 'hashtags') {
                setContent(prev => `${prev}\n\n${data.result}`);
            } else {
                setContent(data.result);
            }
        } catch (err) {
            console.error(err);
            alert("AI Error: " + (err.response?.data?.msg || "Failed to enhance"));
        } finally {
            setAiLoading(false);
        }
    };

    const handleAICaption = async () => {
        if (!image.trim()) return alert("Please enter an image URL first!");
        setAiLoading(true);
        try {
            const { data } = await API.post('/ai/caption', { imageUrl: image });
            setContent(prev => prev ? `${prev}\n\n${data.result}` : data.result);
        } catch (err) {
            console.error(err);
            alert("AI Error: " + (err.response?.data?.msg || "Failed to generate caption"));
        } finally {
            setAiLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1rem' }}>
            <h2 className="text-xl font-bold text-accent-color mb-6">Create New Post</h2>
            <div className="card mb-4" style={{ position: 'relative' }}>
                <form onSubmit={handleSubmit}>
                    <textarea
                        className="input"
                        placeholder="What's on your mind?"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        style={{
                            resize: 'none',
                            marginBottom: '0.75rem',
                            minHeight: '100px'
                        }}
                        rows="3"
                    />

                    {/* AI Tools */}
                    <div className="flex gap-2 mb-3 flex-wrap">
                        <button
                            type="button"
                            onClick={() => handleAIEnhance('tone', 'professional')}
                            className="btn"
                            disabled={aiLoading}
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)' }}
                        >
                            <FaMagic /> Professional
                        </button>
                        <button
                            type="button"
                            onClick={() => handleAIEnhance('tone', 'casual')}
                            className="btn"
                            disabled={aiLoading}
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)' }}
                        >
                            <FaMagic /> Casual
                        </button>
                        <button
                            type="button"
                            onClick={() => handleAIEnhance('grammar')}
                            className="btn"
                            disabled={aiLoading}
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)' }}
                        >
                            <FaMagic /> Fix Grammar
                        </button>
                        <button
                            type="button"
                            onClick={() => handleAIEnhance('hashtags')}
                            className="btn"
                            disabled={aiLoading}
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)' }}
                        >
                            # Hashtags
                        </button>
                    </div>

                    {/* Upload / Preview Area */}
                    <div className="mb-4">
                        {image ? (
                            <div className="relative rounded-xl overflow-hidden border border-[var(--border-color)] group">
                                <img src={image} alt="Preview" className="w-full object-cover max-h-[400px]" />

                                {/* Overlay Actions */}
                                <div className="absolute top-2 right-2 flex gap-2">
                                    <button
                                        type="button"
                                        onClick={handleAICaption}
                                        title="Generate AI Caption"
                                        className="btn btn-sm"
                                        disabled={aiLoading}
                                        style={{ background: 'rgba(0,0,0,0.6)', color: 'white', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.2)' }}
                                    >
                                        <FaMagic /> Caption
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setImage('')}
                                        className="btn btn-icon"
                                        style={{ background: 'rgba(0,0,0,0.6)', color: 'white', backdropFilter: 'blur(4px)', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)' }}
                                    >
                                        &times;
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <label className="upload-area">
                                <div className="upload-placeholder">
                                    <div className="upload-icon-wrapper">
                                        <FaImage style={{ fontSize: '1.5rem' }} />
                                    </div>
                                    <span style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)' }}>Add Photo</span>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>or drag and drop</span>
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                            </label>
                        )}
                    </div>

                    <div className="flex justify-end items-center">
                        <button type="submit" className="btn btn-primary" disabled={aiLoading || uploading} style={{ minWidth: '120px' }}>
                            <FaPaperPlane /> {aiLoading ? 'Thinking...' : (uploading ? 'Uploading...' : 'Post')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePost;
