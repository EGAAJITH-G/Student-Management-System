import React, { useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { User, Mail, BookOpen, Phone, X, Save, Sparkles, Camera, Trash2 } from 'lucide-react';
import styles from './StudentForm.module.css';

const StudentForm = ({ onSubmit, initialData, onCancel, isLoading }) => {
  // Yup Validation Schema
  const validationSchema = Yup.object({
    name: Yup.string()
      .trim()
      .required('Full name is required'),
    email: Yup.string()
      .trim()
      .email('Please enter a valid email address')
      .required('Email address is required'),
    course: Yup.string()
      .trim()
      .required('Course selection is required'),
    phone: Yup.string()
      .trim()
      .required('Phone number is required')
      .matches(/^[0-9]{10}$/, 'Phone must be exactly 10 digits')
  });

  // Formik Hook initialization
  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      course: '',
      phone: '',
      profileImage: ''
    },
    validationSchema,
    onSubmit: (values) => {
      onSubmit(values);
    },
    enableReinitialize: true
  });

  // Sync initialData changes into Formik values (e.g. when opening edit modal)
  useEffect(() => {
    if (initialData) {
      formik.setValues({
        name: initialData.name || '',
        email: initialData.email || '',
        course: initialData.course || '',
        phone: String(initialData.phone || ''),
        profileImage: initialData.profileImage || ''
      });
    } else {
      formik.resetForm();
    }
  }, [initialData]);

  // Image upload handling
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1.5 * 1024 * 1024) {
        formik.setFieldError('profileImage', 'File size must be under 1.5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        formik.setFieldValue('profileImage', reader.result);
        formik.setFieldError('profileImage', '');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    formik.setFieldValue('profileImage', '');
  };

  const handleCancelClick = () => {
    formik.resetForm();
    if (onCancel) {
      onCancel();
    }
  };

  const isEditing = !!initialData;

  return (
    <div className={`${styles.card} scale-in`}>
      <div className={styles.cardHeader}>
        <div className={styles.titleGroup}>
          <div className={styles.iconBadge}>
            <Sparkles className={styles.sparkleIcon} />
          </div>
          <div>
            <h2 className={styles.cardTitle}>{isEditing ? 'Edit Student Details' : 'Register Student'}</h2>
            <p className={styles.cardSubtitle}>
              {isEditing ? 'Modify student credentials and details' : 'Add a new student profile to database'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={formik.handleSubmit} className={styles.form}>
        {/* Profile Image Uploader */}
        <div className={styles.imageUploadSection}>
          <div className={styles.avatarPreviewContainer}>
            {formik.values.profileImage ? (
              <img src={formik.values.profileImage} alt="Preview" className={styles.avatarPreview} />
            ) : (
              <div className={styles.avatarPlaceholder}>
                <Camera className={styles.cameraIcon} />
              </div>
            )}
          </div>
          
          <div className={styles.uploadControls}>
            <span className={styles.uploadLabel}>Profile Picture</span>
            <div className={styles.buttonGroup}>
              <label className={styles.btnUpload}>
                Browse File
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange} 
                  className={styles.fileInput}
                  disabled={isLoading}
                />
              </label>
              {formik.values.profileImage && (
                <button 
                  type="button" 
                  onClick={handleRemoveImage} 
                  className={styles.btnRemovePhoto}
                  disabled={isLoading}
                  title="Remove Photo"
                >
                  <Trash2 className={styles.trashIcon} />
                </button>
              )}
            </div>
          </div>
        </div>
        {formik.errors.profileImage && (
          <span className={styles.errorText} style={{ textAlign: 'center', display: 'block' }}>
            {formik.errors.profileImage}
          </span>
        )}

        {/* Full Name */}
        <div className={styles.inputGroup}>
          <label htmlFor="name" className={styles.label}>Full Name</label>
          <div className={`${styles.inputContainer} ${formik.touched.name && formik.errors.name ? styles.inputError : ''}`}>
            <User className={styles.inputIcon} />
            <input
              type="text"
              id="name"
              placeholder="e.g. John Doe"
              className={styles.input}
              disabled={isLoading}
              {...formik.getFieldProps('name')}
            />
          </div>
          {formik.touched.name && formik.errors.name && (
            <span className={styles.errorText}>{formik.errors.name}</span>
          )}
        </div>

        {/* Email Address */}
        <div className={styles.inputGroup}>
          <label htmlFor="email" className={styles.label}>Email Address</label>
          <div className={`${styles.inputContainer} ${formik.touched.email && formik.errors.email ? styles.inputError : ''}`}>
            <Mail className={styles.inputIcon} />
            <input
              type="email"
              id="email"
              placeholder="e.g. john@example.com"
              className={styles.input}
              disabled={isLoading}
              {...formik.getFieldProps('email')}
            />
          </div>
          {formik.touched.email && formik.errors.email && (
            <span className={styles.errorText}>{formik.errors.email}</span>
          )}
        </div>

        {/* Course / Department */}
        <div className={styles.inputGroup}>
          <label htmlFor="course" className={styles.label}>Course / Department</label>
          <div className={`${styles.inputContainer} ${formik.touched.course && formik.errors.course ? styles.inputError : ''}`}>
            <BookOpen className={styles.inputIcon} />
            <input
              type="text"
              id="course"
              placeholder="e.g. Computer Science & Engineering"
              className={styles.input}
              disabled={isLoading}
              {...formik.getFieldProps('course')}
            />
          </div>
          {formik.touched.course && formik.errors.course && (
            <span className={styles.errorText}>{formik.errors.course}</span>
          )}
        </div>

        {/* Phone Number */}
        <div className={styles.inputGroup}>
          <label htmlFor="phone" className={styles.label}>Phone Number</label>
          <div className={`${styles.inputContainer} ${formik.touched.phone && formik.errors.phone ? styles.inputError : ''}`}>
            <Phone className={styles.inputIcon} />
            <input
              type="tel"
              id="phone"
              placeholder="e.g. 9876543210"
              className={styles.input}
              disabled={isLoading}
              {...formik.getFieldProps('phone')}
            />
          </div>
          {formik.touched.phone && formik.errors.phone && (
            <span className={styles.errorText}>{formik.errors.phone}</span>
          )}
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            onClick={handleCancelClick}
            className={styles.btnSecondary}
            disabled={isLoading}
          >
            <X className={styles.btnIcon} />
            <span>{isEditing ? 'Cancel' : 'Clear'}</span>
          </button>
          
          <button
            type="submit"
            className={styles.btnPrimary}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className={styles.spinner} />
            ) : (
              <Save className={styles.btnIcon} />
            )}
            <span>{isEditing ? 'Update Student' : 'Save Record'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentForm;
