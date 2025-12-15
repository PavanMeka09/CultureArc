import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, X, Filter } from 'lucide-react';
import api from '../api/axios';
import { ArtifactGridSkeleton } from '../components/common/Skeleton';
import Button from '../components/common/Button';

const ExplorePage = () => {
    const [artifacts, setArtifacts] = useState([]);
    const [keyword, setKeyword] = useState('');
    const [category, setCategory] = useState('');
    const [era, setEra] = useState('');
    const [region, setRegion] = useState('');
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);

    const hasActiveFilters = keyword || category || era || region;

    const clearFilters = () => {
        setKeyword('');
        setCategory('');
        setEra('');
        setRegion('');
    };

    // Debounce search to avoid too many requests
    useEffect(() => {
        const fetchArtifacts = async () => {
            if (page === 1) setIsLoading(true);
            const params = {
                keyword,
                category,
                era,
                region,
                page,
            };

            try {
                const { data } = await api.get('/artifacts', { params });
                if (page === 1) {
                    setArtifacts(data.artifacts || []);
                } else {
                    setArtifacts(prev => [...prev, ...(data.artifacts || [])]);
                }
                setPages(data.pages || 1);
            } catch (error) {
                console.error('Failed to fetch artifacts', error);
            } finally {
                setIsLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchArtifacts();
        }, 500); // 500ms debounce

        return () => clearTimeout(timeoutId);
    }, [keyword, category, era, region, page]);

    useEffect(() => {
        setPage(1);
    }, [keyword, category, era, region]);

    return (
        <div className="flex flex-col flex-1 py-10">
            {/* PageHeading */}
            <div className="flex flex-wrap justify-between gap-3 p-4">
                <div className="flex min-w-72 flex-col gap-3">
                    <p className="text-slate-900 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">Explore Artifacts</p>
                    <p className="text-gray-500 dark:text-gray-400 text-base font-normal leading-normal">Discover cultural heritage from around the world.</p>
                </div>
            </div>
            {/* SearchBar & Filters */}
            <div className="flex flex-col md:flex-row items-center gap-4 px-4 py-3">
                {/* SearchBar */}
                <div className="w-full flex-grow">
                    <label className="flex flex-col w-full h-12">
                        <div className="flex w-full flex-1 items-stretch rounded-lg h-full bg-white dark:bg-background-dark shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 transition-all focus-within:ring-2 focus-within:ring-primary/50">
                            <div className="text-gray-500 dark:text-gray-400 flex items-center justify-center pl-4">
                                <Search size={20} />
                            </div>
                            <input
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-lg text-slate-900 dark:text-white focus:outline-0 border-none bg-transparent h-full placeholder:text-gray-500 dark:placeholder:text-gray-400 px-4 pl-2 text-base font-normal leading-normal"
                                placeholder="Search artifacts, cultures, materials..."
                            />
                        </div>
                    </label>
                </div>
                {/* Filters */}
                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-900 dark:text-gray-300 text-sm font-medium leading-normal cursor-pointer appearance-none outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        <option value="">All Categories</option>
                        <option value="Pottery">Pottery</option>
                        <option value="Sculpture">Sculpture</option>
                        <option value="Art">Art</option>
                        <option value="Jewelry">Jewelry</option>
                        <option value="Tool">Tool</option>
                        <option value="Writing">Writing</option>
                        <option value="Monument">Monument</option>
                    </select>
                    <select
                        value={era}
                        onChange={(e) => setEra(e.target.value)}
                        className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-900 dark:text-gray-300 text-sm font-medium leading-normal cursor-pointer appearance-none outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        <option value="">All Eras</option>
                        <option value="Ancient">Ancient</option>
                        <option value="Medieval">Medieval</option>
                        <option value="Renaissance">Renaissance</option>
                        <option value="Modern">Modern</option>
                        <option value="Contemporary">Contemporary</option>
                    </select>
                    <select
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-900 dark:text-gray-300 text-sm font-medium leading-normal cursor-pointer appearance-none outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        <option value="">All Regions</option>
                        <option value="Asia">Asia</option>
                        <option value="Europe">Europe</option>
                        <option value="Africa">Africa</option>
                        <option value="Americas">Americas</option>
                        <option value="Middle East">Middle East</option>
                        <option value="Oceania">Oceania</option>
                    </select>
                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            className="gap-1 text-slate-500 hover:text-red-500"
                        >
                            <X size={16} />
                            Clear
                        </Button>
                    )}
                </div>
            </div>
            {/* ImageGrid */}
            {isLoading ? (
                <ArtifactGridSkeleton count={8} />
            ) : artifacts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
                    {artifacts.map((item) => (
                        <div key={item._id} className="group relative overflow-hidden rounded-xl bg-white dark:bg-card-dark shadow-sm hover:shadow-md transition-all">
                            <Link to={`/artifact/${item._id}`}>
                                <div className="bg-cover bg-center flex flex-col justify-end aspect-[3/4] transition-transform duration-300 ease-in-out group-hover:scale-105" style={{ backgroundImage: `url("${item.imageUrl}")` }}>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out"></div>
                                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-300 ease-in-out">
                                        <p className="text-white text-lg font-bold leading-tight line-clamp-2">{item.title}</p>
                                        <p className="text-gray-300 text-sm mt-1">{item.era}</p>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <p className="text-slate-500 dark:text-slate-400">No artifacts found. Try a different search.</p>
                </div>
            )}
            {/* Pagination/Load More Button */}
            {page < pages && (
                <div className="flex justify-center p-4 mt-8">
                    <button
                        onClick={() => setPage(prev => prev + 1)}
                        className="flex min-w-[120px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-primary/10 text-primary dark:bg-primary/20 dark:text-accent text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors"
                    >
                        <span className="truncate">Load More</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default ExplorePage;
