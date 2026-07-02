import React, { useState } from 'react';
import { Edit, Trash2, Mail, Phone, Calendar, BookOpen, AlertTriangle, ShieldAlert, Inbox } from 'lucide-react';
import Skeleton from '../Skeleton/Skeleton';
import styles from './StudentTable.module.css';

const StudentTable = ({ students, onEdit, onDelete, isLoading, userRole }) => {
  const [deleteTarget, setDeleteTarget] = useState(null);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleDeleteClick = (student) => {
    setDeleteTarget(student);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      onDelete(deleteTarget._id);
      setDeleteTarget(null);
    }
  };

  const cancelDelete = () => {
    setDeleteTarget(null);
  };

  // Skeleton rows for the loading state
  const SkeletonRow = () => (
    <tr className={styles.skeletonRow}>
      <td><Skeleton type="rect" className={styles.skeletonText} style={{ width: '130px', height: '16px' }} /></td>
      <td><Skeleton type="rect" className={styles.skeletonText} style={{ width: '180px', height: '16px' }} /></td>
      <td><Skeleton type="rect" className={styles.skeletonText} style={{ width: '150px', height: '16px' }} /></td>
      <td><Skeleton type="rect" className={styles.skeletonText} style={{ width: '100px', height: '16px' }} /></td>
      <td><Skeleton type="rect" className={styles.skeletonText} style={{ width: '90px', height: '16px' }} /></td>
      {userRole !== 'student' && (
        <td>
          <div className={styles.skeletonActions}>
            <Skeleton type="rect" className={styles.skeletonBtn} style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
            {userRole === 'admin' && <Skeleton type="rect" className={styles.skeletonBtn} style={{ width: '32px', height: '32px', borderRadius: '8px' }} />}
          </div>
        </td>
      )}
    </tr>
  );


  return (
    <div className={styles.wrapper}>
      {/* Custom Overlay Delete Modal */}
      {deleteTarget && (
        <div className={styles.modalOverlay} onClick={cancelDelete}>
          <div className={`${styles.modalContent} scale-in`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalIconBadge}>
                <ShieldAlert className={styles.modalIcon} />
              </div>
              <h3 className={styles.modalTitle}>Confirm Deletion</h3>
            </div>
            
            <p className={styles.modalText}>
              Are you sure you want to delete <strong className={styles.highlight}>{deleteTarget.name}</strong>? 
              This action is permanent and cannot be reversed.
            </p>

            <div className={styles.modalDetails}>
              <div className={styles.detailRow}>
                <Mail className={styles.detailIcon} /> <span>{deleteTarget.email}</span>
              </div>
              <div className={styles.detailRow}>
                <BookOpen className={styles.detailIcon} /> <span>{deleteTarget.course}</span>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button onClick={cancelDelete} className={styles.modalBtnCancel}>
                Cancel
              </button>
              <button onClick={confirmDelete} className={styles.modalBtnDelete}>
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Table Card */}
      <div className={styles.tableCard}>
        <div className={styles.tableResponsive}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Email Address</th>
                <th>Course / Department</th>
                <th>Phone Number</th>
                <th>Registration Date</th>
                {userRole !== 'student' && <th className={styles.actionsHeader}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                // Render 5 skeleton loaders if loading
                Array(5).fill(0).map((_, idx) => <SkeletonRow key={idx} />)
              ) : students.length === 0 ? (
                // Beautiful Empty State inside Table Body
                <tr>
                  <td colSpan={userRole === 'student' ? '5' : '6'} className={styles.emptyContainer}>
                    <div className={`${styles.emptyState} fade-in`}>
                      <div className={styles.emptyIconWrapper}>
                        <Inbox className={styles.emptyIcon} />
                      </div>
                      <h3>No Student Records Found</h3>
                      <p>There are no students matching your request. Try registering a new student on the dashboard or adjust your filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                // Data Rows
                students.map((student) => (
                  <tr key={student._id} className={styles.row}>
                    <td>
                      <div className={styles.studentCell}>
                        <div className={styles.initialBadge}>
                          {student.profileImage ? (
                            <img src={student.profileImage} alt={student.name} className={styles.avatarImg} />
                          ) : (
                            student.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <span className={styles.studentName}>{student.name}</span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.emailCell}>
                        <Mail className={styles.cellIcon} />
                        <span>{student.email}</span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.badgeCourse}>
                        <span>{student.course}</span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.phoneCell}>
                        <Phone className={styles.cellIcon} />
                        <span>{student.phone}</span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.dateCell}>
                        <Calendar className={styles.cellIcon} />
                        <span>{formatDate(student.createdAt)}</span>
                      </div>
                    </td>
                    {userRole !== 'student' && (
                      <td className={styles.actionsCell}>
                        <div className={styles.actionButtons}>
                          <button
                            onClick={() => onEdit(student)}
                            className={styles.btnEdit}
                            title="Edit Profile"
                          >
                            <Edit className={styles.btnIcon} />
                          </button>
                          {userRole === 'admin' && (
                            <button
                              onClick={() => handleDeleteClick(student)}
                              className={styles.btnDelete}
                              title="Delete Student"
                            >
                              <Trash2 className={styles.btnIcon} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
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

export default StudentTable;
