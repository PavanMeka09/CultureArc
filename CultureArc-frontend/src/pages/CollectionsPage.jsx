import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layers, Search, Settings, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api/axios';

const CollectionsPage = () => {
    const [collections, setCollections] = useState([]);

    useEffect(() => {
        const fetchCollections = async () => {
            try {
                const { data } = await api.get('/collections');
                setCollections(data);
            } catch (error) {
                console.error('Failed to fetch collections', error);
            }
        };

        fetchCollections();
    }, []);

    return (
        <div className="flex flex-col flex-1 py-10 px-6">
            {/* PageHeading */}
            <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
                <div className="flex flex-col gap-2">
                    <p className="text-slate-900 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">My Collections</p>
                    <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal">A curated archive of your saved cultural heritage.</p>
                </div>
                <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] gap-2 hover:bg-primary/90 transition-colors">
                    <Plus size={18} />
                    <span className="truncate">Create New Collection</span>
                </button>
            </div>
            {/* Chips */}
            <div className="flex gap-2 p-1 overflow-x-auto mb-8">
                <button className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-primary/20 text-primary px-4 shadow-sm">
                    <p className="text-sm font-medium leading-normal">All</p>
                </button>
                <button className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 text-slate-800 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    <p className="text-sm font-medium leading-normal">By Date</p>
                </button>
                <button className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 text-slate-800 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    <p className="text-sm font-medium leading-normal">By Region</p>
                </button>
                <button className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 text-slate-800 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    <p className="text-sm font-medium leading-normal">Recently Added</p>
                </button>
            </div>
            {/* ImageGrid */}
            <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-6">
                {collections.length > 0 ? (
                    collections.map((item) => (
                        <div key={item._id} className="flex flex-col gap-3 group cursor-pointer bg-white dark:bg-card-dark p-3 rounded-xl shadow-sm hover:shadow-md transition-all">
                            <div className="w-full bg-center bg-no-repeat aspect-[4/3] bg-cover rounded-lg overflow-hidden">
                                <div className="w-full h-full transition-transform duration-300 group-hover:scale-105" style={{ backgroundImage: `url("${item.imageUrl}")` }}></div>
                            </div>
                            <div>
                                <p className="text-slate-900 dark:text-white text-base font-bold leading-normal">{item.title}</p>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal">{item.artifacts ? item.artifacts.length : 0} Artifacts</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="px-4 text-slate-500">Loading collections/No collections found.</p>
                )}
            </div>
            {/* Pagination */}
            <div className="flex items-center justify-center p-4 mt-8">
                <a className="flex size-10 items-center justify-center text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors" href="#">
                    <ChevronLeft size={24} />
                </a>
                <a className="text-sm font-bold leading-normal tracking-[0.015em] flex size-10 items-center justify-center text-white rounded-full bg-primary shadow-sm" href="#">1</a>
                <a className="text-sm font-normal leading-normal flex size-10 items-center justify-center text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary rounded-full transition-colors" href="#">2</a>
                <a className="text-sm font-normal leading-normal flex size-10 items-center justify-center text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary rounded-full transition-colors" href="#">3</a>
                <span className="text-sm font-normal leading-normal flex size-10 items-center justify-center text-slate-500 dark:text-slate-500 rounded-full">...</span>
                <a className="text-sm font-normal leading-normal flex size-10 items-center justify-center text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary rounded-full transition-colors" href="#">8</a>
                <a className="flex size-10 items-center justify-center text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors" href="#">
                    <ChevronRight size={24} />
                </a>
            </div>
        </div>
    );
};

export default CollectionsPage;
