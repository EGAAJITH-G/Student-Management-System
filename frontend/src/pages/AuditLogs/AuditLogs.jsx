import React, { useState, useEffect } from 'react';
import { History, ShieldAlert, Search, RefreshCw, User, Calendar, Trash2, Key, Info } from 'lucide-react';
import auditLogService from '../../services/auditLogService';
import Skeleton from '../../components/Skeleton/Skeleton';
import { toast } from 'react-toastify';
import styles from './AuditLogs.module.css';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const response = await auditLogService.getLogs();
      if (response.success) {
        setLogs(response.data);
        setFilteredLogs(response.data);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
      toast.error(err.response?.data?.error || 'Failed to retrieve system audit logs.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Filter logs locally based on search query and action dropdown
  useEffect(() => {
    let result = logs;

    if (actionFilter !== 'ALL') {
      result = result.filter(log => log.action === actionFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(log => 
        log.details.toLowerCase().includes(query) ||
        log.targetModel.toLowerCase().includes(query) ||
        (log.performedBy?.username && log.performedBy.username.toLowerCase().includes(query))
      );
    }

    setFilteredLogs(result);
  }, [searchQuery, actionFilter, logs]);

  const getActionBadgeClass = (action) => {
    switch (action) {
      case 'CREATE':
        return styles.badgeGreen;
      case 'UPDATE':
        return styles.badgeBlue;
      case 'DELETE':
        return styles.badgeRed;
      case 'LOGIN':
        return styles.badgePurple;
      case 'PASSWORD_RESET_REQUEST':
      case 'PASSWORD_RESET_SUCCESS':
        return styles.badgeOrange;
      default:
        return styles.badgeGrey;
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'CREATE':
        return <Info size={14} />;
      case 'UPDATE':
        return <Info size={14} />;
      case 'DELETE':
        return <Trash2 size={14} />;
      case 'LOGIN':
        return <User size={14} />;
      case 'PASSWORD_RESET_REQUEST':
      case 'PASSWORD_RESET_SUCCESS':
        return <Key size={14} />;
      default:
        return <Info size={14} />;
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Get unique actions for filter dropdown
  const uniqueActions = ['ALL', ...new Set(logs.map(log => log.action))];

  return (
    <div className={`${styles.container} fade-in`}>
      <header className={styles.header}>
        <div className={styles.welcomeText}>
          <div className={styles.badge}>
            <ShieldAlert className={styles.badgeIcon} />
            <span>Security Ledger</span>
          </div>
          <h1 className={styles.title}>System Audit Trail Ledger</h1>
          <p className={styles.subtitle}>
            Review system actions, user registrations, logins, record additions, modifications, and deletions.
          </p>
        </div>
        <button 
          onClick={fetchLogs} 
          className={styles.refreshBtn}
          title="Refresh Logs List"
          disabled={isLoading}
        >
          <RefreshCw className={`${styles.refreshIcon} ${isLoading ? styles.spinning : ''}`} />
          <span>Sync Logs</span>
        </button>
      </header>

      {/* Filter and Search Bar */}
      <section className={styles.filterSection}>
        <div className={styles.searchBar}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search logs by details, targets or performers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className={styles.selectFilter}
          title="Filter by Action"
        >
          {uniqueActions.map((action, idx) => (
            <option key={idx} value={action}>{action}</option>
          ))}
        </select>
      </section>

      {/* Logs Table Card */}
      <div className={styles.tableCard}>
        <div className={styles.tableResponsive}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Action</th>
                <th>Component / Target</th>
                <th>Performed By</th>
                <th>Activity Details</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array(6).fill(0).map((_, idx) => (
                  <tr key={idx} className={styles.skeletonRow}>
                    <td><Skeleton type="rect" style={{ width: '140px', height: '16px' }} /></td>
                    <td><Skeleton type="rect" style={{ width: '80px', height: '24px', borderRadius: '4px' }} /></td>
                    <td><Skeleton type="rect" style={{ width: '90px', height: '16px' }} /></td>
                    <td><Skeleton type="rect" style={{ width: '120px', height: '16px' }} /></td>
                    <td><Skeleton type="rect" style={{ width: '320px', height: '16px' }} /></td>
                  </tr>
                ))
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="5" className={styles.emptyContainer}>
                    <div className={styles.emptyState}>
                      <History className={styles.emptyIcon} />
                      <h3>No Audit Logs Found</h3>
                      <p>There are no recorded system actions matching your active filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log._id} className={styles.row}>
                    <td>
                      <div className={styles.dateCell}>
                        <Calendar size={13} className={styles.cellIcon} />
                        <span>{formatDateTime(log.timestamp)}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`${styles.actionBadge} ${getActionBadgeClass(log.action)}`}>
                        {getActionIcon(log.action)}
                        <span>{log.action}</span>
                      </span>
                    </td>
                    <td>
                      <span className={styles.targetBadge}>{log.targetModel}</span>
                    </td>
                    <td>
                      <div className={styles.userCell}>
                        <span className={styles.username}>{log.performedBy?.username || 'System'}</span>
                        {log.performedBy?.role && (
                          <span className={styles.userRoleBadge}>{log.performedBy.role}</span>
                        )}
                      </div>
                    </td>
                    <td className={styles.detailsCell}>
                      <span className={styles.detailsText} title={log.details}>
                        {log.details}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
