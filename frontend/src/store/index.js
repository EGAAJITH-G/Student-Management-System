import { configureStore } from '@reduxjs/toolkit';
import studentReducer from './studentSlice';
import marksReducer from './marksSlice';
import notificationReducer from './notificationSlice';

export const store = configureStore({
  reducer: {
    students: studentReducer,
    marks: marksReducer,
    notifications: notificationReducer
  }
});

export default store;
