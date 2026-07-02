import React from 'react';
import { NavLink } from 'react-router-dom';
import { GraduationCap, LayoutDashboard, BarChart3, LogOut, ClipboardList, Award, X, History } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from './Sidebar.module.css';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  const getInitials = (name) => {
    if (!name) return 'AD';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      <div 
        className={`${styles.backdrop} ${isOpen ? styles.backdropOpen : ''}`} 
        onClick={onClose} 
      />

      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
        {/* Close Button for mobile */}
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close Sidebar">
          <X size={18} />
        </button>

        {/* Brand Branding Logo */}
        <div className={styles.brand}>
          <div className={styles.logoIconWrapper}>
            <GraduationCap className={styles.logoIcon} />
          </div>
          <div className={styles.brandText}>
            <span className={styles.brandTitle}>EduPortal</span>
            <span className={styles.brandSubtitle}>Admin Console</span>
          </div>
        </div>

        {/* Nav Menu Links */}
        <nav className={styles.menu}>
          <span className={styles.menuLabel}>Main Navigation</span>
          
          <NavLink 
            to="/" 
            onClick={onClose}
            className={({ isActive }) => 
              isActive ? `${styles.menuItem} ${styles.active}` : styles.menuItem
            }
          >
            <LayoutDashboard className={styles.menuIcon} />
            <span>Overview</span>
          </NavLink>

          <NavLink 
            to="/analytics" 
            onClick={onClose}
            className={({ isActive }) => 
              isActive ? `${styles.menuItem} ${styles.active}` : styles.menuItem
            }
          >
            <BarChart3 className={styles.menuIcon} />
            <span>Analytics</span>
          </NavLink>

          <NavLink 
            to="/attendance" 
            onClick={onClose}
            className={({ isActive }) => 
              isActive ? `${styles.menuItem} ${styles.active}` : styles.menuItem
            }
          >
            <ClipboardList className={styles.menuIcon} />
            <span>Attendance</span>
          </NavLink>

          <NavLink 
            to="/marks" 
            onClick={onClose}
            className={({ isActive }) => 
              isActive ? `${styles.menuItem} ${styles.active}` : styles.menuItem
            }
          >
            <Award className={styles.menuIcon} />
            <span>Results</span>
          </NavLink>

          {/* Admin Audit Logs Navigation Link */}
          {user?.role === 'admin' && (
            <NavLink 
              to="/audit-logs" 
              onClick={onClose}
              className={({ isActive }) => 
                isActive ? `${styles.menuItem} ${styles.active}` : styles.menuItem
              }
            >
              <History className={styles.menuIcon} />
              <span>Audit Logs</span>
            </NavLink>
          )}
        </nav>

        {/* User Info & Logout Quick Actions */}
        <div className={styles.footer}>
          <div className={styles.userInfo} title={`Logged in as ${user?.username}`}>
            <div className={styles.avatar}>
              <span>{getInitials(user?.username)}</span>
            </div>
            <div className={styles.userDetails}>
              <span className={styles.userName}>{user?.username || 'Admin'}</span>
              <span className={styles.userRole}>
                {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Administrator'}
              </span>
            </div>
          </div>

          <button onClick={() => { logout(); onClose(); }} className={styles.btnLogout} title="Logout Session">
            <LogOut className={styles.logoutIcon} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
