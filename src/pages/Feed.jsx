import React, { useState, useEffect } from 'react';
import API from '../api';
import PostCard from '../components/PostCard';

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

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
