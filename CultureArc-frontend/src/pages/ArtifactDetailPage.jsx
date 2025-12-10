import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { BookmarkPlus, Share2, Edit2, Trash2, Heart, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import AddToCollectionModal from '../components/features/AddToCollectionModal';
import api from '../api/axios';

const ArtifactDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [artifact, setArtifact] = useState(null);
    const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
    const [commentText, setCommentText] = useState('');

    const handleLike = async () => {
        if (!user) return alert('Please login to like');
        try {
            const { data } = await api.post(`/artifacts/${id}/like`);
            setArtifact(prev => ({ ...prev, likes: data }));
        } catch (error) {
            console.error('Failed to like', error);
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!user) return alert('Please login to comment');
        try {
            const { data } = await api.post(`/artifacts/${id}/comment`, { text: commentText });
            setArtifact(prev => ({ ...prev, comments: data }));
            setCommentText('');
        } catch (error) {
            console.error('Failed to comment', error);
        }
    };

    useEffect(() => {
        const fetchArtifact = async () => {
            try {
                const { data } = await api.get(`/artifacts/${id}`);
                setArtifact(data);
            } catch (error) {
                console.error('Failed to fetch artifact', error);
            }
        };

        if (id) {
            fetchArtifact();
        }
    }, [id]);

    if (!artifact) {
        return <div className="p-10 text-center text-slate-500">Loading artifact details...</div>;
    }

    return (
        <div className="flex flex-col flex-1 justify-center py-8 sm:py-12 lg:py-16">
            <div className="flex flex-col w-full max-w-7xl px-4 sm:px-6 lg:px-8 mx-auto">
                <div className="flex flex-wrap gap-2 mb-8">
                    <Link className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-white text-sm font-medium leading-normal transition-colors" to="/">Home</Link>
                    <span className="text-gray-400 dark:text-gray-500 text-sm font-medium leading-normal">/</span>
                    <Link className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-white text-sm font-medium leading-normal transition-colors" to="/explore">Explore</Link>
                    <span className="text-gray-400 dark:text-gray-500 text-sm font-medium leading-normal">/</span>
                    <a className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-white text-sm font-medium leading-normal transition-colors" href="#">{artifact.era}</a>
                    <span className="text-gray-400 dark:text-gray-500 text-sm font-medium leading-normal">/</span>
                    <span className="text-slate-900 dark:text-white text-sm font-medium leading-normal">{artifact.title}</span>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-16">
                    <div className="w-full">
                        <div className="w-full bg-center bg-no-repeat bg-cover flex flex-col justify-end overflow-hidden rounded-xl min-h-[400px] md:min-h-[500px] lg:min-h-[600px] shadow-sm" style={{ backgroundImage: `url("${artifact.imageUrl}")` }}></div>
                    </div>
                    <div className="flex flex-col pt-8 lg:pt-0">
                        <h1 className="text-slate-900 dark:text-white text-4xl lg:text-5xl font-black leading-tight tracking-[-0.033em]">{artifact.title}</h1>
                        <div className="mt-8 border-t border-gray-200 dark:border-gray-700">
                            <div className="grid grid-cols-[1fr_2fr] gap-x-6 py-5 border-b border-gray-200 dark:border-gray-700">
                                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Period</p>
                                <p className="text-slate-900 dark:text-gray-200 text-sm font-medium">{artifact.era}</p>
                            </div>
                            <div className="grid grid-cols-[1fr_2fr] gap-x-6 py-5 border-b border-gray-200 dark:border-gray-700">
                                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Category</p>
                                <p className="text-slate-900 dark:text-gray-200 text-sm font-medium">{artifact.category}</p>
                            </div>
                            <div className="grid grid-cols-[1fr_2fr] gap-x-6 py-5 border-b border-gray-200 dark:border-gray-700">
                                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Region of Origin</p>
                                <p className="text-slate-900 dark:text-gray-200 text-sm font-medium">{artifact.region}</p>
                            </div>
                        </div>
                        <p className="mt-6 text-base leading-relaxed text-gray-600 dark:text-gray-300">{artifact.description}</p>
                        <div className="mt-10 flex flex-wrap gap-4">
                            <Button
                                variant={artifact.likes?.includes(user?._id) ? 'primary' : 'outline'}
                                className="gap-2"
                                onClick={handleLike}
                            >
                                <Heart size={20} fill={artifact.likes?.includes(user?._id) ? "currentColor" : "none"} />
                                <span>{artifact.likes?.length || 0} Likes</span>
                            </Button>

                            {user && artifact.user === user._id && (
                                <>
                                    <Button
                                        variant="outline"
                                        className="gap-2"
                                        onClick={() => navigate(`/edit-artifact/${id}`)}
                                    >
                                        <Edit2 size={20} />
                                        <span>Edit</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-900"
                                        onClick={async () => {
                                            if (window.confirm('Delete this artifact?')) {
                                                try {
                                                    await api.delete(`/artifacts/${id}`);
                                                    navigate('/explore');
                                                } catch (e) {
                                                    alert('Failed to delete');
                                                }
                                            }
                                        }}
                                    >
                                        <Trash2 size={20} />
                                        <span>Delete</span>
                                    </Button>
                                </>
                            )}
                            <Button
                                variant="outline"
                                className="gap-2"
                                onClick={() => setIsCollectionModalOpen(true)}
                            >
                                <BookmarkPlus size={20} />
                                <span>Add to Collection</span>
                            </Button>
                            <Button variant="outline" className="gap-2">
                                <Share2 size={20} />
                                <span>Share</span>
                            </Button>
                        </div>

                        {/* Comments Section */}
                        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Comments ({artifact.comments?.length || 0})</h3>

                            {/* Comment List */}
                            <div className="space-y-6 mb-8">
                                {artifact.comments?.length > 0 ? (
                                    artifact.comments.map((comment, index) => (
                                        <div key={index} className="flex gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                                {comment.userName?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-bold text-slate-900 dark:text-white">{comment.userName}</span>
                                                    <span className="text-xs text-slate-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-slate-700 dark:text-slate-300">{comment.text}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-slate-500 italic">No comments yet. Be the first to share your thoughts!</p>
                                )}
                            </div>

                            {/* Comment Form */}
                            {user ? (
                                <form onSubmit={handleComment} className="flex gap-4">
                                    <input
                                        type="text"
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        placeholder="Add a comment..."
                                        className="flex-1 rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                    />
                                    <Button type="submit" variant="primary">Post</Button>
                                </form>
                            ) : (
                                <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200 text-center">
                                    Please <Link to="/login" className="underline font-bold">login</Link> to join the discussion.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <AddToCollectionModal
                isOpen={isCollectionModalOpen}
                onClose={() => setIsCollectionModalOpen(false)}
                artifactId={id}
            />
        </div>
    );
};

export default ArtifactDetailPage;
