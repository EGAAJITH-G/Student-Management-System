import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import studentService from '../services/studentService';

// Async Thunks
export const fetchStudents = createAsyncThunk(
  'students/fetchStudents',
  async ({ search, course, sortBy, page, limit }, { rejectWithValue }) => {
    try {
      const response = await studentService.getStudents(search, course, sortBy, page, limit);
      if (response.success) {
        return response;
      }
      return rejectWithValue(response.error || 'Failed to fetch students');
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message || 'Failed to fetch students');
    }
  }
);

export const fetchAllStudents = createAsyncThunk(
  'students/fetchAllStudents',
  async (_, { rejectWithValue }) => {
    try {
      const response = await studentService.getStudents('', 'All', 'createdAt:desc');
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.error || 'Failed to fetch all students');
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message || 'Failed to fetch all students');
    }
  }
);

export const createStudent = createAsyncThunk(
  'students/createStudent',
  async (studentData, { rejectWithValue }) => {
    try {
      const response = await studentService.createStudent(studentData);
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.error || 'Failed to create student');
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message || 'Failed to create student');
    }
  }
);

export const updateStudent = createAsyncThunk(
  'students/updateStudent',
  async ({ id, studentData }, { rejectWithValue }) => {
    try {
      const response = await studentService.updateStudent(id, studentData);
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.error || 'Failed to update student');
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message || 'Failed to update student');
    }
  }
);

export const deleteStudent = createAsyncThunk(
  'students/deleteStudent',
  async (id, { rejectWithValue }) => {
    try {
      const response = await studentService.deleteStudent(id);
      if (response.success) {
        return id;
      }
      return rejectWithValue(response.error || 'Failed to delete student');
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message || 'Failed to delete student');
    }
  }
);

const initialState = {
  students: [],
  allStudents: [],
  totalRecords: 0,
  totalPages: 1,
  currentPage: 1,
  searchQuery: '',
  filterCourse: 'All',
  sortMethod: 'createdAt:desc',
  availableCourses: [],
  suggestions: [],
  loading: false,
  error: null
};

const studentSlice = createSlice({
  name: 'students',
  initialState,
  reducers: {
    setSearchQuery(state, action) {
      state.searchQuery = action.payload;
    },
    setFilterCourse(state, action) {
      state.filterCourse = action.payload;
    },
    setSortMethod(state, action) {
      state.sortMethod = action.payload;
    },
    setCurrentPage(state, action) {
      state.currentPage = action.payload;
    },
    setSuggestions(state, action) {
      state.suggestions = action.payload;
    },
    clearError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch students (paginated)
      .addCase(fetchStudents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.loading = false;
        state.students = action.payload.data;
        state.totalRecords = action.payload.total;
        state.totalPages = action.payload.totalPages || 1;
        if (action.payload.page) {
          state.currentPage = action.payload.page;
        }
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch all students (unpaginated, for metrics / unique courses)
      .addCase(fetchAllStudents.fulfilled, (state, action) => {
        state.allStudents = action.payload;
        const unique = [...new Set(action.payload.map(s => s.course?.trim()))].filter(Boolean);
        state.availableCourses = unique;
      })
      // Create student
      .addCase(createStudent.fulfilled, (state, action) => {
        // Optimistic / update allStudents
        state.allStudents.unshift(action.payload);
      })
      // Update student
      .addCase(updateStudent.fulfilled, (state, action) => {
        const updated = action.payload;
        state.students = state.students.map(s => s._id === updated._id ? updated : s);
        state.allStudents = state.allStudents.map(s => s._id === updated._id ? updated : s);
      })
      // Delete student
      .addCase(deleteStudent.fulfilled, (state, action) => {
        const id = action.payload;
        state.students = state.students.filter(s => s._id !== id);
        state.allStudents = state.allStudents.filter(s => s._id !== id);
      });
  }
});

export const {
  setSearchQuery,
  setFilterCourse,
  setSortMethod,
  setCurrentPage,
  setSuggestions,
  clearError
} = studentSlice.actions;

export default studentSlice.reducer;
