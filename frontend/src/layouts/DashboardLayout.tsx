import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { MobileBottomNav } from '../components/layout/MobileBottomNav';

const DashboardLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-dark">
      {/* Sidebar Navigation */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Header */}
        <Header onMenuClick={() => setIsSidebarOpen(true)} />

        {/* Dynamic Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-10 pb-24 lg:pb-10 custom-scrollbar">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mx-auto max-w-7xl h-full"
          >
            <Outlet />
          </motion.div>
        </main>

        <MobileBottomNav />

        {/* Background Decorative Blobs */}
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] pointer-events-none rounded-full animate-blob" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-secondary/10 blur-[100px] pointer-events-none rounded-full animate-blob-delay" />
      </div>
    </div>
  );
};

export default DashboardLayout;
