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
                        className="input"
                        placeholder="What's on your mind?"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        style={{
                            resize: 'none',
                            marginBottom: '1rem',
                            minHeight: '100px'
                        }}
                        rows="3"
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
                        </div>
                    )}
                    <div className="flex justify-between items-center gap-4">
                        <div className="flex-1 flex gap-2">
                            <input
                                type="text"
                                placeholder="Image URL (optional)"
                                value={image}
                                onChange={(e) => setImage(e.target.value)}
                                className="input"
                            />
                            {image && (
                                <button
                                    type="button"
                                    onClick={handleAICaption}
                                    title="Generate Caption"
                                    className="btn btn-ghost"
                                    disabled={aiLoading}
                                >
                                    <FaImage />
                                </button>
                            )}
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={aiLoading}>
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
