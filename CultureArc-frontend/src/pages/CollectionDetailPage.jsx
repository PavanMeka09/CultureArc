import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Edit2, Trash2, ArrowLeft, AlertTriangle, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import { ArtifactGridSkeleton } from '../components/common/Skeleton';

const CollectionDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [collection, setCollection] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editForm, setEditForm] = useState({ title: '', description: '' });
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [removingArtifactId, setRemovingArtifactId] = useState(null);

    useEffect(() => {
        const fetchCollection = async () => {
            setLoading(true);
            try {
                const { data } = await api.get(`/collections/${id}`);
                setCollection(data);
                setEditForm({ title: data.title, description: data.description });
            } catch (error) {
                console.error('Failed to fetch collection', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchCollection();
        }
    }, [id]);

    const handleSaveEdit = async () => {
        setIsSaving(true);
        try {
            const { data } = await api.put(`/collections/${id}`, editForm);
            setCollection(prev => ({ ...prev, ...data }));
            setIsEditModalOpen(false);
        } catch (error) {
            console.error('Failed to update collection', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await api.delete(`/collections/${id}`);
            navigate('/collections');
        } catch (error) {
            console.error('Failed to delete collection', error);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleRemoveArtifact = async (artifactId) => {
        setRemovingArtifactId(artifactId);
        try {
            await api.delete(`/collections/${id}/artifacts/${artifactId}`);
            setCollection(prev => ({
                ...prev,
                artifacts: prev.artifacts.filter(a => a._id !== artifactId)
            }));
        } catch (error) {
            console.error('Failed to remove artifact', error);
        } finally {
            setRemovingArtifactId(null);
        }
    };

    const isOwner = user && collection && (collection.user === user._id || collection.user?._id === user._id || user.isAdmin);

    if (loading) {
        return (
            <div className="flex flex-col flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
                <div className="animate-pulse">
                    <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/3 mb-4"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3 mb-8"></div>
                    <ArtifactGridSkeleton count={6} />
                </div>
            </div>
        );
    }

    if (!collection) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <p className="text-slate-500">Collection not found</p>
                <Link to="/collections" className="mt-4 text-primary hover:underline">
                    Back to Collections
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
            {/* Back Button */}
            <Link
                to="/collections"
                className="flex items-center gap-2 text-slate-500 hover:text-primary mb-6 transition-colors"
            >
                <ArrowLeft size={18} />
                <span>Back to Collections</span>
            </Link>

            {/* Collection Header */}
            <header className="mb-8">
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                    {collection.imageUrl && (
                        <div
                            className="w-full md:w-48 h-32 md:h-32 rounded-xl bg-cover bg-center shrink-0"
                            style={{ backgroundImage: `url("${collection.imageUrl}")` }}
                        />
                    )}
                    <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                                {collection.title}
                            </h1>
                            {isOwner && (
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="gap-1"
                                        onClick={() => setIsEditModalOpen(true)}
                                    >
                                        <Edit2 size={16} />
                                        Edit
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="gap-1 text-red-600 hover:text-red-700"
                                        onClick={() => setIsDeleteModalOpen(true)}
                                    >
                                        <Trash2 size={16} />
                                        Delete
                                    </Button>
                                </div>
                            )}
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 mb-2">
                            {collection.description}
                        </p>
                        <p className="text-sm text-slate-500">
                            {collection.artifacts?.length || 0} artifacts
                        </p>
                    </div>
                </div>
            </header>

            {/* Artifacts Grid */}
            {collection.artifacts?.length > 0 ? (
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {collection.artifacts.map((artifact) => (
                        <div key={artifact._id} className="relative group">
                            <Link
                                to={`/artifact/${artifact._id}`}
                                className="flex flex-col gap-3"
                            >
                                <div
                                    className="w-full bg-center bg-no-repeat aspect-[3/4] bg-cover rounded-xl shadow-sm group-hover:shadow-md transition-all duration-300 bg-slate-100"
                                    style={{ backgroundImage: `url("${artifact.imageUrl}")` }}
                                />
                                <div>
                                    <p className="text-slate-900 dark:text-white text-base font-medium leading-normal group-hover:text-primary transition-colors">
                                        {artifact.title}
                                    </p>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal">
                                        {artifact.era}
                                    </p>
                                </div>
                            </Link>
                            {isOwner && (
                                <button
                                    onClick={() => handleRemoveArtifact(artifact._id)}
                                    disabled={removingArtifactId === artifact._id}
                                    className="absolute top-2 right-2 p-2 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 hover:bg-red-700 transition-all disabled:opacity-50"
                                    title="Remove from collection"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    ))}
                </section>
            ) : (
                <div className="text-center py-16 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                    <p className="text-slate-500 mb-4">This collection is empty.</p>
                    <Link to="/explore">
                        <Button variant="primary">Explore Artifacts</Button>
                    </Link>
                </div>
            )}

            {/* Edit Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Collection"
                size="md"
            >
                <div className="space-y-4">
                    <Input
                        label="Title"
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        placeholder="Collection title"
                    />
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            Description
                        </label>
                        <textarea
                            value={editForm.description}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            placeholder="Collection description..."
                            className="block w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-background-dark text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary/50 text-base p-3 min-h-[100px] placeholder:text-slate-400"
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handleSaveEdit} loading={isSaving}>
                            Save Changes
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Delete Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Delete Collection"
                size="sm"
            >
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 mb-6">
                        Are you sure you want to delete this collection? This action cannot be undone.
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
        </div>
    );
};

export default CollectionDetailPage;
