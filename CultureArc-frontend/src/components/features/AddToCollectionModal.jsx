import React, { useState, useEffect } from 'react';
import { X, Plus, FolderPlus } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const AddToCollectionModal = ({ isOpen, onClose, artifactId }) => {
    const { user } = useAuth();
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(false);
    const [view, setView] = useState('list'); // 'list' or 'create'
    const [newCollectionTitle, setNewCollectionTitle] = useState('');
    const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: '' }

    useEffect(() => {
        if (isOpen && user) {
            fetchCollections();
            setView('list');
            setMessage(null);
        }
    }, [isOpen, user]);

    const fetchCollections = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/collections/my');
            setCollections(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCollection = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/collections', {
                title: newCollectionTitle,
                description: 'Created via Add to Collection',
                imageUrl: '' // Use default
            });
            await fetchCollections();
            setView('list');
            setMessage({ type: 'success', text: 'Collection created successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to create collection.' });
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCollection = async (collectionId) => {
        try {
            await api.post(`/collections/${collectionId}/artifacts`, { artifactId });
            setMessage({ type: 'success', text: 'Added to collection!' });
            setTimeout(() => {
                onClose();
            }, 1000);
        } catch (error) {
            if (error.response?.status === 400) {
                setMessage({ type: 'error', text: 'Artifact already in this collection.' });
            } else {
                setMessage({ type: 'error', text: 'Failed to add to collection.' });
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-card-dark rounded-xl shadow-xl w-full max-w-md overflow-hidden relative">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {view === 'create' ? 'New Collection' : 'Save to Collection'}
                    </h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4">
                    {message && (
                        <div className={`p-3 rounded-lg text-sm mb-4 ${message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                            {message.text}
                        </div>
                    )}

                    {view === 'list' ? (
                        <div className="space-y-3">
                            {loading ? (
                                <p className="text-center text-slate-500 py-4">Loading collections...</p>
                            ) : collections.length > 0 ? (
                                <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                                    {collections.map(col => (
                                        <button
                                            key={col._id}
                                            onClick={() => handleAddToCollection(col._id)}
                                            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left group"
                                        >
                                            <div className="h-10 w-10 rounded bg-slate-200 bg-cover bg-center shrink-0" style={{ backgroundImage: `url(${col.imageUrl})` }}></div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-slate-900 dark:text-slate-100 truncate">{col.title}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{col.artifacts?.length || 0} items</p>
                                            </div>
                                            <Plus size={18} className="text-slate-400 group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all" />
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-slate-500">
                                    <FolderPlus size={32} className="mx-auto mb-2 opacity-50" />
                                    <p>No collections yet.</p>
                                </div>
                            )}

                            <Button
                                variant="secondary"
                                className="w-full justify-center mt-2 border-dashed"
                                onClick={() => setView('create')}
                                icon={Plus}
                            >
                                Create New Collection
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleCreateCollection} className="space-y-4">
                            <Input
                                label="Collection Name"
                                placeholder="e.g. Ancient Pottery"
                                value={newCollectionTitle}
                                onChange={(e) => setNewCollectionTitle(e.target.value)}
                                autoFocus
                                required
                            />
                            <div className="flex gap-2 justify-end pt-2">
                                <Button variant="ghost" type="button" onClick={() => setView('list')}>Back</Button>
                                <Button variant="primary" type="submit" disabled={!newCollectionTitle.trim() || loading}>
                                    Create Collection
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddToCollectionModal;
