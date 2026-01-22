import { useState } from 'react';
import Header from '../components/Header'
import TabSwitcher from '../components/TabSwitcher'
import SearchBar from '../components/SearchBar'
import VIPSection from '../components/VipSection'
import AllListingsSection from '../components/AllListingsSection';
import BottomNav from '../components/BottomNav';

const Index = () => {
  const [activeTab, setActiveTab] = useState<'gallery' | 'map'>('gallery');

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto">
      <Header />
      <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />
      <SearchBar />
      
      {activeTab === 'gallery' ? (
        <>
          <VIPSection />
          <AllListingsSection />
        </>
      ) : (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          <p>Xarita ko'rinishi</p>
        </div>
      )}
      
      <BottomNav />
    </div>
  );
};

export default Index;
