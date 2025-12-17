import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { FaPlus } from 'react-icons/fa';
import PostCard from '../components/PostCard';

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

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

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="mb-6 flex justify-between items-center">
                <h2 className="text-xl font-bold text-accent-color">Feed</h2>
                <button
                    onClick={() => navigate('/create-post')}
                    className="btn btn-primary btn-icon"
                    style={{ borderRadius: '50%', padding: '0.75rem', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Create Post"
                >
                    <FaPlus />
                </button>
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
