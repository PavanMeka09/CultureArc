import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { BookmarkPlus, Edit2, Trash2, Heart, AlertTriangle, Check, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import AddToCollectionModal from '../components/features/AddToCollectionModal';
import api from '../api/axios';

const ArtifactDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [artifact, setArtifact] = useState(null);
    const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [isLiking, setIsLiking] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isCommenting, setIsCommenting] = useState(false);
    const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '' });

    const showAlert = (title, message) => {
        setAlertModal({ isOpen: true, title, message });
    };

    // Comment edit/delete state
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingCommentText, setEditingCommentText] = useState('');
    const [deletingCommentId, setDeletingCommentId] = useState(null);
    const [isCommentDeleteModalOpen, setIsCommentDeleteModalOpen] = useState(false);
    const [isSavingComment, setIsSavingComment] = useState(false);
    const [isDeletingComment, setIsDeletingComment] = useState(false);

    const handleLike = async () => {
        if (!user) return showAlert('Login Required', 'Please login to like this artifact.');
        if (isLiking) return;

        // Optimistic update
        const previousLikes = artifact.likes || [];
        const isLiked = previousLikes.includes(user._id);
        const newLikes = isLiked
            ? previousLikes.filter(id => id !== user._id)
            : [...previousLikes, user._id];

        setArtifact(prev => ({ ...prev, likes: newLikes }));
        setIsLiking(true);

        try {
            const { data } = await api.post(`/artifacts/${id}/like`);
            setArtifact(prev => ({ ...prev, likes: data }));
        } catch (error) {
            // Rollback on error
            setArtifact(prev => ({ ...prev, likes: previousLikes }));
            console.error('Failed to like', error);
        } finally {
            setIsLiking(false);
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!user) return showAlert('Login Required', 'Please login to post a comment.');
        if (!commentText.trim() || isCommenting) return;

        setIsCommenting(true);
        try {
            const { data } = await api.post(`/artifacts/${id}/comment`, { text: commentText });
            setArtifact(prev => ({ ...prev, comments: data }));
            setCommentText('');
        } catch (error) {
            console.error('Failed to comment', error);
        } finally {
            setIsCommenting(false);
        }
    };

    const handleEditComment = (comment) => {
        setEditingCommentId(comment._id);
        setEditingCommentText(comment.text);
    };

    const handleCancelEdit = () => {
        setEditingCommentId(null);
        setEditingCommentText('');
    };

    const handleSaveComment = async (commentId) => {
        if (!editingCommentText.trim()) return;
        setIsSavingComment(true);
        try {
            const { data } = await api.put(`/artifacts/${id}/comment/${commentId}`, { text: editingCommentText });
            setArtifact(prev => ({ ...prev, comments: data }));
            setEditingCommentId(null);
            setEditingCommentText('');
        } catch (error) {
            console.error('Failed to update comment', error);
        } finally {
            setIsSavingComment(false);
        }
    };

    const handleDeleteCommentClick = (commentId) => {
        setDeletingCommentId(commentId);
        setIsCommentDeleteModalOpen(true);
    };

    const handleConfirmDeleteComment = async () => {
        setIsDeletingComment(true);
        try {
            await api.delete(`/artifacts/${id}/comment/${deletingCommentId}`);
            setArtifact(prev => ({
                ...prev,
                comments: prev.comments.filter(c => c._id !== deletingCommentId)
            }));
        } catch (error) {
            console.error('Failed to delete comment', error);
        } finally {
            setIsDeletingComment(false);
            setIsCommentDeleteModalOpen(false);
            setDeletingCommentId(null);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await api.delete(`/artifacts/${id}`);
            navigate('/explore');
        } catch {
            showAlert('Error', 'Failed to delete artifact');
        } finally {
            setIsDeleting(false);
            setIsDeleteModalOpen(false);
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

    const canEditComment = (comment) => {
        return user && (comment.user?.toString() === user._id || comment.user === user._id || user.isAdmin);
    };

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

                            {user && (artifact.user?.toString() === user._id || user.isAdmin) && (
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
                                        onClick={() => setIsDeleteModalOpen(true)}
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

                        </div>

                        {/* Comments Section */}
                        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Comments ({artifact.comments?.length || 0})</h3>

                            {/* Comment List */}
                            <div className="space-y-6 mb-8">
                                {artifact.comments?.length > 0 ? (
                                    artifact.comments.map((comment) => (
                                        <div key={comment._id} className="flex gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0">
                                                {comment.userName?.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2 mb-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-slate-900 dark:text-white">{comment.userName}</span>
                                                        <span className="text-xs text-slate-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                    {canEditComment(comment) && editingCommentId !== comment._id && (
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                onClick={() => handleEditComment(comment)}
                                                                className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-primary transition-colors"
                                                                title="Edit comment"
                                                            >
                                                                <Edit2 size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteCommentClick(comment._id)}
                                                                className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-500 hover:text-red-600 transition-colors"
                                                                title="Delete comment"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                                {editingCommentId === comment._id ? (
                                                    <div className="flex gap-2 items-center">
                                                        <input
                                                            type="text"
                                                            value={editingCommentText}
                                                            onChange={(e) => setEditingCommentText(e.target.value)}
                                                            className="flex-1 rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                                            autoFocus
                                                        />
                                                        <button
                                                            onClick={() => handleSaveComment(comment._id)}
                                                            disabled={isSavingComment}
                                                            className="p-1.5 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
                                                            title="Save"
                                                        >
                                                            <Check size={16} />
                                                        </button>
                                                        <button
                                                            onClick={handleCancelEdit}
                                                            className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                                                            title="Cancel"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <p className="text-slate-700 dark:text-slate-300">{comment.text}</p>
                                                )}
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
                                    <Button type="submit" variant="primary" loading={isCommenting}>Post</Button>
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

            {/* Delete Artifact Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Delete Artifact"
                size="sm"
            >
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 mb-6">
                        Are you sure you want to delete this artifact? This action cannot be undone.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            className="bg-red-600 hover:bg-red-700"
                            onClick={handleDelete}
                            loading={isDeleting}
                        >
                            Delete
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Delete Comment Confirmation Modal */}
            <Modal
                isOpen={isCommentDeleteModalOpen}
                onClose={() => setIsCommentDeleteModalOpen(false)}
                title="Delete Comment"
                size="sm"
            >
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 mb-6">
                        Are you sure you want to delete this comment?
                    </p>
                    <div className="flex gap-3 justify-center">
                        <Button variant="ghost" onClick={() => setIsCommentDeleteModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            className="bg-red-600 hover:bg-red-700"
                            onClick={handleConfirmDeleteComment}
                            loading={isDeletingComment}
                        >
                            Delete
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* General Alert Modal */}
            <Modal
                isOpen={alertModal.isOpen}
                onClose={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
                title={alertModal.title}
                size="sm"
            >
                <div>
                    <p className="text-slate-600 dark:text-slate-300 mb-6">
                        {alertModal.message}
                    </p>
                    <div className="flex justify-end">
                        <Button
                            variant="primary"
                            onClick={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
                        >
                            Close
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ArtifactDetailPage;
