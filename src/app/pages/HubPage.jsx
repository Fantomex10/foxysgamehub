import { useState } from 'react';
import HubMenu from '../../components/HubMenu.jsx';
import CustomizationPanel from '../../components/CustomizationPanel.jsx';
import { AppLayout } from '../components/AppLayout.jsx';
import { APP_PHASES } from '../constants.js';
import { useAppState } from '../context/useAppState.js';

export const HubPage = () => {
  const { setAppPhase } = useAppState();
  const [isCustomizationOpen, setCustomizationOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);

  const contentStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '24px',
    justifyContent: 'center',
    alignItems: 'flex-start',
    width: '100%',
  };

  const openCustomization = () => {
    setCustomizationOpen(true);
    setActiveCategory(null);
  };

  const closeCustomization = () => {
    setCustomizationOpen(false);
    setActiveCategory(null);
  };

  const handleSelectCategory = (categoryId) => {
    setActiveCategory(categoryId);
  };

  const handleBackToRoot = () => {
    setActiveCategory(null);
  };

  return (
    <AppLayout breadcrumbs="Main menu" contentLayout="centered" forceProfileButton>
      <div style={contentStyle}>
        <HubMenu
          onPlayWithFriends={() => setAppPhase(APP_PHASES.JOIN)}
          onCreate={() => setAppPhase(APP_PHASES.CREATE)}
          onJoin={() => setAppPhase(APP_PHASES.JOIN)}
          onCustomize={openCustomization}
        />
      </div>
      <CustomizationPanel
        isOpen={isCustomizationOpen}
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
        onBackToRoot={handleBackToRoot}
        onClose={closeCustomization}
      />
    </AppLayout>
  );
};
