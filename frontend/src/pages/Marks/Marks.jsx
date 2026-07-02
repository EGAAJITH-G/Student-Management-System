import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { 
  Award, 
  GraduationCap, 
  Plus, 
  Trash2, 
  Edit3, 
  FileText, 
  Mail, 
  Calendar,
  Sparkles,
  BookOpen,
  ChevronRight,
  TrendingUp,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import studentService from '../../services/studentService';
import marksService from '../../services/marksService';
import pdfGenerator from '../../utils/pdfGenerator';
import { toast } from 'react-toastify';
import styles from './Marks.module.css';

const Marks = () => {
  const { user } = useAuth();
  
  // Loading & State variables
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedSemester, setSelectedSemester] = useState(1);
  const [marks, setMarks] = useState([]);
  const [gpa, setGpa] = useState(0);
  const [totalCredits, setTotalCredits] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  // Load all students for the dropdown if Admin/Staff
  useEffect(() => {
    const fetchStudents = async () => {
      if (user?.role !== 'student') {
        try {
          const response = await studentService.getStudents();
          if (response.success) {
            setStudents(response.data);
            if (response.data.length > 0) {
              setSelectedStudentId(response.data[0]._id);
            }
          }
        } catch (err) {
          toast.error('Failed to load student directory.');
        }
      } else {
        // If Student role, automatically retrieve student record by matching email
        try {
          const response = await studentService.getStudents();
          if (response.success) {
            const myProfile = response.data.find(
              s => s.email.toLowerCase() === user.email.toLowerCase()
            );
            if (myProfile) {
              setSelectedStudentId(myProfile._id);
            }
          }
        } catch (err) {
          toast.error('Failed to resolve your student profile.');
        }
      }
    };
    
    fetchStudents();
  }, [user]);

  // Load marks sheets whenever the selected student or semester changes
  const loadStudentMarks = async () => {
    if (!selectedStudentId) return;
    setIsLoading(true);
    try {
      const response = await marksService.getStudentMarks(selectedStudentId, selectedSemester);
      if (response.success) {
        setMarks(response.data);
        setGpa(response.gpa);
        setTotalCredits(response.totalCredits);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to fetch marks logs.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStudentMarks();
  }, [selectedStudentId, selectedSemester]);

  // Formik & Yup Validation setup
  const validationSchema = Yup.object({
    subject: Yup.string()
      .required('Subject name is required')
      .min(2, 'Subject name must be at least 2 characters'),
    internalMarks: Yup.number()
      .required('Internal marks are required')
      .min(0, 'Marks cannot be less than 0')
      .max(40, 'Internal marks cannot exceed 40'),
    semesterMarks: Yup.number()
      .required('Semester marks are required')
      .min(0, 'Marks cannot be less than 0')
      .max(60, 'Semester marks cannot exceed 60'),
    credits: Yup.number()
      .required('Credits are required')
      .min(1, 'Credits must be at least 1')
      .max(5, 'Credits cannot exceed 5')
  });

  const formik = useFormik({
    initialValues: {
      subject: '',
      internalMarks: '',
      semesterMarks: '',
      credits: 3
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsSubmitLoading(true);
      try {
        const payload = {
          studentId: selectedStudentId,
          semester: selectedSemester,
          subject: values.subject,
          internalMarks: parseFloat(values.internalMarks),
          semesterMarks: parseFloat(values.semesterMarks),
          credits: parseInt(values.credits, 10)
        };
        
        if (editingRecord) {
          payload.id = editingRecord._id;
        }

        const response = await marksService.saveMarks(payload);
        if (response.success) {
          toast.success(editingRecord ? 'Marks updated successfully!' : 'Marks added successfully!');
          closeModal();
          loadStudentMarks();
        }
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to register exam scores.');
      } finally {
        setIsSubmitLoading(false);
      }
    }
  });

  // Modal control functions
  const openAddModal = () => {
    setEditingRecord(null);
    formik.resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (record) => {
    setEditingRecord(record);
    formik.setValues({
      subject: record.subject,
      internalMarks: record.internalMarks,
      semesterMarks: record.semesterMarks,
      credits: record.credits
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRecord(null);
    formik.resetForm();
  };

  // Delete handler
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this subject mark? This action is permanent.')) {
      try {
        const response = await marksService.deleteMarks(id);
        if (response.success) {
          toast.success('Subject marks deleted successfully.');
          loadStudentMarks();
        }
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to delete marks entry.');
      }
    }
  };

  const getStudentDetails = () => {
    return students.find(s => s._id === selectedStudentId);
  };

  const currentStudent = getStudentDetails();

  const handleExportPDF = () => {
    if (!currentStudent) {
      toast.error('Student profile details not resolved.');
      return;
    }
    try {
      pdfGenerator.generateStudentReportCard(
        currentStudent,
        selectedSemester,
        marks,
        gpa,
        totalCredits
      );
      toast.success('Official Grade Card downloaded successfully!');
    } catch (err) {
      toast.error('Failed to generate PDF Report Card.');
    }
  };

  return (
    <div className={`${styles.container} fade-in`}>
      {/* Page Header */}
      <header className={styles.header}>
        <div className={styles.welcomeText}>
          <div className={styles.badge}>
            <Sparkles className={styles.badgeIcon} />
            <span>Academic Performance Console</span>
          </div>
          <h1 className={styles.title}>Results & GPA Portfolio</h1>
          <p className={styles.subtitle}>
            Log student semester scores, calculate automatic grade point scales, and track dynamic cumulative GPAs.
          </p>
        </div>
        <div className={styles.headerActions}>
          <button 
            type="button"
            onClick={handleExportPDF} 
            className={styles.pdfBtn} 
            disabled={marks.length === 0}
            title="Download Official Grade Transcript PDF"
          >
            <FileText size={16} />
            <span>Export Transcript</span>
          </button>
          {user?.role !== 'student' && (
            <button onClick={openAddModal} className={styles.addBtn} disabled={!selectedStudentId}>
              <Plus size={16} />
              <span>Add Subject Marks</span>
            </button>
          )}
        </div>
      </header>

      {/* Control Panel Filter Area */}
      <div className={styles.filtersBar}>
        <div className={styles.filterGroup}>
          {user?.role !== 'student' ? (
            <div className={styles.selectorItem}>
              <label className={styles.selectorLabel}>Select Student Profile</label>
              <div className={styles.dropdownWrapper}>
                <GraduationCap className={styles.selectIcon} size={16} />
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className={styles.selectInput}
                >
                  <option value="" disabled>Choose a student...</option>
                  {students.map(s => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.course})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className={styles.selectorItem}>
              <label className={styles.selectorLabel}>Student Information</label>
              <div className={styles.studentLockInfo}>
                <GraduationCap className={styles.lockIcon} size={16} />
                <span className={styles.lockText}>
                  {currentStudent ? `${currentStudent.name} (${currentStudent.course})` : 'Resolving credentials...'}
                </span>
              </div>
            </div>
          )}

          <div className={styles.selectorItem}>
            <label className={styles.selectorLabel}>Academic Semester</label>
            <div className={styles.dropdownWrapper}>
              <Calendar className={styles.selectIcon} size={16} />
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(parseInt(e.target.value, 10))}
                className={styles.selectInput}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                  <option key={sem} value={sem}>
                    Semester {sem}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Dynamic GPA Progress Card */}
        <div className={styles.gpaCard}>
          <div className={styles.gpaDetails}>
            <span className={styles.gpaLabel}>Semester GPA Score</span>
            <div className={styles.gpaValueContainer}>
              <span className={styles.gpaValue}>{gpa > 0 ? gpa.toFixed(2) : '0.00'}</span>
              <span className={styles.gpaScale}>/ 10.00</span>
            </div>
            <div className={styles.gpaFooter}>
              <TrendingUp size={12} className={styles.gpaFooterIcon} />
              <span>Weighted across {totalCredits} Semester Credits</span>
            </div>
          </div>
          <div className={styles.gpaCircleWrapper}>
            <svg className={styles.gpaProgressSvg} viewBox="0 0 36 36">
              <path
                className={styles.circleBg}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={styles.circleStroke}
                strokeDasharray={`${gpa * 10}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className={styles.circleLabel}>
              <Award size={18} className={styles.circleIcon} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Score Sheet */}
      <div className={styles.tableCard}>
        {isLoading ? (
          <div className={styles.loaderArea}>
            <div className={styles.spinner} />
            <span>Compiling Semester Scorecards...</span>
          </div>
        ) : marks.length === 0 ? (
          <div className={styles.emptyArea}>
            <FileText size={42} className={styles.emptyIcon} />
            <h3>No subject scores registered</h3>
            {user?.role !== 'student' ? (
              <p>Add subject exam details above to calculate dynamic semester GPAs.</p>
            ) : (
              <p>Scores for this semester have not been recorded yet. Please check back later.</p>
            )}
          </div>
        ) : (
          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Subject Course Name</th>
                  <th className={styles.centerAlign}>Subject Credits</th>
                  <th className={styles.centerAlign}>Internal Marks (/40)</th>
                  <th className={styles.centerAlign}>Semester Marks (/60)</th>
                  <th className={styles.centerAlign}>Total Percentage (/100)</th>
                  <th className={styles.centerAlign}>Letter Grade</th>
                  <th className={styles.centerAlign}>Grade Points</th>
                  {user?.role !== 'student' && <th className={styles.centerAlign}>Action Control</th>}
                </tr>
              </thead>
              <tbody>
                {marks.map((rec) => {
                  const isFail = rec.grade === 'F';
                  return (
                    <tr key={rec._id} className={styles.row}>
                      <td className={styles.subjectCell}>
                        <BookOpen size={14} className={styles.subjectIcon} />
                        <span className={styles.subjectName}>{rec.subject}</span>
                      </td>
                      <td className={`${styles.centerAlign} ${styles.creditsText}`}>
                        {rec.credits} Credits
                      </td>
                      <td className={styles.centerAlign}>
                        <span className={styles.marksBadge}>{rec.internalMarks}</span>
                      </td>
                      <td className={styles.centerAlign}>
                        <span className={styles.marksBadge}>{rec.semesterMarks}</span>
                      </td>
                      <td className={`${styles.centerAlign} ${styles.totalMarksText}`}>
                        {rec.totalMarks}%
                      </td>
                      <td className={styles.centerAlign}>
                        <span className={`${styles.gradeBadge} ${isFail ? styles.gradeFail : styles.gradePass}`}>
                          {rec.grade}
                        </span>
                      </td>
                      <td className={`${styles.centerAlign} ${styles.gpText}`}>
                        {rec.gradePoints}
                      </td>
                      {user?.role !== 'student' && (
                        <td className={styles.centerAlign}>
                          <div className={styles.actionGroup}>
                            <button 
                              onClick={() => openEditModal(rec)} 
                              className={styles.editBtn}
                              title="Modify marks"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button 
                              onClick={() => handleDelete(rec._id)} 
                              className={styles.deleteBtn}
                              title="Delete marks"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Dialog Modal Overlay */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modalContent} zoom-in`}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleBlock}>
                <Award size={18} className={styles.modalHeaderIcon} />
                <h3>{editingRecord ? 'Modify Subject Performance' : 'Register Subject Performance'}</h3>
              </div>
              <button onClick={closeModal} className={styles.closeBtn}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={formik.handleSubmit} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Subject / Course Name</label>
                <input
                  name="subject"
                  type="text"
                  placeholder="e.g. Linear Algebra, Algorithms"
                  className={`${styles.formInput} ${formik.touched.subject && formik.errors.subject ? styles.inputError : ''}`}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.subject}
                />
                {formik.touched.subject && formik.errors.subject && (
                  <span className={styles.errorText}>{formik.errors.subject}</span>
                )}
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Internal Scores (Max 40)</label>
                  <input
                    name="internalMarks"
                    type="number"
                    step="0.5"
                    placeholder="0 - 40"
                    className={`${styles.formInput} ${formik.touched.internalMarks && formik.errors.internalMarks ? styles.inputError : ''}`}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.internalMarks}
                  />
                  {formik.touched.internalMarks && formik.errors.internalMarks && (
                    <span className={styles.errorText}>{formik.errors.internalMarks}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Semester scores (Max 60)</label>
                  <input
                    name="semesterMarks"
                    type="number"
                    step="0.5"
                    placeholder="0 - 60"
                    className={`${styles.formInput} ${formik.touched.semesterMarks && formik.errors.semesterMarks ? styles.inputError : ''}`}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.semesterMarks}
                  />
                  {formik.touched.semesterMarks && formik.errors.semesterMarks && (
                    <span className={styles.errorText}>{formik.errors.semesterMarks}</span>
                  )}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Course Weighted Credits (1 - 5)</label>
                <select
                  name="credits"
                  className={styles.formSelect}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.credits}
                >
                  <option value="1">1 Credit</option>
                  <option value="2">2 Credits</option>
                  <option value="3">3 Credits</option>
                  <option value="4">4 Credits</option>
                  <option value="5">5 Credits</option>
                </select>
                {formik.touched.credits && formik.errors.credits && (
                  <span className={styles.errorText}>{formik.errors.credits}</span>
                )}
              </div>

              <div className={styles.formActions}>
                <button type="button" onClick={closeModal} className={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" className={styles.saveBtn} disabled={isSubmitLoading}>
                  {isSubmitLoading ? <div className={styles.btnSpinner} /> : 'Save Exam Marks'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marks;
