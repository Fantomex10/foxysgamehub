import { AppStateProvider } from './app/context/AppStateContext.jsx';
import { AppView } from './app/AppView.jsx';
import { CustomizationProvider } from './customization/CustomizationContext.jsx';
import { ThemeProvider } from './ui/ThemeContext.jsx';
import { ServiceConfigProvider } from './app/context/ServiceConfigContext.jsx';
import { PhotonProvider } from './app/context/PhotonContext.jsx';
import { SessionProvider } from './app/context/SessionContext.jsx';

function App() {
  return (
    <ThemeProvider>
      <CustomizationProvider>
        <ServiceConfigProvider>
          <PhotonProvider>
            <SessionProvider>
              <AppStateProvider>
                <AppView />
              </AppStateProvider>
            </SessionProvider>
          </PhotonProvider>
        </ServiceConfigProvider>
      </CustomizationProvider>
    </ThemeProvider>
  );
}

export default App;
