import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { FaHeart, FaRegHeart, FaComment, FaPaperPlane, FaGlobe } from 'react-icons/fa';
import Avatar from './Avatar';
const PostCard = ({ post: initialPost }) => {
    const { user } = useAuth();
    const [post, setPost] = useState(initialPost);
    const [likes, setLikes] = useState(initialPost.Likes || []);
    const [comments, setComments] = useState([]); // Content loaded on demand
    const [commentCount, setCommentCount] = useState(initialPost.Comments?.length || 0);
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [loadingComments, setLoadingComments] = useState(false);

    // Translation State
    const [translatedText, setTranslatedText] = useState('');
    const [translating, setTranslating] = useState(false);

    const isLiked = likes.some((like) => like.userId === user?.id);

    const handleLike = async () => {
        try {
            const { data } = await API.post(`/posts/${post.id}/like`);
            if (data.liked) {
                setLikes([...likes, { userId: user.id }]);
            } else {
                setLikes(likes.filter((like) => like.userId !== user.id));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const toggleComments = async () => {
        if (!showComments) {
            setLoadingComments(true);
            try {
                const { data } = await API.get(`/posts/${post.id}/comments`);
                setComments(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingComments(false);
            }
        }
        setShowComments(!showComments);
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            const { data } = await API.post(`/posts/${post.id}/comments`, { content: newComment });
            setComments([...comments, data]);
            setCommentCount(commentCount + 1);
            setNewComment('');
        } catch (err) {
            console.error(err);
        }
    };

    const handleTranslate = async () => {
        if (translatedText) {
            setTranslatedText(''); // Toggle off
            return;
        }
        setTranslating(true);
        try {
            const { data } = await API.post('/ai/translate', { content: post.content, targetLang: 'English' });
            setTranslatedText(data.result);
        } catch (err) {
            console.error(err);
            alert("Translation failed: " + (err.response?.data?.msg || "Unknown Error"));
        } finally {
            setTranslating(false);
        }
    };

    return (
        <div className="card">
            <div className="post-header">
                <div className="flex items-center gap-4">
                    <Avatar src={post.User.avatar} name={post.User.displayName} userId={post.User.id} />
                    <div>
                        <Link to={`/users/${post.User.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <h3 style={{ fontSize: '1rem', cursor: 'pointer' }} className="hover:underline">{post.User.displayName}</h3>
                        </Link>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                        </span>
                    </div>
                </div>
            </div>

            <p style={{ marginBottom: post.image ? '1rem' : '0', whiteSpace: 'pre-wrap' }}>{post.content}</p>

            {translatedText && (
                <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', borderLeft: '3px solid var(--accent-color)' }}>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', fontWeight: 'bold' }}>Translated:</p>
                    <p style={{ whiteSpace: 'pre-wrap', fontSize: '0.95rem' }}>{translatedText}</p>
                </div>
            )}

            {post.image && (
                <img
                    src={post.image}
                    alt="Post content"
                    className="post-image"
                />
            )}

            {/* Actions */}
            <div className="post-actions">
                <button
                    onClick={handleLike}
                    className="btn btn-ghost"
                    style={{
                        color: isLiked ? '#ef4444' : 'var(--text-secondary)',
                    }}
                >
                    {isLiked ? <FaHeart /> : <FaRegHeart />} {likes.length}
                </button>

                <button
                    onClick={toggleComments}
                    className="btn btn-ghost"
                >
                    <FaComment /> {commentCount}
                </button>

                <button
                    onClick={handleTranslate}
                    className="btn btn-ghost"
                    style={{
                        color: translatedText ? 'var(--accent-color)' : 'var(--text-secondary)',
                    }}
                    disabled={translating}
                >
                    <FaGlobe /> {translating ? '...' : (translatedText ? 'Original' : 'Translate')}
                </button>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                    {loadingComments ? (
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Loading comments...</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
                            {comments.map((comment) => (
                                <div key={comment.id} style={{ display: 'flex', gap: '0.75rem' }}>
                                    <Avatar src={comment.User.avatar} name={comment.User.displayName} size="32px" userId={comment.User.id} />
                                    <div>
                                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '12px' }}>
                                            <Link to={`/users/${comment.User.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                                <span style={{ fontWeight: '600', fontSize: '0.9rem', display: 'block', cursor: 'pointer' }}>{comment.User.displayName}</span>
                                            </Link>
                                            <p style={{ fontSize: '0.95rem' }}>{comment.content}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {comments.length === 0 && <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>No comments yet.</p>}
                        </div>
                    )}

                    {/* Add Comment */}
                    <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '0.75rem' }}>
                        <Avatar src={user.avatar} name={user.displayName} size="32px" />
                        <div style={{ flex: 1, position: 'relative' }}>
                            <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Write a comment..."
                                style={{
                                    width: '100%',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '20px',
                                    padding: '0.5rem 1rem',
                                    paddingRight: '2.5rem',
                                    color: 'white',
                                    outline: 'none'
                                }}
                            />
                            <button
                                type="submit"
                                style={{
                                    position: 'absolute',
                                    right: '0.5rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--accent-color)',
                                    cursor: 'pointer'
                                }}
                                disabled={!newComment.trim()}
                            >
                                <FaPaperPlane />
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default PostCard;
