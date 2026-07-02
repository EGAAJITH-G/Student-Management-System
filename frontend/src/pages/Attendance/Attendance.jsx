import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  Calendar, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  Sparkles, 
  Search,
  BookOpen,
  Mail,
  User,
  Save,
  RefreshCw,
  FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import studentService from '../../services/studentService';
import attendanceService from '../../services/attendanceService';
import pdfGenerator from '../../utils/pdfGenerator';
import { toast } from 'react-toastify';
import styles from './Attendance.module.css';

const Attendance = () => {
  const { user } = useAuth();
  
  // Tab control ('mark' or 'report')
  const [activeTab, setActiveTab] = useState('mark');
  
  // Date and loading states
  const [targetDate, setTargetDate] = useState(new Date().toISOString().slice(0, 10));
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  
  // Roster lists for daily marking
  const [roster, setRoster] = useState([]);
  
  // Query parameters for monthly report
  const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1);
  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  const [monthlyReport, setMonthlyReport] = useState([]);

  // Lock students out of 'mark' tab automatically
  useEffect(() => {
    if (user?.role === 'student') {
      setActiveTab('report');
    }
  }, [user]);

  // Fetch student roster and daily attendance logs
  const loadDailyRoster = async () => {
    setIsDataLoading(true);
    try {
      // 1. Fetch all active students
      const studentsResponse = await studentService.getStudents();
      
      // 2. Fetch existing daily logs (if marked)
      const dailyResponse = await attendanceService.getDailyAttendance(targetDate);
      
      if (studentsResponse.success && dailyResponse.success) {
        const markedLogs = dailyResponse.data;
        
        // Merge enrollees with existing logs
        const merged = studentsResponse.data.map(student => {
          const log = markedLogs.find(l => l.student?._id === student._id);
          return {
            _id: student._id,
            name: student.name,
            email: student.email,
            course: student.course,
            profileImage: student.profileImage,
            status: log ? log.status : 'Present' // Default to Present if not marked
          };
        });
        
        setRoster(merged);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load daily attendance roster.');
    } finally {
      setIsDataLoading(false);
    }
  };

  // Fetch monthly aggregated report
  const loadMonthlyReport = async () => {
    setIsDataLoading(true);
    try {
      const response = await attendanceService.getMonthlyReport(reportMonth, reportYear);
      if (response.success) {
        setMonthlyReport(response.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load monthly attendance sheets.');
    } finally {
      setIsDataLoading(false);
    }
  };

  // Auto-reload data when dates or tabs change
  useEffect(() => {
    if (activeTab === 'mark' && user?.role !== 'student') {
      loadDailyRoster();
    } else if (activeTab === 'report') {
      loadMonthlyReport();
    }
  }, [targetDate, activeTab, reportMonth, reportYear]);

  // Handle status toggle for a student (Present <-> Absent)
  const handleStatusToggle = (studentId, newStatus) => {
    setRoster(prev => 
      prev.map(item => 
        item._id === studentId ? { ...item, status: newStatus } : item
      )
    );
  };

  // Submit Daily Attendance Register
  const handleSaveAttendance = async () => {
    setIsSubmitLoading(true);
    try {
      const records = roster.map(s => ({
        studentId: s._id,
        status: s.status
      }));
      
      const response = await attendanceService.saveAttendance(targetDate, records);
      if (response.success) {
        toast.success(`Successfully saved attendance logs for ${new Date(targetDate).toLocaleDateString()}!`);
        loadDailyRoster();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'An error occurred while saving.');
    } finally {
      setIsSubmitLoading(false);
    }
  };

  // Client-side student profile view filters: Student role can only see their own row
  const displayReport = user?.role === 'student'
    ? monthlyReport.filter(item => item.student?.email?.toLowerCase() === user.email?.toLowerCase())
    : monthlyReport;

  const handleExportPDF = () => {
    if (displayReport.length === 0) {
      toast.error('No attendance records available to export.');
      return;
    }
    
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthName = months[parseInt(reportMonth, 10) - 1] || 'Month';
    
    try {
      pdfGenerator.generateAttendanceReport(
        monthName,
        reportYear,
        displayReport,
        user?.role === 'student'
      );
      toast.success('Attendance report exported to PDF successfully!');
    } catch (err) {
      toast.error('Failed to generate attendance report PDF.');
    }
  };

  return (
    <div className={`${styles.container} fade-in`}>
      {/* Title Header */}
      <header className={styles.header}>
        <div className={styles.welcomeText}>
          <div className={styles.badge}>
            <Sparkles className={styles.badgeIcon} />
            <span>Operational Console</span>
          </div>
          <h1 className={styles.title}>Student Attendance Registry</h1>
          <p className={styles.subtitle}>
            Register daily present/absent sheets, track department attendances, and audit institutional reports.
          </p>
        </div>
      </header>

      {/* Tabs Switcher Layout */}
      <div className={styles.tabsContainer}>
        <div className={styles.tabsList}>
          {user?.role !== 'student' && (
            <button
              onClick={() => setActiveTab('mark')}
              className={`${styles.tabBtn} ${activeTab === 'mark' ? styles.tabActive : ''}`}
            >
              <ClipboardList size={16} />
              <span>Daily Register</span>
            </button>
          )}
          <button
            onClick={() => setActiveTab('report')}
            className={`${styles.tabBtn} ${activeTab === 'report' ? styles.tabActive : ''}`}
          >
            <TrendingUp size={16} />
            <span>Monthly Reports</span>
          </button>
        </div>

        {/* Date / Month Selectors based on active tab */}
        <div className={styles.selectorsArea}>
          {activeTab === 'mark' && user?.role !== 'student' && (
            <div className={styles.datePickerGroup}>
              <Calendar size={16} className={styles.pickerIcon} />
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className={styles.datePickerInput}
                disabled={isDataLoading}
              />
            </div>
          )}

          {activeTab === 'report' && (
            <div className={styles.monthSelectors}>
              <select
                value={reportMonth}
                onChange={(e) => setReportMonth(e.target.value)}
                className={styles.selectBox}
                disabled={isDataLoading}
              >
                <option value="1">January</option>
                <option value="2">February</option>
                <option value="3">March</option>
                <option value="4">April</option>
                <option value="5">May</option>
                <option value="6">June</option>
                <option value="7">July</option>
                <option value="8">August</option>
                <option value="9">September</option>
                <option value="10">October</option>
                <option value="11">November</option>
                <option value="12">December</option>
              </select>

              <input
                type="number"
                value={reportYear}
                onChange={(e) => setReportYear(e.target.value)}
                className={styles.yearInput}
                placeholder="Year"
                disabled={isDataLoading}
              />

              <button 
                onClick={loadMonthlyReport}
                className={styles.refreshBtn}
                disabled={isDataLoading}
                title="Sync Records"
              >
                <RefreshCw size={14} className={isDataLoading ? styles.spinning : ''} />
              </button>

              <button 
                onClick={handleExportPDF}
                className={styles.pdfBtn}
                disabled={isDataLoading || displayReport.length === 0}
                title="Export report to PDF"
              >
                <FileText size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Roster & Report Display Cards */}
      <div className={styles.contentCard}>
        {isDataLoading ? (
          <div className={styles.loaderArea}>
            <div className={styles.spinner} />
            <span>Synchronizing Cohort Records...</span>
          </div>
        ) : activeTab === 'mark' && user?.role !== 'student' ? (
          // Daily Mark Attendance Layout
          <div className={styles.tableResponsive}>
            {roster.length === 0 ? (
              <div className={styles.emptyContainer}>
                <User size={36} className={styles.emptyIcon} />
                <h3>No active students registered</h3>
                <p>Register students on the dashboard overview tab first.</p>
              </div>
            ) : (
              <>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Student Details</th>
                      <th>Course / Department</th>
                      <th>Email Address</th>
                      <th className={styles.centerAlign}>Status Register</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roster.map((student) => (
                      <tr key={student._id} className={styles.row}>
                        <td>
                          <div className={styles.studentCell}>
                            <div className={styles.avatar}>
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
                          <span className={styles.badgeCourse}>{student.course}</span>
                        </td>
                        <td>
                          <div className={styles.emailCell}>
                            <Mail size={14} className={styles.cellIcon} />
                            <span>{student.email}</span>
                          </div>
                        </td>
                        <td className={styles.centerAlign}>
                          <div className={styles.statusButtonsGroup}>
                            <button
                              type="button"
                              onClick={() => handleStatusToggle(student._id, 'Present')}
                              className={`${styles.statusToggleBtn} ${student.status === 'Present' ? styles.btnPresentActive : ''}`}
                            >
                              <CheckCircle size={14} />
                              <span>Present</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusToggle(student._id, 'Absent')}
                              className={`${styles.statusToggleBtn} ${student.status === 'Absent' ? styles.btnAbsentActive : ''}`}
                            >
                              <XCircle size={14} />
                              <span>Absent</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Floating footer for saving registry */}
                <div className={styles.submitSection}>
                  <button
                    onClick={handleSaveAttendance}
                    className={styles.saveBtn}
                    disabled={isSubmitLoading}
                  >
                    {isSubmitLoading ? (
                      <div className={styles.btnSpinner} />
                    ) : (
                      <Save size={16} />
                    )}
                    <span>Save Daily Registry</span>
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          // Monthly Aggregate Report Layout
          <div className={styles.tableResponsive}>
            {displayReport.length === 0 ? (
              <div className={styles.emptyContainer}>
                <TrendingUp size={36} className={styles.emptyIcon} />
                <h3>No attendance sheets recorded</h3>
                <p>Register daily logs for this month to generate aggregations.</p>
              </div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Student Details</th>
                    <th>Course / Department</th>
                    <th className={styles.centerAlign}>Present Days</th>
                    <th className={styles.centerAlign}>Absent Days</th>
                    <th className={styles.centerAlign}>Total Days</th>
                    <th className={styles.centerAlign}>Attendance Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {displayReport.map((item) => {
                    const isAlert = item.rate < 75;
                    return (
                      <tr key={item._id} className={styles.row}>
                        <td>
                          <div className={styles.studentCell}>
                            <div className={styles.avatar}>
                              {item.student?.profileImage ? (
                                <img src={item.student.profileImage} alt={item.student.name} className={styles.avatarImg} />
                              ) : (
                                item.student?.name?.charAt(0).toUpperCase()
                              )}
                            </div>
                            <span className={styles.studentName}>{item.student?.name}</span>
                          </div>
                        </td>
                        <td>
                          <span className={styles.badgeCourse}>{item.student?.course}</span>
                        </td>
                        <td className={`${styles.centerAlign} ${styles.greenText} ${styles.boldText}`}>
                          {item.presentCount}
                        </td>
                        <td className={`${styles.centerAlign} ${styles.redText} ${styles.boldText}`}>
                          {item.absentCount}
                        </td>
                        <td className={`${styles.centerAlign} ${styles.boldText}`}>
                          {item.totalDays}
                        </td>
                        <td className={styles.centerAlign}>
                          <span className={`${styles.rateBadge} ${isAlert ? styles.badgeDanger : styles.badgeSuccess}`}>
                            {item.rate.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;
