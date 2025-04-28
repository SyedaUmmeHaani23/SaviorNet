import React from 'react';
import { Route, Switch } from 'wouter';
import Sidebar from './dashboard/Sidebar';
import Home from '@/pages/Home';
import AIPredictionsPage from '@/pages/AIPredictionsPage';
import RescueTeamsPage from '@/pages/RescueTeamsPage';
import VictimsPage from '@/pages/VictimsPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import SettingsPage from '@/pages/SettingsPage';

const Dashboard: React.FC = () => {
  return (
    <div className="flex">
      <Sidebar />
      
      <main className="ml-64 flex-1 p-8 bg-gray-100 min-h-screen">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/predictions" component={AIPredictionsPage} />
          <Route path="/rescue-teams" component={RescueTeamsPage} />
          <Route path="/victims" component={VictimsPage} />
          <Route path="/analytics" component={AnalyticsPage} />
          <Route path="/settings" component={SettingsPage} />
        </Switch>
      </main>
    </div>
  );
};

export default Dashboard;
