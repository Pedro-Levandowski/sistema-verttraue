
import { AuthProvider } from './contexts/AuthContext';
import Index from './pages/Index';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Index />
    </AuthProvider>
  );
}

export default App;
