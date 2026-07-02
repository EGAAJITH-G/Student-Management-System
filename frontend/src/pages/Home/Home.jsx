import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  Search, 
  UserPlus, 
  AlertCircle, 
  CheckCircle,
  X,
  RefreshCw,
  Sparkles,
  Download,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchStudents as fetchStudentsAction, 
  fetchAllStudents, 
  createStudent as createStudentAction, 
  updateStudent as updateStudentAction, 
  deleteStudent as deleteStudentAction,
  setSearchQuery,
  setFilterCourse,
  setSortMethod,
  setCurrentPage,
  setSuggestions
} from '../../store/studentSlice';
import studentService from '../../services/studentService';
import StudentForm from '../../components/StudentForm/StudentForm';
import StudentTable from '../../components/StudentTable/StudentTable';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import styles from './Home.module.css';

const Home = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();

  // Redux States
  const {
    students,
    allStudents,
    totalRecords,
    totalPages,
    currentPage,
    searchQuery,
    filterCourse,
    sortMethod,
    availableCourses,
    suggestions,
    loading: isTableLoading
  } = useSelector(state => state.students);

  // Local Component States
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [editingStudent, setEditingStudent] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false); // Controls form modal popup
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [bulkFileError, setBulkFileError] = useState('');
  const [bulkStudents, setBulkStudents] = useState([]);
  const [isBulkUploading, setIsBulkUploading] = useState(false);

  // Refs for debouncing and click-outside events
  const searchTimeoutRef = useRef(null);
  const suggestionTimeoutRef = useRef(null);
  const searchBarRef = useRef(null);

  // Sync local search query with redux searchQuery changes (e.g. if cleared or socket updates)
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  // Click outside suggestions container to auto-hide
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch paginated students from backend
  const fetchStudentsData = (searchVal = searchQuery, courseVal = filterCourse, sortVal = sortMethod, pageVal = currentPage) => {
    dispatch(fetchStudentsAction({
      search: searchVal,
      course: courseVal,
      sortBy: sortVal,
      page: pageVal,
      limit: 10
    }));
  };

  // Fetch all students initially and when students change (for metrics/unique courses)
  useEffect(() => {
    dispatch(fetchAllStudents());
  }, [dispatch]);

  // Re-fetch students dynamically when filters or sorts change (resetting to page 1)
  useEffect(() => {
    dispatch(setCurrentPage(1));
    fetchStudentsData(searchQuery, filterCourse, sortMethod, 1);
  }, [filterCourse, sortMethod]);

  // Handle Search Input Change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearchQuery(value);
    setActiveSuggestionIndex(-1);

    // Debounce the database query and sync search query in redux
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      dispatch(setSearchQuery(value));
      dispatch(setCurrentPage(1));
      dispatch(fetchStudentsAction({
        search: value,
        course: filterCourse,
        sortBy: sortMethod,
        page: 1,
        limit: 10
      }));
    }, 500);

    // Debounce the local suggestions autocomplete
    if (suggestionTimeoutRef.current) {
      clearTimeout(suggestionTimeoutRef.current);
    }
    if (value.trim().length >= 2) {
      suggestionTimeoutRef.current = setTimeout(() => {
        const filtered = allStudents.filter(student => 
          student.name.toLowerCase().includes(value.toLowerCase()) ||
          student.email.toLowerCase().includes(value.toLowerCase())
        ).slice(0, 5);
        dispatch(setSuggestions(filtered));
        setShowSuggestions(true);
      }, 200);
    } else {
      dispatch(setSuggestions([]));
      setShowSuggestions(false);
    }
  };

  // Focus handler to show suggestions if query exists
  const handleSearchFocus = () => {
    if (localSearchQuery.trim().length >= 2) {
      const filtered = allStudents.filter(student => 
        student.name.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(localSearchQuery.toLowerCase())
      ).slice(0, 5);
      dispatch(setSuggestions(filtered));
      setShowSuggestions(true);
    }
  };

  // Suggestion click selection
  const handleSuggestionClick = (student) => {
    dispatch(setSearchQuery(student.name));
    setLocalSearchQuery(student.name);
    setShowSuggestions(false);
    dispatch(setCurrentPage(1));
    dispatch(fetchStudentsAction({
      search: student.name,
      course: filterCourse,
      sortBy: sortMethod,
      page: 1,
      limit: 10
    }));
  };

  // Keyboard navigation support
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestionIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestionIndex(prev => 
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === 'Enter') {
      if (activeSuggestionIndex >= 0 && activeSuggestionIndex < suggestions.length) {
        e.preventDefault();
        handleSuggestionClick(suggestions[activeSuggestionIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Clear Search
  const clearSearch = () => {
    dispatch(setSearchQuery(''));
    setLocalSearchQuery('');
    dispatch(setSuggestions([]));
    setShowSuggestions(false);
    dispatch(setCurrentPage(1));
    dispatch(fetchStudentsAction({
      search: '',
      course: filterCourse,
      sortBy: sortMethod,
      page: 1,
      limit: 10
    }));
  };

  // Helper to show self-dismissing toast notifications using react-toastify
  const showNotification = (type, message) => {
    if (type === 'success') {
      toast.success(message);
    } else {
      toast.error(message);
    }
  };

  // Handle Add or Edit Student Form Submission
  const handleFormSubmit = async (formData) => {
    setIsFormLoading(true);
    try {
      if (editingStudent) {
        // Edit flow
        const resultAction = await dispatch(updateStudentAction({ id: editingStudent._id, studentData: formData }));
        if (updateStudentAction.fulfilled.match(resultAction)) {
          showNotification('success', `Successfully updated profile for ${resultAction.payload.name}!`);
          setEditingStudent(null);
          setIsFormOpen(false); // Close modal
          fetchStudentsData(searchQuery, filterCourse, sortMethod, currentPage);
          dispatch(fetchAllStudents());
        } else {
          showNotification('error', resultAction.payload || 'An error occurred during submission.');
        }
      } else {
        // Add flow
        const resultAction = await dispatch(createStudentAction(formData));
        if (createStudentAction.fulfilled.match(resultAction)) {
          showNotification('success', `Registered student ${resultAction.payload.name} successfully!`);
          setIsFormOpen(false); // Close modal
          dispatch(setCurrentPage(1));
          fetchStudentsData(searchQuery, filterCourse, sortMethod, 1);
          dispatch(fetchAllStudents());
        } else {
          showNotification('error', resultAction.payload || 'An error occurred during submission.');
        }
      }
    } catch (err) {
      showNotification('error', err.message || 'An error occurred during submission.');
    } finally {
      setIsFormLoading(false);
    }
  };

  // Handle Edit Action Click
  const handleEditClick = (student) => {
    setEditingStudent(student);
    setIsFormOpen(true); // Open popup modal
  };

  // Handle Cancel Edit
  const handleCancelForm = () => {
    setEditingStudent(null);
    setIsFormOpen(false); // Close popup modal
  };

  // Handle Delete Action Click
  const handleDeleteStudent = async (id) => {
    try {
      const resultAction = await dispatch(deleteStudentAction(id));
      if (deleteStudentAction.fulfilled.match(resultAction)) {
        showNotification('success', 'Student record deleted successfully.');
        // If we are currently editing the deleted student, clear form
        if (editingStudent && editingStudent._id === id) {
          setEditingStudent(null);
          setIsFormOpen(false); // Close popup modal
        }
        
        // Auto-adjust page index if deleting the last student of the current page
        const nextPage = (students.length === 1 && currentPage > 1) ? currentPage - 1 : currentPage;
        dispatch(setCurrentPage(nextPage));
        fetchStudentsData(searchQuery, filterCourse, sortMethod, nextPage);
        dispatch(fetchAllStudents());
      } else {
        showNotification('error', resultAction.payload || 'Failed to delete student.');
      }
    } catch (err) {
      showNotification('error', err.message || 'Failed to delete student.');
    }
  };

  // Calculate Metrics/KPI Statistics using the full list
  const totalCount = allStudents.length;
  
  // Calculate unique courses from full list
  const uniqueCourses = new Set(allStudents.map(s => s.course?.trim()?.toLowerCase())).size;

  // Find latest student registration in full list
  const newestStudent = allStudents.length > 0 
    ? allStudents.reduce((latest, current) => {
        return new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest;
      }, allStudents[0])
    : null;

  // Page index click helper
  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      dispatch(setCurrentPage(pageNumber));
      fetchStudentsData(searchQuery, filterCourse, sortMethod, pageNumber);
    }
  };

  // Client-side CSV exporter (fetches full matching list without page sizes limits)
  const handleExportCSV = async () => {
    try {
      const response = await studentService.getStudents(searchQuery, filterCourse, sortMethod);
      if (!response.success || response.data.length === 0) {
        showNotification('error', 'No student records to export.');
        return;
      }

      // CSV Headers
      const headers = ['Name', 'Email', 'Course', 'Phone', 'Registration Date'];
      
      // CSV Rows
      const rows = response.data.map(student => [
        `"${student.name.replace(/"/g, '""')}"`,
        `"${student.email.replace(/"/g, '""')}"`,
        `"${student.course.replace(/"/g, '""')}"`,
        `"${student.phone ? String(student.phone).replace(/"/g, '""') : ''}"`,
        `"${new Date(student.createdAt).toLocaleDateString()}"`
      ]);

      // Construct raw CSV string
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      // Create file blob download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `student_enrollments_${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showNotification('success', 'Successfully exported filtered student data to Excel CSV!');
    } catch (err) {
      showNotification('error', 'Failed to export CSV: ' + (err.message || err));
    }
  };

  // Parse CSV File locally to show preview and perform validations
  const handleCSVFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setBulkFileError('Please upload a valid CSV file.');
      setBulkStudents([]);
      return;
    }

    setBulkFileError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        // Split by lines, handle windows CRLF
        const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
        if (lines.length < 2) {
          setBulkFileError('CSV file is empty or contains no records.');
          setBulkStudents([]);
          return;
        }

        // Parse headers (comma separated)
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/^["']|["']$/g, ''));
        
        // Check required headers
        const required = ['name', 'email', 'course', 'phone'];
        const missing = required.filter(req => !headers.includes(req));
        if (missing.length > 0) {
          setBulkFileError(`Missing required column headers: ${missing.join(', ')}. Please format headers as: name, email, course, phone`);
          setBulkStudents([]);
          return;
        }

        const nameIndex = headers.indexOf('name');
        const emailIndex = headers.indexOf('email');
        const courseIndex = headers.indexOf('course');
        const phoneIndex = headers.indexOf('phone');

        const parsedStudents = [];
        for (let i = 1; i < lines.length; i++) {
          // Simple comma splitter (handling basic quotes if present)
          const cols = [];
          let currentStr = '';
          let inQuotes = false;
          
          const lineStr = lines[i];
          for (let c = 0; c < lineStr.length; c++) {
            const char = lineStr[c];
            if (char === '"' || char === "'") {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              cols.push(currentStr.trim());
              currentStr = '';
            } else {
              currentStr += char;
            }
          }
          cols.push(currentStr.trim());

          const name = cols[nameIndex]?.replace(/^["']|["']$/g, '') || '';
          const email = cols[emailIndex]?.replace(/^["']|["']$/g, '') || '';
          const course = cols[courseIndex]?.replace(/^["']|["']$/g, '') || '';
          const phone = cols[phoneIndex]?.replace(/^["']|["']$/g, '') || '';

          parsedStudents.push({ name, email, course, phone, rowNum: i + 1 });
        }

        setBulkStudents(parsedStudents);
      } catch (err) {
        setBulkFileError('Error reading or parsing CSV file: ' + err.message);
        setBulkStudents([]);
      }
    };
    reader.readAsText(file);
  };

  // Submit bulk uploaded student records
  const handleBulkUploadSubmit = async () => {
    if (bulkStudents.length === 0) return;
    setIsBulkUploading(true);
    setBulkFileError('');
    try {
      const response = await studentService.bulkUpload(bulkStudents);
      if (response.success) {
        showNotification('success', `Successfully bulk uploaded ${response.count} students!`);
        setIsBulkUploadOpen(false);
        setBulkStudents([]);
        
        // Refresh grid
        dispatch(setCurrentPage(1));
        fetchStudentsData(searchQuery, filterCourse, sortMethod, 1);
        dispatch(fetchAllStudents());
      } else {
        setBulkFileError(response.error || 'Failed to perform bulk upload.');
      }
    } catch (err) {
      if (err.errors && Array.isArray(err.errors)) {
        // Show validation errors from backend
        setBulkFileError('The following rows failed validation:\n' + err.errors.join('\n'));
      } else {
        setBulkFileError(err.error || err.message || 'An error occurred during bulk upload.');
      }
    } finally {
      setIsBulkUploading(false);
    }
  };

  return (
    <div className={`${styles.dashboard} fade-in`}>
      {/* Main Header / Welcome Section */}
      <section className={styles.welcomeSection}>
        <div className={styles.welcomeText}>
          <div className={styles.badge}>
            <Sparkles className={styles.badgeIcon} />
            <span>Welcome Administrator</span>
          </div>
          <h1 className={styles.welcomeTitle}>Student Analytics Dashboard</h1>
          <p className={styles.welcomeSubtitle}>
            Monitor registration metrics, update student enrollment databases, and manage institutional cohorts inside a single intuitive panel.
          </p>
        </div>
        <div className={styles.welcomeActions}>
          {user?.role === 'admin' && (
            <>
              <button 
                onClick={() => {
                  setEditingStudent(null);
                  setIsFormOpen(true); // Open blank form for registering a new student
                }} 
                className={styles.addStudentBtn}
                title="Register New Student"
              >
                <UserPlus className={styles.addStudentIcon} />
                <span>Register Student</span>
              </button>

              <button 
                onClick={() => {
                  setBulkFileError('');
                  setBulkStudents([]);
                  setIsBulkUploadOpen(true);
                }} 
                className={styles.refreshBtn}
                style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', borderColor: 'rgba(79, 70, 229, 0.15)' }}
                title="Bulk Upload Students from CSV"
              >
                <Download className={styles.refreshIcon} style={{ transform: 'rotate(180deg)', width: '0.85rem', height: '0.85rem' }} />
                <span>Bulk Upload</span>
              </button>
            </>
          )}

          <button 
            onClick={() => fetchStudents(searchQuery)} 
            className={styles.refreshBtn}
            title="Refresh Data Grid"
            disabled={isTableLoading}
          >
            <RefreshCw className={`${styles.refreshIcon} ${isTableLoading ? styles.spinning : ''}`} />
            <span>Sync Database</span>
          </button>
        </div>
      </section>

      {/* KPI Cards Section */}
      <section className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Total Enrollments</span>
            <span className={styles.statNumber}>{totalCount}</span>
            <span className={styles.statIndicatorSuccess}>Active Students</span>
          </div>
          <div className={`${styles.statIconBadge} ${styles.badgePurple}`}>
            <Users className={styles.statIcon} />
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Active Courses</span>
            <span className={styles.statNumber}>{uniqueCourses}</span>
            <span className={styles.statIndicatorInfo}>Departments Taught</span>
          </div>
          <div className={`${styles.statIconBadge} ${styles.badgeBlue}`}>
            <BookOpen className={styles.statIcon} />
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Latest Registrant</span>
            <span className={styles.statNumberText}>{newestStudent ? newestStudent.name : 'No records'}</span>
            <span className={styles.statIndicatorText}>
              {newestStudent ? `Joined ${new Date(newestStudent.createdAt).toLocaleDateString()}` : 'Add a student first'}
            </span>
          </div>
          <div className={`${styles.statIconBadge} ${styles.badgeGreen}`}>
            <GraduationCap className={styles.statIcon} />
          </div>
        </div>
      </section>

      {/* Main Panel Content: full-width grid layout */}
      <div className={styles.mainLayoutGrid}>
        {/* Left Side: Student List Filter and Table Grid (Now takes 100% width!) */}
        <div className={styles.leftColumn}>
          <div className={styles.tableHeaderSection}>
            <div className={styles.searchBar} ref={searchBarRef}>
              <Search className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search by student name or email..."
                value={localSearchQuery}
                onChange={handleSearchChange}
                onFocus={handleSearchFocus}
                onKeyDown={handleKeyDown}
                className={styles.searchInput}
              />
              {localSearchQuery && (
                <button onClick={clearSearch} className={styles.searchClearBtn} title="Clear Search">
                  <X className={styles.searchClearIcon} />
                </button>
              )}

              {/* Suggestions autocomplete panel */}
              {showSuggestions && suggestions.length > 0 && (
                <ul className={styles.suggestionsList}>
                  {suggestions.map((suggestion, idx) => (
                    <li
                      key={suggestion._id}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className={`${styles.suggestionItem} ${activeSuggestionIndex === idx ? styles.activeSuggestion : ''}`}
                    >
                      <div className={styles.suggestionAvatar}>
                        {suggestion.profileImage ? (
                          <img src={suggestion.profileImage} alt={suggestion.name} className={styles.suggestionImg} />
                        ) : (
                          suggestion.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className={styles.suggestionDetails}>
                        <span className={styles.suggestionName}>{suggestion.name}</span>
                        <span className={styles.suggestionEmail}>{suggestion.email}</span>
                      </div>
                      <span className={styles.suggestionCourse}>{suggestion.course}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            <div className={styles.actionsHeaderGroup}>
              {/* Dynamic Course Filter Dropdown Select */}
              <select
                value={filterCourse}
                onChange={(e) => dispatch(setFilterCourse(e.target.value))}
                className={styles.selectFilter}
                title="Filter by Course"
              >
                <option value="All">All Courses</option>
                {availableCourses.map((c, idx) => (
                  <option key={idx} value={c}>{c}</option>
                ))}
              </select>

              {/* Dynamic Sort Order Dropdown Select */}
              <select
                value={sortMethod}
                onChange={(e) => dispatch(setSortMethod(e.target.value))}
                className={styles.selectFilter}
                title="Sort order"
              >
                <option value="createdAt:desc">Newest Joined</option>
                <option value="createdAt:asc">Oldest Joined</option>
                <option value="name:asc">Name (A-Z)</option>
                <option value="name:desc">Name (Z-A)</option>
                <option value="course:asc">Course (A-Z)</option>
              </select>


              {['admin', 'staff'].includes(user?.role) && (
                <button 
                  onClick={handleExportCSV} 
                  className={styles.exportBtn}
                  title="Export records to CSV/Excel"
                  disabled={isTableLoading || students.length === 0}
                >
                  <Download className={styles.exportIcon} />
                  <span>Export CSV</span>
                </button>
              )}
            </div>
          </div>

          <div className={styles.tableMetaBar}>
            <span className={styles.resultsText}>
              Showing {students.length > 0 ? `${(currentPage - 1) * 10 + 1} - ${Math.min(currentPage * 10, totalRecords)}` : '0'} of {totalRecords} enrolled {totalRecords === 1 ? 'student' : 'students'}
            </span>
          </div>

          <StudentTable 
            students={students} 
            onEdit={handleEditClick} 
            onDelete={handleDeleteStudent} 
            isLoading={isTableLoading}
            userRole={user?.role}
          />

          {/* Premium Pagination Switcher UI */}
          {totalPages > 1 && (
            <div className={styles.paginationContainer}>
              <button
                className={styles.paginationBtn}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || isTableLoading}
                title="Previous Page"
              >
                <ChevronLeft size={16} />
                <span>Prev</span>
              </button>

              <div className={styles.paginationPages}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => {
                  const isFirst = pageNumber === 1;
                  const isLast = pageNumber === totalPages;
                  const isNearCurrent = Math.abs(pageNumber - currentPage) <= 1;

                  if (isFirst || isLast || isNearCurrent) {
                    return (
                      <button
                        key={pageNumber}
                        className={`${styles.pageNumberBtn} ${currentPage === pageNumber ? styles.pageActive : ''}`}
                        onClick={() => handlePageChange(pageNumber)}
                        disabled={isTableLoading}
                      >
                        {pageNumber}
                      </button>
                    );
                  } else if (
                    (pageNumber === 2 && currentPage > 3) ||
                    (pageNumber === totalPages - 1 && currentPage < totalPages - 2)
                  ) {
                    return <span key={pageNumber} className={styles.pageEllipsis}>...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                className={styles.paginationBtn}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || isTableLoading}
                title="Next Page"
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Student Form Popup Modal */}
      {isFormOpen && (
        <div className={styles.modalOverlay} onClick={handleCancelForm}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <StudentForm
              onSubmit={handleFormSubmit}
              initialData={editingStudent}
              onCancel={handleCancelForm}
              isLoading={isFormLoading}
            />
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {isBulkUploadOpen && (
        <div className={styles.modalOverlay} onClick={() => !isBulkUploading && setIsBulkUploadOpen(false)}>
          <div className={styles.bulkModalContent} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <GraduationCap style={{ color: 'var(--primary)' }} />
                Bulk Upload Students
              </h3>
              <button onClick={() => !isBulkUploading && setIsBulkUploadOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-body)' }}>
              Upload a CSV file containing student records. The file must include a header row with columns: <strong>name, email, course, phone</strong>.
            </p>

            <div className={styles.bulkDropZone} onClick={() => document.getElementById('bulk-csv-input').click()}>
              <Download size={32} style={{ color: 'var(--text-muted)', transform: 'rotate(180deg)' }} />
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Click to select CSV File</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Format: name, email, course, phone</span>
              <input 
                id="bulk-csv-input"
                type="file"
                accept=".csv"
                style={{ display: 'none' }}
                onChange={handleCSVFileChange}
                disabled={isBulkUploading}
              />
            </div>

            {bulkFileError && (
              <div className={styles.bulkErrorBox}>
                {bulkFileError}
              </div>
            )}

            {bulkStudents.length > 0 && !bulkFileError && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
                  <span>Preview ({bulkStudents.length} records found)</span>
                  <span style={{ color: 'var(--success)' }}>Ready to upload</span>
                </div>
                <div className={styles.bulkPreviewContainer}>
                  <table className={styles.bulkPreviewTable}>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Course</th>
                        <th>Phone</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bulkStudents.map((st, idx) => (
                        <tr key={idx}>
                          <td>{idx + 1}</td>
                          <td>{st.name}</td>
                          <td>{st.email}</td>
                          <td>{st.course}</td>
                          <td>{st.phone}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className={styles.bulkActionRow}>
              <button 
                onClick={() => setIsBulkUploadOpen(false)}
                className={styles.refreshBtn}
                disabled={isBulkUploading}
              >
                Cancel
              </button>
              <button 
                onClick={handleBulkUploadSubmit}
                className={styles.addStudentBtn}
                disabled={bulkStudents.length === 0 || isBulkUploading || !!bulkFileError}
                style={{ background: 'var(--primary)' }}
              >
                {isBulkUploading ? 'Uploading...' : `Upload ${bulkStudents.length} Students`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
