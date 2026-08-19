import React from 'react';
import AppNavigator from './src/Navigation/AppNavigator';

import { LanguageProvider } from './src/Context/LanguageContext';

const App = () => {
  return (
    <LanguageProvider>
      <AppNavigator />
    </LanguageProvider>
  );
};

export default App;
