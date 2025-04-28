import React from 'react';
import { Route, Switch } from 'wouter';
import Header from './mobile/Header';
import AlertBanner from './mobile/AlertBanner';
import SOSButton from './mobile/SOSButton';
import MapSection from './mobile/MapSection';
import BottomNavigation from './mobile/BottomNavigation';
import AlertsPage from '@/pages/AlertsPage';
import ProfilePage from '@/pages/ProfilePage';
import { useDisaster } from '@/context/DisasterContext';

const MobileApp: React.FC = () => {
  const { activeAlerts, shelters, sendSOS } = useDisaster();

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 pb-16">
      <Header />
      
      <Switch>
        <Route path="/" exact>
          <>
            {activeAlerts.length > 0 && <AlertBanner alert={activeAlerts[0]} />}
            
            <div className="p-5 flex flex-col items-center">
              <SOSButton onSOS={sendSOS} />
            </div>
            
            <MapSection shelters={shelters} />
          </>
        </Route>
        
        <Route path="/alerts" component={AlertsPage} />
        <Route path="/profile" component={ProfilePage} />
      </Switch>
      
      <BottomNavigation />
    </div>
  );
};

export default MobileApp;
