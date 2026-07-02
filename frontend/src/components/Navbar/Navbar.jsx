import React from 'react';
import { Menu, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from './Navbar.module.css';

const Navbar = ({ onToggleSidebar }) => {
  const { user, isAuthenticated } = useAuth();
  
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const getInitials = (name) => {
    if (!name) return 'AD';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.welcomeGreeting}>
          {isAuthenticated && (
            <button 
              className={styles.hamburgerBtn} 
              onClick={onToggleSidebar}
              aria-label="Toggle Sidebar"
            >
              <Menu size={20} />
            </button>
          )}
          <span className={styles.greetingTitle}>System Control Console</span>
        </div>

        {isAuthenticated && (
          <div className={styles.metaArea}>
            <div className={styles.dateBadge}>
              <Calendar className={styles.calendarIcon} />
              <span>{currentDate}</span>
            </div>
            
            <div className={styles.avatar} title={`Logged in as ${user?.username}`}>
              <span>{getInitials(user?.username)}</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
