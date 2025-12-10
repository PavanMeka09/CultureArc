import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import PageTransition from './PageTransition';

const Layout = ({ children }) => {
    return (
        <div className="relative flex min-h-screen w-full flex-col group/design-root overflow-x-hidden bg-background-light dark:bg-background-dark font-display text-text-light dark:text-text-dark transition-colors duration-300">
            <div className="layout-container flex h-full grow flex-col">
                <div className="flex flex-1 justify-center">
                    <div className="layout-content-container flex flex-col w-full max-w-6xl flex-1 px-4 sm:px-6 lg:px-8">
                        <Header />
                        <main className="flex flex-col flex-1 w-full">
                            <PageTransition>
                                {children || <Outlet />}
                            </PageTransition>
                        </main>
                        <Footer />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Layout;
