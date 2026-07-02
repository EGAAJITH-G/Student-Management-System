import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import { addNotification } from '../store/notificationSlice';
import { fetchStudents, fetchAllStudents } from '../store/studentSlice';

let socket = null;

export const initSocket = (dispatch, storeState) => {
  if (socket) return socket;

  // Connect to the backend server. If VITE_API_URL is configured (e.g. on Vercel), use it.
  // Otherwise, default to localhost or local hostname parameters.
  const socketUrl = import.meta.env.VITE_API_URL || 
    (window.location.hostname === 'localhost' 
      ? 'http://localhost:5000' 
      : `${window.location.protocol}//${window.location.hostname}:5000`);

  socket = io(socketUrl, {
    transports: ['websocket', 'polling'],
    autoConnect: true
  });

  socket.on('connect', () => {
    console.log('Real-time notification socket connected:', socket.id);
  });

  socket.on('student_added', (data) => {
    console.log('Real-time Notification: Student added:', data);
    
    // Trigger live green Toastify alert
    const alertMessage = data.bulk 
      ? `Bulk registered ${data.count} new student profiles!`
      : `A new student has been registered: ${data.name}`;

    toast.success(`[Real-Time Alert] ${alertMessage}`, {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      style: { borderLeft: '5px solid #22c55e' } // Custom green color indicator
    });

    // Dispatch to notifications slice
    dispatch(addNotification({
      id: `add-${data._id || Date.now()}`,
      type: 'CREATE',
      message: data.bulk 
        ? `Bulk registered ${data.count} new student profiles`
        : `A new student has been registered: ${data.name} (${data.course})`,
      timestamp: new Date().toISOString()
    }));

    // Trigger redux store reload to refresh data
    dispatch(fetchAllStudents());
    // Get the current page parameters to refresh grid
    const state = storeState();
    const { searchQuery, filterCourse, sortMethod, currentPage } = state.students;
    dispatch(fetchStudents({
      search: searchQuery,
      course: filterCourse,
      sortBy: sortMethod,
      page: currentPage,
      limit: 10
    }));
  });

  socket.on('student_deleted', (data) => {
    console.log('Real-time Notification: Student deleted:', data);

    // Trigger live toast alert
    toast.info(`[Real-Time Alert] A student record has been deleted: ${data.name}`, {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true
    });

    // Dispatch to notifications slice
    dispatch(addNotification({
      id: `delete-${data._id || Date.now()}`,
      type: 'DELETE',
      message: `Student record deleted: ${data.name}`,
      timestamp: new Date().toISOString()
    }));

    // Trigger redux store reload to refresh data
    dispatch(fetchAllStudents());
    // Get current page parameters to refresh grid
    const state = storeState();
    const { searchQuery, filterCourse, sortMethod, currentPage } = state.students;
    dispatch(fetchStudents({
      search: searchQuery,
      course: filterCourse,
      sortBy: sortMethod,
      page: currentPage,
      limit: 10
    }));
  });

  socket.on('disconnect', () => {
    console.log('Real-time notification socket disconnected');
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
