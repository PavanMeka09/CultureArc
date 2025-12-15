import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Upload, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import { ArtifactGridSkeleton } from '../components/common/Skeleton';

const ProfilePage = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('uploads');
    const [myArtifacts, setMyArtifacts] = useState([]);
    const [likedArtifacts, setLikedArtifacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (activeTab === 'uploads') {
                    const { data } = await api.get('/artifacts?limit=100');
                    const userArtifacts = (data.artifacts || []).filter(
                        art => art.user === user._id || art.user?._id === user._id
                    );
                    setMyArtifacts(userArtifacts);
                } else {
                    const { data } = await api.get('/users/liked');
                    setLikedArtifacts(data);
                }
            } catch (error) {
                console.error('Failed to fetch data', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchData();
        }
    }, [user, activeTab]);



    const handleChangePassword = async () => {
        setPasswordError('');
        setPasswordSuccess('');

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordError('New passwords do not match');
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            setPasswordError('Password must be at least 6 characters');
            return;
        }

        setIsChangingPassword(true);
        try {
            await api.put('/users/password', {
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            });
            setPasswordSuccess('Password updated successfully!');
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setTimeout(() => {
                setIsPasswordModalOpen(false);
                setPasswordSuccess('');
            }, 1500);
        } catch (error) {
            setPasswordError(error.response?.data?.message || 'Failed to change password');
        } finally {
            setIsChangingPassword(false);
        }
    };

    if (!user) return null;

    const currentArtifacts = activeTab === 'uploads' ? myArtifacts : likedArtifacts;

    return (
        <div className="flex flex-col flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
            {/* Profile Header */}
            <header className="flex flex-col md:flex-row gap-6 mb-8 items-center md:items-start">
                <div className="relative group">
                    {user.avatar ? (
                        <img
                            src={user.avatar}
                            alt={user.name}
                            className="h-24 w-24 rounded-full object-cover ring-4 ring-white dark:ring-slate-800 shadow-lg"
                        />
                    ) : (
                        <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-24 w-24 ring-4 ring-white dark:ring-slate-800 shadow-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-3xl font-bold text-white">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
                <div className="flex flex-col gap-2 text-center md:text-left flex-1">
                    <div className="flex flex-col md:flex-row md:items-center gap-3">
                        <h1 className="text-slate-900 dark:text-white text-3xl font-bold leading-tight tracking-tight">
                            {user.name}
                        </h1>
                        <div className="flex gap-2">

                            <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1"
                                onClick={() => setIsPasswordModalOpen(true)}
                            >
                                Change Password
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Stats */}
            <section className="grid grid-cols-2 sm:grid-cols-2 gap-4 mb-8">
                <div className="flex flex-col gap-2 rounded-xl p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 shadow-sm">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Upload size={18} />
                        <p className="text-sm font-medium uppercase tracking-wider">My Uploads</p>
                    </div>
                    <p className="text-slate-900 dark:text-white text-3xl font-bold leading-tight">
                        {myArtifacts.length}
                    </p>
                </div>
                <div className="flex flex-col gap-2 rounded-xl p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 shadow-sm">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Heart size={18} />
                        <p className="text-sm font-medium uppercase tracking-wider">Liked</p>
                    </div>
                    <p className="text-slate-900 dark:text-white text-3xl font-bold leading-tight">
                        {likedArtifacts.length}
                    </p>
                </div>
            </section>

            {/* Tabs */}
            <nav className="mb-6">
                <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-8">
                    <button
                        onClick={() => setActiveTab('uploads')}
                        className={`flex items-center gap-2 px-1 pb-4 text-sm font-bold tracking-wide border-b-2 transition-colors ${activeTab === 'uploads'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                    >
                        <Upload size={18} />
                        My Artifacts
                    </button>
                    <button
                        onClick={() => setActiveTab('liked')}
                        className={`flex items-center gap-2 px-1 pb-4 text-sm font-bold tracking-wide border-b-2 transition-colors ${activeTab === 'liked'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                    >
                        <Heart size={18} />
                        Liked Artifacts
                    </button>
                </div>
            </nav>

            {/* Artifacts Grid */}
            {loading ? (
                <ArtifactGridSkeleton count={6} />
            ) : currentArtifacts.length > 0 ? (
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentArtifacts.map((item) => (
                        <Link
                            to={`/artifact/${item._id}`}
                            key={item._id}
                            className="flex flex-col gap-3 group"
                        >
                            <div
                                className="w-full bg-center bg-no-repeat aspect-[3/4] bg-cover rounded-xl shadow-sm group-hover:shadow-md transition-all duration-300 bg-slate-100"
                                style={{ backgroundImage: `url("${item.imageUrl}")` }}
                            />
                            <div>
                                <p className="text-slate-900 dark:text-white text-base font-medium leading-normal group-hover:text-primary transition-colors">
                                    {item.title}
                                </p>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal">
                                    {item.era}
                                </p>
                            </div>
                        </Link>
                    ))}
                </section>
            ) : (
                <div className="text-center py-16 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                    {activeTab === 'uploads' ? (
                        <>
                            <p className="text-slate-500 mb-4">You haven't uploaded any artifacts yet.</p>
                            <Link to="/upload">
                                <Button variant="primary">Upload your first artifact</Button>
                            </Link>
                        </>
                    ) : (
                        <p className="text-slate-500">You haven't liked any artifacts yet. Explore and find artifacts you love!</p>
                    )}
                </div>
            )}



            {/* Change Password Modal */}
            <Modal
                isOpen={isPasswordModalOpen}
                onClose={() => {
                    setIsPasswordModalOpen(false);
                    setPasswordError('');
                    setPasswordSuccess('');
                    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
                title="Change Password"
                size="md"
            >
                <div className="space-y-4">
                    {passwordError && (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
                            {passwordError}
                        </div>
                    )}
                    {passwordSuccess && (
                        <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-3 rounded-lg text-sm">
                            {passwordSuccess}
                        </div>
                    )}
                    <div className="relative">
                        <Input
                            label="Current Password"
                            type={showCurrentPassword ? 'text' : 'password'}
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                            placeholder="Enter current password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-9 text-slate-500 hover:text-slate-700"
                        >
                            {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    <div className="relative">
                        <Input
                            label="New Password"
                            type={showNewPassword ? 'text' : 'password'}
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                            placeholder="Enter new password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-9 text-slate-500 hover:text-slate-700"
                        >
                            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    <Input
                        label="Confirm New Password"
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        placeholder="Confirm new password"
                    />
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="ghost" onClick={() => setIsPasswordModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handleChangePassword} loading={isChangingPassword}>
                            Update Password
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ProfilePage;
