import { AppStateProvider } from './app/context/AppStateContext.jsx';
import { AppView } from './app/AppView.jsx';
import { CustomizationProvider } from './customization/CustomizationContext.jsx';
import { ThemeProvider } from './ui/ThemeContext.jsx';

function App() {
  return (
    <ThemeProvider>
      <CustomizationProvider>
        <AppStateProvider>
          <AppView />
        </AppStateProvider>
      </CustomizationProvider>
    </ThemeProvider>
  );
}

export default App;
