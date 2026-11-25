import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { LatticeBackground } from '../components/LatticeBackground';

export const AppLayout = () => {
  return (
    <LatticeBackground>
      <div className="min-h-screen flex flex-col justify-between">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <Outlet />
        </main>
        <Footer />
      </div>
    </LatticeBackground>
  );
};

