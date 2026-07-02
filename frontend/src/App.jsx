import React, { useEffect, useState } from 'react';
import { useDispatch, useStore } from 'react-redux';
import Sidebar from './components/Sidebar/Sidebar';
import Navbar from './components/Navbar/Navbar';
import AppRoutes from './routes';
import { useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import { initSocket, disconnectSocket } from './services/socket';
import Preloader from './components/Preloader/Preloader';
import './styles/global.css';

const App = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const dispatch = useDispatch();
  const store = useStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      initSocket(dispatch, store.getState);
    } else {
      disconnectSocket();
    }
    return () => {
      disconnectSocket();
    };
  }, [isAuthenticated, dispatch, store]);

  // Render glowing preloader on boot and verifying session tokens
  if (isLoading) {
    return <Preloader />;
  }



  return (
    <div className="app-layout" style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Conditionally render Left Sidebar */}
      {isAuthenticated && <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />}
      
      {/* Right Content Panel */}
      <div className="main-content" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Conditionally render Top Navbar */}
        {isAuthenticated && <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />}
        
        <main style={{ flexGrow: 1 }}>
          <AppRoutes />
        </main>
      </div>


      {/* Global Toast Notifications Container */}
      <ToastContainer 
        position="top-right" 
        autoClose={4000} 
        hideProgressBar={false} 
        newestOnTop 
        closeOnClick 
        rtl={false} 
        pauseOnFocusLoss 
        draggable 
        pauseOnHover 
        theme="light" 
      />
    </div>
  );
};

export default App;
