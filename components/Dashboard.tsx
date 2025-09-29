
import React from 'react';
import { Feature } from '../types';
import AiAssistant from './features/AiAssistant';
import Summarizer from './features/Summarizer';
import TestGenerator from './features/TestGenerator';
import StudyPlanner from './features/StudyPlanner';
import ResearchAssistant from './features/ResearchAssistant';

interface DashboardProps {
  activeFeature: Feature;
}

const featureComponents: Record<Feature, React.ComponentType> = {
  'ai-assistant': AiAssistant,
  'summarizer': Summarizer,
  'test-generator': TestGenerator,
  'study-planner': StudyPlanner,
  'research-assistant': ResearchAssistant,
};

const Dashboard: React.FC<DashboardProps> = ({ activeFeature }) => {
  const ActiveComponent = featureComponents[activeFeature];
  return <ActiveComponent />;
};

export default Dashboard;
