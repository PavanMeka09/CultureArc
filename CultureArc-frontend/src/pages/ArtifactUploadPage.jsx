import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Image as ImageIcon, ShieldCheck, ShieldAlert, Check, Loader2 } from 'lucide-react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import api from '../api/axios';

const ArtifactUploadPage = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // Get ID if editing
    const [formData, setFormData] = useState({
        title: '',
        imageUrl: '',
        description: '',
        category: '',
        era: '',
        region: ''
    });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [isFetching, setIsFetching] = useState(!!id);
    const [error, setError] = useState('');

    // AI Review State
    const [aiReview, setAiReview] = useState({
        status: 'idle', // idle, success, error
        score: null,
        feedback: '',
        isAuthentic: false
    });

    useEffect(() => {
        if (id) {
            const fetchArtifact = async () => {
                setIsFetching(true);
                try {
                    const { data } = await api.get(`/artifacts/${id}`);
                    setFormData({
                        title: data.title,
                        imageUrl: data.imageUrl,
                        description: data.description,
                        category: data.category,
                        era: data.era,
                        region: data.region
                    });
                    // For editing, we might assume it's already verified or require re-verification if changed.
                    // For simplicity, let's assume editing doesn't require re-verification unless critical fields change, 
                    // but the prompt implies a general flow. Let's force verification for new edits if we want to be strict,
                    // or just let it be. The prompt says "when user clicks submit artifact data should go for ai review".
                    // Let's reset verification on edit load to be safe.
                    setAiReview({ status: 'idle', score: null, feedback: '', isAuthentic: false });
                } catch (err) {
                    console.error(err);
                    setError('Failed to fetch artifact details');
                } finally {
                    setIsFetching(false);
                }
            };
            fetchArtifact();
        }
    }, [id]);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
        // Reset verification if user changes details
        if (aiReview.status !== 'idle') {
            setAiReview({ status: 'idle', score: null, feedback: '', isAuthentic: false });
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('image', file);

        setUploading(true);
        // Reset verification on new image
        setAiReview({ status: 'idle', score: null, feedback: '', isAuthentic: false });

        try {
            const { data } = await api.post('/upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setFormData(prev => ({ ...prev, imageUrl: data.image }));
        } catch (err) {
            console.error('File upload failed', err);
            setError('File upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleVerify = async () => {
        if (!formData.title || !formData.imageUrl || !formData.description) {
            setError('Please fill in all required fields and upload an image before verification.');
            return;
        }

        setVerifying(true);
        setError('');

        try {
            const { data } = await api.post('/ai/analyze', formData);

            setAiReview({
                status: data.isAuthentic ? 'success' : 'error',
                score: data.authenticityScore,
                feedback: data.feedback,
                isAuthentic: data.isAuthentic
            });

        } catch (err) {
            console.error('Verification failed', err);
            setError('AI Verification failed. Please try again.');
        } finally {
            setVerifying(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!aiReview.isAuthentic) {
            setError('Artifact must be verified as authentic before submission.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            if (id) {
                await api.put(`/artifacts/${id}`, formData);
            } else {
                await api.post('/artifacts', formData);
            }
            navigate(id ? `/artifact/${id}` : '/explore');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to save artifact');
        } finally {
            setLoading(false);
        }
    };

    if (isFetching) {
        return (
            <div className="flex flex-col flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-500 dark:text-slate-400">Loading artifact details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8">
            {/* PageHeading */}
            <div className="flex flex-col gap-2 mb-8 text-center sm:text-left">
                <h1 className="text-slate-900 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">{id ? 'Edit Artifact' : 'Upload New Artifact'}</h1>
                <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal max-w-2xl">{id ? 'Update the details of your artifact.' : 'Add a new item to the digital archive. Please provide as much detail as possible to help researchers and enthusiasts.'}</p>
            </div>

            {/* Main Card */}
            <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-6 sm:p-8 space-y-8">

                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Image Upload */}
                        <div className="space-y-4">
                            <h2 className="text-slate-900 dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em] pb-3 border-b border-slate-200 dark:border-slate-800">Artifact Image</h2>
                            <div className="flex flex-col gap-4">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Image Source</label>

                                {/* File Drop Logic */}
                                <div className="flex items-center gap-4">
                                    <label className={`cursor-pointer inline-flex items-center justify-center px-4 py-2 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                        <ImageIcon className="mr-2 h-5 w-5 text-slate-500" />
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                            {uploading ? 'Uploading...' : 'Choose File to Upload'}
                                        </span>
                                        <input
                                            type="file"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            accept="image/*"
                                            disabled={uploading}
                                        />
                                    </label>
                                    <span className="text-xs text-slate-500">supports JPG, PNG</span>
                                </div>

                                {formData.imageUrl && (
                                    <div className="mt-2 relative w-full h-48 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                                        <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-contain" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Artifact Details */}
                        <div>
                            <h2 className="text-slate-900 dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em] pb-3 border-b border-slate-200 dark:border-slate-800 mb-6">Artifact Details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <Input
                                        label="Artifact Title"
                                        id="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        placeholder="e.g., Roman Marble Bust"
                                        required
                                    />
                                </div>
                                <div>
                                    <Input
                                        label="Era / Period"
                                        id="era"
                                        value={formData.era}
                                        onChange={handleChange}
                                        placeholder="e.g., Circa 150 AD"
                                        required
                                    />
                                </div>
                                <div>
                                    <Input
                                        label="Region of Origin"
                                        id="region"
                                        value={formData.region}
                                        onChange={handleChange}
                                        placeholder="e.g., Rome, Italy"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="category">Category</label>
                                    <div className="relative">
                                        <select
                                            id="category"
                                            value={formData.category}
                                            onChange={handleChange}
                                            required
                                            className="block w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-background-dark text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary/50 text-base py-2.5 px-4 appearance-none"
                                        >
                                            <option value="">Select a category</option>
                                            <option value="Pottery">Pottery</option>
                                            <option value="Sculpture">Sculpture</option>
                                            <option value="Art">Art</option>
                                            <option value="Jewelry">Jewelry</option>
                                            <option value="Tool">Tool</option>
                                            <option value="Writing">Writing/Manuscript</option>
                                            <option value="Monument">Monument</option>
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="description">Description</label>
                                    <textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        required
                                        className="block w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-background-dark text-slate-900 dark:text-white shadow-sm focus:border-primary focus:ring-primary/50 text-base p-4 min-h-[120px] placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                        placeholder="Provide a detailed description of the artifact, including its history, materials, and significance."
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        {/* AI Verification Section */}
                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-full ${aiReview.status === 'success' ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' : aiReview.status === 'error' ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 'bg-primary/10 text-primary'}`}>
                                    {aiReview.status === 'success' ? <ShieldCheck size={24} /> : aiReview.status === 'error' ? <ShieldAlert size={24} /> : <ShieldCheck size={24} />}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Authenticity Verification</h3>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                                        Before submission, our AI system analyzes the artifact details and image to verify its authenticity and historical accuracy.
                                    </p>

                                    {aiReview.status === 'idle' && (
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={handleVerify}
                                            disabled={verifying || uploading || !formData.imageUrl}
                                            className="w-full sm:w-auto"
                                        >
                                            {verifying ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Verifying...
                                                </>
                                            ) : 'Verify Authenticity'}
                                        </Button>
                                    )}

                                    {aiReview.status !== 'idle' && (
                                        <div className={`mt-4 p-4 rounded-lg ${aiReview.isAuthentic ? 'bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800'}`}>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className={`font-bold ${aiReview.isAuthentic ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                                                    {aiReview.isAuthentic ? 'Authenticity Verified' : 'Verification Failed'}
                                                </span>
                                                <span className="text-sm font-semibold text-slate-500">Score: {aiReview.score}/100</span>
                                            </div>
                                            <p className="text-sm text-slate-700 dark:text-slate-300">{aiReview.feedback}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer with CTA */}
                        <div className="px-6 py-5 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 -mx-6 -mb-8 sm:-mx-8 sm:-mb-8 rounded-b-xl">
                            <Button variant="ghost" type="button" onClick={() => navigate(-1)}>Cancel</Button>
                            {aiReview.isAuthentic && (
                                <Button variant="primary" type="submit" disabled={loading}>
                                    {loading ? 'Saving...' : (id ? 'Update Artifact' : 'Submit Artifact')}
                                </Button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ArtifactUploadPage;
