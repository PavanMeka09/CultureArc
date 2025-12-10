import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Search } from 'lucide-react';
import api from '../api/axios';

const HomePage = () => {
    const [collections, setCollections] = useState([]);

    useEffect(() => {
        const fetchCollections = async () => {
            try {
                const { data } = await api.get('/collections');
                // Display only first 6 collections if there are many
                setCollections(data.slice(0, 6));
            } catch (error) {
                console.error('Failed to fetch collections', error);
            }
        };

        fetchCollections();
    }, []);

    return (
        <div className="flex flex-col flex-1">
            {/* HeroSection */}
            <div className="py-24 sm:py-32 flex flex-col items-center justify-center text-center">
                <div className="flex flex-col gap-4 max-w-2xl">
                    <h1 className="text-text-light dark:text-white text-4xl font-black leading-tight tracking-tighter sm:text-5xl lg:text-6xl">
                        The Archive of Our Shared Story
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 text-base font-normal leading-relaxed sm:text-lg">
                        A platform dedicated to preserving and discovering the world's cultural heritage.
                    </p>
                </div>
            </div>
            {/* SearchBar */}
            <div className="px-4 pb-16 -mt-16 sm:-mt-20">
                <div className="max-w-2xl mx-auto">
                    <label className="flex flex-col w-full">
                        <div className="relative flex w-full flex-1 items-stretch rounded-lg h-14 bg-white dark:bg-background-dark shadow-sm transition-all duration-300 focus-within:shadow-soft-glow focus-within:ring-2 focus-within:ring-primary/50">
                            <div className="text-slate-400 dark:text-slate-500 flex items-center justify-center pl-4">
                                <Search size={20} />
                            </div>
                            <input className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-text-light dark:text-text-dark focus:outline-0 focus:ring-0 border-none bg-transparent h-full placeholder:text-slate-400 dark:placeholder:text-slate-500 px-4 pl-2 text-base font-normal leading-normal" placeholder="Search for artifacts, regions, or eras..." />
                        </div>
                    </label>
                </div>
            </div>
            {/* SectionHeader */}
            <div className="pt-16 pb-4">
                <h2 className="text-text-light dark:text-white text-2xl sm:text-3xl font-bold tracking-tight px-4">Featured Collections</h2>
            </div>
            {/* ImageGrid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
                {collections.length > 0 ? (
                    collections.map((collection) => (
                        <div key={collection._id} className="bg-cover bg-center flex flex-col rounded-lg justify-end p-4 aspect-[4/5] group transition-all duration-300 hover:shadow-xl hover:-translate-y-1" style={{ backgroundImage: `linear-gradient(0deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0) 40%), url("${collection.imageUrl}")` }}>
                            <p className="text-white text-lg font-bold w-full line-clamp-2 transform-gpu transition-transform duration-300 group-hover:translate-y-[-8px]">{collection.title}</p>
                        </div>
                    ))
                ) : (
                    // Fallback if no collections / loading
                    <p className="px-4 text-slate-500">Loading collections...</p>
                )}
            </div>
        </div>
    );
};

export default HomePage;
