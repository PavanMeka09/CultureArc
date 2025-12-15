import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Trash2, Edit2, Users, Image, Layers, Shield, ShieldOff, Eye, AlertTriangle, Clock, Check, X } from 'lucide-react';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';

const AdminPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('stats');
    const [users, setUsers] = useState([]);
    const [artifacts, setArtifacts] = useState([]);
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);

    // User Edit Modal
    const [editingUser, setEditingUser] = useState(null);
    const [userEditForm, setUserEditForm] = useState({ name: '', email: '', isAdmin: false });
    const [isSavingUser, setIsSavingUser] = useState(false);

    // Delete Modals
    const [deleteUserModal, setDeleteUserModal] = useState({ isOpen: false, user: null });
    const [deleteArtifactModal, setDeleteArtifactModal] = useState({ isOpen: false, artifact: null });
    const [isDeleting, setIsDeleting] = useState(false);

    // Pending artifacts
    const [pendingArtifacts, setPendingArtifacts] = useState([]);
    const [pendingCount, setPendingCount] = useState(0);
    const [isApproving, setIsApproving] = useState(null);

    useEffect(() => {
        if (!user || !user.isAdmin) {
            navigate('/');
        }
    }, [user, navigate]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (activeTab === 'stats' || activeTab === 'users') {
                    const { data } = await api.get('/users');
                    setUsers(data);
                }
                if (activeTab === 'stats' || activeTab === 'artifacts') {
                    const { data } = await api.get('/artifacts?status=all&limit=100');
                    setArtifacts(data.artifacts || []);
                }
                if (activeTab === 'stats') {
                    const { data } = await api.get('/collections');
                    setCollections(data || []);
                    // Fetch pending count for stats
                    try {
                        const pendingRes = await api.get('/artifacts/pending-count');
                        setPendingCount(pendingRes.data.count || 0);
                    } catch (e) {
                        // Silent failure for pending count
                    }
                }
                if (activeTab === 'pending') {
                    const { data } = await api.get('/artifacts/pending');
                    setPendingArtifacts(data || []);
                }
            } catch (err) {
                console.error('Failed to fetch admin data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [activeTab]);

    const handleEditUser = (userItem) => {
        setEditingUser(userItem);
        setUserEditForm({
            name: userItem.name,
            email: userItem.email,
            isAdmin: userItem.isAdmin
        });
    };

    const handleSaveUser = async () => {
        setIsSavingUser(true);
        try {
            const { data } = await api.put(`/users/${editingUser._id}`, userEditForm);
            setUsers(users.map(u => u._id === editingUser._id ? { ...u, ...data } : u));
            setEditingUser(null);
        } catch (err) {
            console.error('Failed to update user', err);
        } finally {
            setIsSavingUser(false);
        }
    };

    const handleDeleteUser = async () => {
        setIsDeleting(true);
        try {
            await api.delete(`/users/${deleteUserModal.user._id}`);
            setUsers(users.filter(u => u._id !== deleteUserModal.user._id));
            setDeleteUserModal({ isOpen: false, user: null });
        } catch (err) {
            console.error('Failed to delete user', err);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteArtifact = async () => {
        setIsDeleting(true);
        try {
            await api.delete(`/artifacts/${deleteArtifactModal.artifact._id}`);
            setArtifacts(artifacts.filter(a => a._id !== deleteArtifactModal.artifact._id));
            setDeleteArtifactModal({ isOpen: false, artifact: null });
        } catch (err) {
            console.error('Failed to delete artifact', err);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleApproveArtifact = async (artifactId) => {
        setIsApproving(artifactId);
        try {
            await api.put(`/artifacts/${artifactId}/status`, { status: 'approved' });
            setPendingArtifacts(prev => prev.filter(a => a._id !== artifactId));
            setPendingCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Failed to approve artifact', err);
        } finally {
            setIsApproving(null);
        }
    };

    const handleRejectArtifact = async (artifactId) => {
        setIsApproving(artifactId);
        try {
            await api.put(`/artifacts/${artifactId}/status`, { status: 'rejected', reason: 'Rejected by admin' });
            setPendingArtifacts(prev => prev.filter(a => a._id !== artifactId));
            setPendingCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Failed to reject artifact', err);
        } finally {
            setIsApproving(null);
        }
    };

    const stats = [
        { label: 'Total Users', value: users.length, icon: Users, color: 'bg-blue-500' },
        { label: 'Total Artifacts', value: artifacts.length, icon: Image, color: 'bg-green-500' },
        { label: 'Collections', value: collections.length, icon: Layers, color: 'bg-purple-500' },
        { label: 'Pending Review', value: pendingCount, icon: Clock, color: 'bg-orange-500' },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-8">Admin Dashboard</h1>

            {/* Tabs */}
            <div className="flex space-x-4 mb-6 border-b border-gray-200 dark:border-gray-700">
                <button
                    className={`py-2 px-4 font-medium text-sm transition-colors ${activeTab === 'stats' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                    onClick={() => setActiveTab('stats')}
                >
                    Overview
                </button>
                <button
                    className={`py-2 px-4 font-medium text-sm transition-colors ${activeTab === 'users' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                    onClick={() => setActiveTab('users')}
                >
                    Users
                </button>
                <button
                    className={`py-2 px-4 font-medium text-sm transition-colors ${activeTab === 'artifacts' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                    onClick={() => setActiveTab('artifacts')}
                >
                    Artifacts
                </button>
                <button
                    className={`py-2 px-4 font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === 'pending' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                    onClick={() => setActiveTab('pending')}
                >
                    Pending
                    {pendingCount > 0 && (
                        <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">{pendingCount}</span>
                    )}
                </button>
            </div>

            {/* Stats Tab */}
            {activeTab === 'stats' && (
                <div className="space-y-8">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {stats.map((stat) => (
                            <div key={stat.label} className="bg-white dark:bg-card-dark rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-lg ${stat.color}`}>
                                        <stat.icon className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Recent Artifacts</h2>
                        <div className="space-y-3">
                            {artifacts.slice(0, 5).map(artifact => (
                                <Link
                                    key={artifact._id}
                                    to={`/artifact/${artifact._id}`}
                                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <div
                                        className="w-12 h-12 rounded-lg bg-cover bg-center"
                                        style={{ backgroundImage: `url("${artifact.imageUrl}")` }}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-slate-900 dark:text-white truncate">{artifact.title}</p>
                                        <p className="text-sm text-slate-500">{artifact.category} · {artifact.era}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
                <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                            <thead className="bg-slate-50 dark:bg-slate-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Joined</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-card-dark divide-y divide-slate-200 dark:divide-slate-700">
                                {users.map(userItem => (
                                    <tr key={userItem._id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                {userItem.avatar ? (
                                                    <img src={userItem.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
                                                ) : (
                                                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-bold">
                                                        {userItem.name?.charAt(0)?.toUpperCase()}
                                                    </div>
                                                )}
                                                <span className="font-medium text-slate-900 dark:text-white">{userItem.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{userItem.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {userItem.isAdmin ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                                                    <Shield size={12} /> Admin
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400">
                                                    User
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                            {new Date(userItem.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEditUser(userItem)}
                                                    className="p-1.5 text-slate-500 hover:text-primary transition-colors"
                                                    title="Edit user"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                {userItem._id !== user._id && (
                                                    <button
                                                        onClick={() => setDeleteUserModal({ isOpen: true, user: userItem })}
                                                        className="p-1.5 text-slate-500 hover:text-red-600 transition-colors"
                                                        title="Delete user"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Artifacts Tab */}
            {activeTab === 'artifacts' && (
                <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                            <thead className="bg-slate-50 dark:bg-slate-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Artifact</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Era</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Engagement</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-card-dark divide-y divide-slate-200 dark:divide-slate-700">
                                {artifacts.map(artifact => (
                                    <tr key={artifact._id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-12 h-12 rounded-lg bg-cover bg-center"
                                                    style={{ backgroundImage: `url("${artifact.imageUrl}")` }}
                                                />
                                                <span className="font-medium text-slate-900 dark:text-white">{artifact.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{artifact.category}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{artifact.era}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                            {artifact.likes?.length || 0} likes · {artifact.comments?.length || 0} comments
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    to={`/artifact/${artifact._id}`}
                                                    className="p-1.5 text-slate-500 hover:text-primary transition-colors"
                                                    title="View artifact"
                                                >
                                                    <Eye size={16} />
                                                </Link>
                                                <Link
                                                    to={`/edit-artifact/${artifact._id}`}
                                                    className="p-1.5 text-slate-500 hover:text-primary transition-colors"
                                                    title="Edit artifact"
                                                >
                                                    <Edit2 size={16} />
                                                </Link>
                                                <button
                                                    onClick={() => setDeleteArtifactModal({ isOpen: true, artifact })}
                                                    className="p-1.5 text-slate-500 hover:text-red-600 transition-colors"
                                                    title="Delete artifact"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Pending Artifacts Tab */}
            {activeTab === 'pending' && (
                <div className="space-y-4">
                    {pendingArtifacts.length === 0 ? (
                        <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-12 text-center">
                            <Clock className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                            <p className="text-slate-500 dark:text-slate-400">No pending artifacts to review</p>
                        </div>
                    ) : (
                        pendingArtifacts.map(artifact => (
                            <div key={artifact._id} className="bg-white dark:bg-card-dark rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                                <div className="flex gap-6">
                                    <div
                                        className="w-32 h-32 rounded-lg bg-cover bg-center shrink-0"
                                        style={{ backgroundImage: `url("${artifact.imageUrl}")` }}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{artifact.title}</h3>
                                                <p className="text-sm text-slate-500 mt-1">{artifact.category} · {artifact.era} · {artifact.region}</p>
                                                {artifact.user && (
                                                    <p className="text-sm text-slate-500 mt-1">
                                                        Submitted by: <span className="font-medium">{artifact.user.name}</span> ({artifact.user.email})
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex gap-2 shrink-0">
                                                <button
                                                    onClick={() => handleApproveArtifact(artifact._id)}
                                                    disabled={isApproving === artifact._id}
                                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                                                >
                                                    <Check size={16} />
                                                    {isApproving === artifact._id ? 'Approving...' : 'Approve'}
                                                </button>
                                                <button
                                                    onClick={() => handleRejectArtifact(artifact._id)}
                                                    disabled={isApproving === artifact._id}
                                                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                                                >
                                                    <X size={16} />
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-slate-600 dark:text-slate-300 mt-3 line-clamp-2">{artifact.description}</p>
                                        {artifact.aiReview && (
                                            <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                    AI Review: {artifact.aiReview.isAppropriate === true ? '✅ Appropriate' : artifact.aiReview.isAppropriate === false ? '❌ Inappropriate' : '⏳ Undetermined'}
                                                    {artifact.aiReview.confidence && ` (${Math.round(artifact.aiReview.confidence * 100)}% confidence)`}
                                                </p>
                                                {artifact.aiReview.reason && (
                                                    <p className="text-sm text-slate-500 mt-1">{artifact.aiReview.reason}</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Edit User Modal */}
            <Modal
                isOpen={!!editingUser}
                onClose={() => setEditingUser(null)}
                title="Edit User"
                size="md"
            >
                <div className="space-y-4">
                    <Input
                        label="Name"
                        value={userEditForm.name}
                        onChange={(e) => setUserEditForm({ ...userEditForm, name: e.target.value })}
                    />
                    <Input
                        label="Email"
                        type="email"
                        value={userEditForm.email}
                        onChange={(e) => setUserEditForm({ ...userEditForm, email: e.target.value })}
                    />
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                        <button
                            onClick={() => setUserEditForm({ ...userEditForm, isAdmin: !userEditForm.isAdmin })}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${userEditForm.isAdmin ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}
                        >
                            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${userEditForm.isAdmin ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                        <div className="flex items-center gap-2">
                            {userEditForm.isAdmin ? <Shield size={16} className="text-amber-500" /> : <ShieldOff size={16} className="text-slate-400" />}
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                {userEditForm.isAdmin ? 'Admin privileges enabled' : 'Regular user'}
                            </span>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="ghost" onClick={() => setEditingUser(null)}>Cancel</Button>
                        <Button variant="primary" onClick={handleSaveUser} loading={isSavingUser}>Save Changes</Button>
                    </div>
                </div>
            </Modal>

            {/* Delete User Modal */}
            <Modal
                isOpen={deleteUserModal.isOpen}
                onClose={() => setDeleteUserModal({ isOpen: false, user: null })}
                title="Delete User"
                size="sm"
            >
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 mb-2">
                        Are you sure you want to delete <strong>{deleteUserModal.user?.name}</strong>?
                    </p>
                    <p className="text-sm text-slate-500 mb-6">This will also remove all their artifacts and collections.</p>
                    <div className="flex gap-3 justify-center">
                        <Button variant="ghost" onClick={() => setDeleteUserModal({ isOpen: false, user: null })}>Cancel</Button>
                        <Button variant="primary" className="bg-red-600 hover:bg-red-700" onClick={handleDeleteUser} loading={isDeleting}>Delete</Button>
                    </div>
                </div>
            </Modal>

            {/* Delete Artifact Modal */}
            <Modal
                isOpen={deleteArtifactModal.isOpen}
                onClose={() => setDeleteArtifactModal({ isOpen: false, artifact: null })}
                title="Delete Artifact"
                size="sm"
            >
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 mb-6">
                        Are you sure you want to delete "<strong>{deleteArtifactModal.artifact?.title}</strong>"?
                    </p>
                    <div className="flex gap-3 justify-center">
                        <Button variant="ghost" onClick={() => setDeleteArtifactModal({ isOpen: false, artifact: null })}>Cancel</Button>
                        <Button variant="primary" className="bg-red-600 hover:bg-red-700" onClick={handleDeleteArtifact} loading={isDeleting}>Delete</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default AdminPage;
