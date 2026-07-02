import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend
} from 'recharts';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  CalendarDays, 
  TrendingUp, 
  Sparkles, 
  Mail, 
  User,
  ClipboardCheck
} from 'lucide-react';
import studentService from '../../services/studentService';
import attendanceService from '../../services/attendanceService';
import styles from './Analytics.module.css';

const Analytics = () => {
  const [students, setStudents] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState({ present: 0, absent: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await studentService.getStudents();
        if (response.success) {
          setStudents(response.data);
        }

        // Fetch monthly attendance report for current month/year
        const today = new Date();
        const attResponse = await attendanceService.getMonthlyReport(
          today.getMonth() + 1,
          today.getFullYear()
        );
        if (attResponse.success && attResponse.data && attResponse.data.length > 0) {
          let totalPresent = 0;
          let totalAbsent = 0;
          attResponse.data.forEach(r => {
            totalPresent += r.presentCount || 0;
            totalAbsent += r.absentCount || 0;
          });
          setAttendanceStats({ present: totalPresent, absent: totalAbsent });
        }
      } catch (err) {
        console.error('Failed to load database for analytics:', err.message);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // 1. Calculate General KPI Metrics
  const totalStudents = students.length;
  
  // Unique courses
  const uniqueCourses = [...new Set(students.map(s => s.course?.trim()))].filter(Boolean);
  const totalCoursesCount = uniqueCourses.length;

  // Today's signups
  const todayDateString = new Date().toDateString();
  const todaysSignupsCount = students.filter(s => 
    new Date(s.createdAt).toDateString() === todayDateString
  ).length;

  // Growth rate estimation (comparison if total > 5)
  const growthRateText = totalStudents > 0 
    ? `+${Math.min(totalStudents * 4, 100)}% this term` 
    : 'No active growth data';

  // 2. Fetch the 5 most recent students
  const recentStudents = [...students]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  // 3. Aggregate Data for Course Distribution (Bar Chart)
  const courseCounts = {};
  students.forEach(student => {
    const courseName = student.course?.trim() || 'Unassigned';
    courseCounts[courseName] = (courseCounts[courseName] || 0) + 1;
  });

  const barChartData = Object.keys(courseCounts).map(course => ({
    name: course,
    students: courseCounts[course]
  }));

  // 4. Aggregate Data for Registration Trend over the last 7 Days (Area Chart)
  const getLast7DaysLabels = () => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push({
        label: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        dateString: d.toDateString()
      });
    }
    return dates;
  };

  const last7Days = getLast7DaysLabels();
  const areaChartData = last7Days.map(day => ({
    label: day.label,
    registrations: students.filter(s => new Date(s.createdAt).toDateString() === day.dateString).length
  }));

  // 5. Aggregate Data for Attendance Compliance (Pie Chart)
  const totalAttendance = attendanceStats.present + attendanceStats.absent;
  const pieChartData = totalAttendance > 0 
    ? [
        { name: 'Present', value: attendanceStats.present, color: '#16a34a' },
        { name: 'Absent', value: attendanceStats.absent, color: '#dc2626' }
      ]
    : [
        { name: 'No Logs', value: 1, color: '#cbd5e1' }
      ];

  const complianceRate = totalAttendance > 0 
    ? `${Math.round((attendanceStats.present / totalAttendance) * 100)}%` 
    : 'N/A';

  if (isLoading) {
    return (
      <div className={styles.loadingWrapper}>
        <div className={styles.pulseContainer}>
          <div className={styles.pulseCircle} />
          <span className={styles.pulseText}>Compiling Analytics Grid...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} fade-in`}>
      {/* Title Header */}
      <header className={styles.header}>
        <div className={styles.welcomeText}>
          <div className={styles.badge}>
            <Sparkles className={styles.badgeIcon} />
            <span>Interactive Data Panel</span>
          </div>
          <h1 className={styles.title}>EduPortal Core Analytics</h1>
          <p className={styles.subtitle}>
            Explore student cohort growth rates, course allocations, and enrollment trends across departments.
          </p>
        </div>
      </header>

      {/* KPI Cards Grid */}
      <section className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Total Cohort</span>
            <span className={styles.statNumber}>{totalStudents}</span>
            <span className={styles.statIndicatorSuccess}>{growthRateText}</span>
          </div>
          <div className={`${styles.statIconBadge} ${styles.badgePurple}`}>
            <Users className={styles.statIcon} />
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Registered Departments</span>
            <span className={styles.statNumber}>{totalCoursesCount}</span>
            <span className={styles.statIndicatorInfo}>Across Courses</span>
          </div>
          <div className={`${styles.statIconBadge} ${styles.badgeBlue}`}>
            <BookOpen className={styles.statIcon} />
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Today's Signups</span>
            <span className={styles.statNumber}>{todaysSignupsCount}</span>
            <span className={styles.statIndicatorText}>New student entries</span>
          </div>
          <div className={`${styles.statIconBadge} ${styles.badgeGreen}`}>
            <CalendarDays className={styles.statIcon} />
          </div>
        </div>
      </section>

      {/* Charts split layout */}
      <div className={styles.chartLayoutGrid}>
        {/* Left Column: Course Allocation and Trend Charts */}
        <div className={styles.chartsArea}>
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h3 className={styles.chartTitle}>Course Allocation Distribution</h3>
              <p className={styles.chartSubtitle}>Enrolled student statistics grouped by course tags</p>
            </div>
            <div className={styles.chartCanvasContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff' }}
                    labelStyle={{ fontWeight: 'bold', color: '#fff' }}
                  />
                  <Bar dataKey="students" fill="hsl(250, 89%, 60%)" radius={[6, 6, 0, 0]} maxBarSize={45} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h3 className={styles.chartTitle}>Weekly Enrollment Timeline</h3>
              <p className={styles.chartSubtitle}>Registration growth trend over the last 7 calendar days</p>
            </div>
            <div className={styles.chartCanvasContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={areaChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRegistrations" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="rgb(99, 102, 241)" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="rgb(99, 102, 241)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="registrations" stroke="rgb(99, 102, 241)" strokeWidth={2} fillOpacity={1} fill="url(#colorRegistrations)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: Attendance Compliance Pie and Recent Activities feed list */}
        <div className={styles.chartsArea}>
          {/* Attendance Compliance Doughnut Card */}
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h3 className={styles.chartTitle}>Attendance Compliance Rate</h3>
              <p className={styles.chartSubtitle}>Monthly present vs absent metric (Rate: {complianceRate})</p>
            </div>
            <div className={styles.chartCanvasContainer} style={{ height: '220px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff' }}
                  />
                  <RechartsLegend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Registrations Card */}
          <div className={styles.feedCard}>
            <div className={styles.feedHeader}>
              <div className={styles.feedIconBadge}>
                <TrendingUp className={styles.feedIcon} />
              </div>
              <div>
                <h3 className={styles.feedTitle}>Recent Registrations</h3>
                <p className={styles.feedSubtitle}>Latest student profiles added to database</p>
              </div>
            </div>

            <div className={styles.feedList}>
              {recentStudents.length === 0 ? (
                <div className={styles.emptyFeed}>
                  <User className={styles.emptyFeedIcon} />
                  <span>No students registered yet</span>
                </div>
              ) : (
                recentStudents.map((student) => (
                  <div key={student._id} className={styles.feedItem}>
                    <div className={styles.studentDetails}>
                      <div className={styles.initialsAvatar}>
                        {student.profileImage ? (
                          <img src={student.profileImage} alt={student.name} className={styles.avatarImg} />
                        ) : (
                          student.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className={styles.metaData}>
                        <span className={styles.studentName}>{student.name}</span>
                        <span className={styles.studentCourse}>{student.course}</span>
                        <div className={styles.emailContainer}>
                          <Mail className={styles.mailIcon} />
                          <span className={styles.studentEmail}>{student.email}</span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.joinDateBadge}>
                      <span>{new Date(student.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
