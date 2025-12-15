import React, { useState, useEffect } from 'react';
import API from '../api';
import { FaPaperPlane, FaMagic, FaImage } from 'react-icons/fa';
import PostCard from '../components/PostCard';

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [content, setContent] = useState('');
    const [image, setImage] = useState('');
    const [loading, setLoading] = useState(true);
    const [aiLoading, setAiLoading] = useState(false);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const { data } = await API.get('/posts');
            setPosts(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        try {
            await API.post('/posts', { content, image });
            setContent('');
            setImage('');
            fetchPosts(); // Refresh feed
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
            {/* Create Post */}
            <div className="card mb-4" style={{ position: 'relative' }}>
                <form onSubmit={handleSubmit}>
                    <textarea
                        className="input-field"
                        placeholder="What's on your mind?"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        style={{
                            width: '100%',
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-primary)',
                            resize: 'none',
                            outline: 'none',
                            fontSize: '1rem',
                            marginBottom: '1rem'
                        }}
                        rows="3"
                    />

                    {/* AI Tools */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
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
                        <div style={{ position: 'relative' }}>
                            <img src={image} alt="Preview" style={{ width: '100%', borderRadius: '8px', marginBottom: '1rem' }} />
                        </div>
                    )}
                    <div className="flex justify-between items-center">
                        <div style={{ display: 'flex', gap: '0.5rem', flex: 1, marginRight: '1rem' }}>
                            <input
                                type="text"
                                placeholder="Image URL (optional)"
                                value={image}
                                onChange={(e) => setImage(e.target.value)}
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: 'none',
                                    padding: '0.5rem',
                                    borderRadius: '4px',
                                    color: 'var(--text-secondary)',
                                    width: '100%'
                                }}
                            />
                            {image && (
                                <button
                                    type="button"
                                    onClick={handleAICaption}
                                    title="Generate Caption"
                                    className="btn"
                                    disabled={aiLoading}
                                    style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.1)' }}
                                >
                                    <FaImage /> AI Caption
                                </button>
                            )}
                        </div>
                        <button type="submit" className="btn btn-primary flex items-center gap-4" disabled={aiLoading}>
                            <FaPaperPlane /> {aiLoading ? 'Thinking...' : 'Post'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Filter Tabs Removed */}
            <div className="mb-6">
                <h2 className="text-xl font-bold text-accent-color">Feed</h2>
            </div>

            {/* Feed */}
            {
                loading ? (
                    <p>Loading posts...</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {posts.map((post) => (
                            <PostCard key={post.id} post={post} />
                        ))}
                    </div>
                )
            }
        </div >
    );
};

export default Feed;
