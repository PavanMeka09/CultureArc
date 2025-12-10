import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Globe, LayoutDashboard, Bookmark, Library, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const ProfilePage = () => {
    const { user } = useAuth();
    const [myArtifacts, setMyArtifacts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyArtifacts = async () => {
            try {
                // Ideally this should be a dedicated endpoint /api/artifacts/my
                // For now, we fetch all and filter client-side or assume GET /api/artifacts returns enough info
                const { data } = await api.get('/artifacts');
                // Filter where artifact.user matches current user._id
                // Note: user._id might be string or object, data.user might be string
                const userArtifacts = data.filter(art => art.user === user._id || art.user?._id === user._id);
                setMyArtifacts(userArtifacts);
            } catch (error) {
                console.error("Failed to fetch artifacts", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchMyArtifacts();
        }
    }, [user]);

    if (!user) return null;

    return (
        <div className="flex flex-col flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
            {/* ProfileHeader */}
            <header className="flex flex-col md:flex-row gap-6 mb-8 items-center md:items-start">
                <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-24 w-24 ring-4 ring-white dark:ring-slate-800 shadow-lg bg-slate-200 flex items-center justify-center text-3xl font-bold text-slate-500">
                    {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col gap-2 text-center md:text-left">
                    <h1 className="text-slate-900 dark:text-white text-3xl font-bold leading-tight tracking-tight">{user.name}</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal max-w-md">{user.email}</p>
                    <p className="text-slate-400 dark:text-slate-500 text-sm">Member since {new Date(user.createdAt || Date.now()).toLocaleDateString()}</p>
                </div>
            </header>

            {/* Stats */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="flex flex-col gap-2 rounded-xl p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 shadow-sm">
                    <p className="text-slate-600 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">My Uploads</p>
                    <p className="text-slate-900 dark:text-white text-3xl font-bold leading-tight">{myArtifacts.length}</p>
                </div>
            </section>

            {/* Tabs */}
            <nav className="mb-6">
                <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-8">
                    <button className="flex items-center border-b-2 border-primary text-primary px-1 pb-4 text-sm font-bold tracking-wide">
                        My Artifacts
                    </button>
                </div>
            </nav>

            {/* ImageGrid */}
            {loading ? (
                <div className="text-center py-10">Loading...</div>
            ) : myArtifacts.length > 0 ? (
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myArtifacts.map((item, index) => (
                        <Link to={`/artifact/${item._id}`} key={item._id || index} className="flex flex-col gap-3 group">
                            <div className="w-full bg-center bg-no-repeat aspect-[3/4] bg-cover rounded-xl shadow-sm group-hover:shadow-md transition-all duration-300 bg-slate-100" style={{ backgroundImage: `url("${item.imageUrl}")` }}></div>
                            <div>
                                <p className="text-slate-900 dark:text-white text-base font-medium leading-normal group-hover:text-primary transition-colors">{item.title}</p>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal">{item.era}</p>
                            </div>
                        </Link>
                    ))}
                </section>
            ) : (
                <div className="text-center py-16 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                    <p className="text-slate-500 mb-4">You haven't uploaded any artifacts yet.</p>
                    <Link to="/upload">
                        <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                            Upload your first artifact
                        </button>
                    </Link>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
