import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notifications: []
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification(state, action) {
      // payload: { id, type, message, timestamp }
      state.notifications.unshift(action.payload);
      // Limit to 20 notifications
      if (state.notifications.length > 20) {
        state.notifications.pop();
      }
    },
    clearNotifications(state) {
      state.notifications = [];
    }
  }
});

export const { addNotification, clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
