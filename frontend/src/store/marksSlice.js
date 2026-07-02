import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import marksService from '../services/marksService';

// Async Thunks
export const fetchStudentMarks = createAsyncThunk(
  'marks/fetchStudentMarks',
  async ({ studentId, semester }, { rejectWithValue }) => {
    try {
      const response = await marksService.getStudentMarks(studentId, semester);
      if (response.success) {
        return response;
      }
      return rejectWithValue(response.error || 'Failed to fetch marks');
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message || 'Failed to fetch marks');
    }
  }
);

export const saveMarks = createAsyncThunk(
  'marks/saveMarks',
  async (marksData, { rejectWithValue }) => {
    try {
      const response = await marksService.saveMarks(marksData);
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.error || 'Failed to save marks');
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message || 'Failed to save marks');
    }
  }
);

export const deleteMarks = createAsyncThunk(
  'marks/deleteMarks',
  async (id, { rejectWithValue }) => {
    try {
      const response = await marksService.deleteMarks(id);
      if (response.success) {
        return id;
      }
      return rejectWithValue(response.error || 'Failed to delete marks');
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message || 'Failed to delete marks');
    }
  }
);

const initialState = {
  marks: [],
  gpaStats: {
    gpa: 0,
    totalCredits: 0
  },
  loading: false,
  error: null
};

const marksSlice = createSlice({
  name: 'marks',
  initialState,
  reducers: {
    clearMarksState(state) {
      state.marks = [];
      state.gpaStats = { gpa: 0, totalCredits: 0 };
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch student marks
      .addCase(fetchStudentMarks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentMarks.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.marks = action.payload.data || [];
          state.gpaStats = {
            gpa: action.payload.gpa || 0,
            totalCredits: action.payload.totalCredits || 0
          };
        }
      })
      .addCase(fetchStudentMarks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Save marks
      .addCase(saveMarks.pending, (state) => {
        state.loading = true;
      })
      .addCase(saveMarks.fulfilled, (state, action) => {
        state.loading = false;
        // Update marks roster. Since GPA needs to be re-calculated, we usually refetch student marks.
        // But let's insert or update optimistically if needed.
        const saved = action.payload;
        const exists = state.marks.some(m => m._id === saved._id);
        if (exists) {
          state.marks = state.marks.map(m => m._id === saved._id ? saved : m);
        } else {
          state.marks.push(saved);
        }
      })
      .addCase(saveMarks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete marks
      .addCase(deleteMarks.fulfilled, (state, action) => {
        const id = action.payload;
        state.marks = state.marks.filter(m => m._id !== id);
      });
  }
});

export const { clearMarksState } = marksSlice.actions;
export default marksSlice.reducer;
