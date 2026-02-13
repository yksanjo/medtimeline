import { useState } from 'react';
import { Navigation } from './components/Navigation';
import { PatientHeader } from './components/PatientHeader';
import { Timeline } from './components/Timeline';
import { LabTrends } from './components/LabTrends';
import { Medications } from './components/Medications';

function App() {
  const [activeTab, setActiveTab] = useState('timeline');
  
  const renderContent = () => {
    switch (activeTab) {
      case 'timeline':
        return <Timeline />;
      case 'labs':
        return <LabTrends />;
      case 'medications':
        return <Medications />;
      default:
        return <Timeline />;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        
        <main className="flex-1 min-w-0">
          <PatientHeader />
          
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Page Title */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                {activeTab === 'timeline' && 'Health Timeline'}
                {activeTab === 'labs' && 'Lab Trends'}
                {activeTab === 'medications' && 'Medications'}
              </h1>
              <p className="text-gray-600 mt-1">
                {activeTab === 'timeline' && 'View your complete health history in chronological order'}
                {activeTab === 'labs' && 'Track your lab results over time'}
                {activeTab === 'medications' && 'Manage your current and past medications'}
              </p>
            </div>
            
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
