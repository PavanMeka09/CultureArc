import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';

const CollectionsPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createForm, setCreateForm] = useState({ title: '', description: '', imageUrl: '' });
    const [isCreating, setIsCreating] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    useEffect(() => {
        const fetchCollections = async () => {
            setLoading(true);
            try {
                // Since this page is now protected and backend only returns user's collections,
                // we can just call /collections
                const { data } = await api.get('/collections');
                setCollections(data);
            } catch (error) {
                console.error('Failed to fetch collections', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCollections();
    }, [user]);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('image', file);

        setUploadingImage(true);
        try {
            const { data } = await api.post('/upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setCreateForm(prev => ({ ...prev, imageUrl: data.image }));
        } catch (err) {
            console.error('Image upload failed', err);
        } finally {
            setUploadingImage(false);
        }
    };

    const handleCreateCollection = async () => {
        if (!createForm.title.trim()) return;
        setIsCreating(true);
        const payload = { ...createForm };
        if (!payload.imageUrl) delete payload.imageUrl;

        try {
            const { data } = await api.post('/collections', payload);
            setCollections(prev => [data, ...prev]);
            setIsCreateModalOpen(false);
            setCreateForm({ title: '', description: '', imageUrl: '' });
            navigate(`/collection/${data._id}`);
        } catch (error) {
            console.error('Failed to create collection', error);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="flex flex-col flex-1 py-10 px-6">
            {/* PageHeading */}
            <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
                <div className="flex flex-col gap-2">
                    <p className="text-slate-900 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">My Collections</p>
                    <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal">Manage your curated archives of cultural heritage artifacts.</p>
                </div>
                {user && (
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] gap-2 hover:bg-primary/90 transition-colors"
                    >
                        <Plus size={18} />
                        <span className="truncate">Create New Collection</span>
                    </button>
                )}
            </div>

            {/* Collections Grid */}
            {loading ? (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="flex flex-col gap-3 bg-white dark:bg-card-dark p-3 rounded-xl shadow-sm animate-pulse">
                            <div className="w-full aspect-[4/3] bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
                            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            ) : collections.length > 0 ? (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-6">
                    {collections.map((item) => (
                        <Link
                            to={`/collection/${item._id}`}
                            key={item._id}
                            className="flex flex-col gap-3 group cursor-pointer bg-white dark:bg-card-dark p-3 rounded-xl shadow-sm hover:shadow-md transition-all"
                        >
                            <div className="w-full bg-center bg-no-repeat aspect-[4/3] bg-cover rounded-lg overflow-hidden">
                                <div className="w-full h-full transition-transform duration-300 group-hover:scale-105" style={{ backgroundImage: `url("${item.imageUrl}")` }}></div>
                            </div>
                            <div>
                                <p className="text-slate-900 dark:text-white text-base font-bold leading-normal">{item.title}</p>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal">{item.artifacts?.length || 0} Artifacts</p>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                    <p className="text-slate-500 mb-4">
                        You haven't created any collections yet.
                    </p>
                    {user && (
                        <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
                            Create your first collection
                        </Button>
                    )}
                </div>
            )}

            {/* Create Collection Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setCreateForm({ title: '', description: '', imageUrl: '' });
                }}
                title="Create New Collection"
                size="md"
            >
                <div className="space-y-4">
                    {/* Cover Image Upload */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative w-full">
                            {createForm.imageUrl ? (
                                <div
                                    className="w-full h-32 rounded-lg bg-cover bg-center"
                                    style={{ backgroundImage: `url("${createForm.imageUrl}")` }}
                                />
                            ) : (
                                <div className="w-full h-32 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                    <ImageIcon size={32} className="text-slate-400" />
                                </div>
                            )}
                            <label className={`absolute bottom-2 right-2 px-3 py-1.5 rounded-lg bg-primary text-white text-sm cursor-pointer hover:bg-primary/90 transition-colors ${uploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                {uploadingImage ? 'Uploading...' : 'Upload Cover'}
                                <input
                                    type="file"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    accept="image/*"
                                    disabled={uploadingImage}
                                />
                            </label>
                        </div>
                    </div>

                    <Input
                        label="Collection Title"
                        value={createForm.title}
                        onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                        placeholder="e.g., Ancient Egyptian Artifacts"
                        required
                    />
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            Description
                        </label>
                        <textarea
                            value={createForm.description}
                            onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                            placeholder="Describe your collection..."
                            className="block w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-background-dark text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary/50 text-base p-3 min-h-[100px] placeholder:text-slate-400"
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleCreateCollection}
                            loading={isCreating}
                            disabled={!createForm.title.trim()}
                        >
                            Create Collection
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default CollectionsPage;
