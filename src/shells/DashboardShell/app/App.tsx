import { OrchestratorProvider } from './providers/OrchestratorProvider';
import { AuthProvider }         from './providers/AuthProvider';
import { ThemeProvider }        from './providers/ThemeProvider';
import { ActionBarProvider }    from '../../../app/components/ActionBarContext';

export default function App() {
  return (
    <OrchestratorProvider>
      <AuthProvider>
        <ThemeProvider>
          <ActionBarProvider>
            <div>Dashboard cargado correctamente</div>
          </ActionBarProvider>
        </ThemeProvider>
      </AuthProvider>
    </OrchestratorProvider>
  );
}
