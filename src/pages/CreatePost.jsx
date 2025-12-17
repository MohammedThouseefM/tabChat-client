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
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
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
                            marginBottom: '1rem',
                            minHeight: '200px'
                        }}
                        rows="6"
                    />

                    {/* AI Tools */}
                    <div className="flex gap-2 mb-4 flex-wrap">
                        <button
                            type="button"
                            onClick={() => handleAIEnhance('tone', 'professional')}
                            className="btn"
                            disabled={aiLoading}
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)' }}
                        >
                            <FaMagic /> Professional
                        </button>
                        <button
                            type="button"
                            onClick={() => handleAIEnhance('tone', 'casual')}
                            className="btn"
                            disabled={aiLoading}
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)' }}
                        >
                            <FaMagic /> Casual
                        </button>
                        <button
                            type="button"
                            onClick={() => handleAIEnhance('grammar')}
                            className="btn"
                            disabled={aiLoading}
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)' }}
                        >
                            <FaMagic /> Fix Grammar
                        </button>
                        <button
                            type="button"
                            onClick={() => handleAIEnhance('hashtags')}
                            className="btn"
                            disabled={aiLoading}
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)' }}
                        >
                            # Hashtags
                        </button>
                    </div>

                    {image && (
                        <div className="relative mb-4">
                            <img src={image} alt="Preview" className="w-full rounded-lg" />
                            <button
                                type="button"
                                onClick={() => setImage('')}
                                className="absolute top-2 right-2 btn btn-icon"
                                style={{ background: 'rgba(0,0,0,0.5)', color: 'white' }}
                            >
                                x
                            </button>
                        </div>
                    )}
                    <div className="flex justify-between items-center gap-4">
                        <div className="flex-1 flex gap-2 items-center">
                            <label className="btn btn-secondary cursor-pointer">
                                <FaImage /> Upload Image
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                            </label>
                            {/* Hidden Image URL input for fallback/manual entry if needed, but let's hide it for now to enforce "perfect" upload */}
                            {image && (
                                <button
                                    type="button"
                                    onClick={handleAICaption}
                                    title="Generate Caption"
                                    className="btn btn-ghost"
                                    disabled={aiLoading}
                                >
                                    <FaMagic /> AI Caption
                                </button>
                            )}
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={aiLoading || uploading}>
                            <FaPaperPlane /> {aiLoading ? 'Thinking...' : (uploading ? 'Uploading...' : 'Post')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePost;
