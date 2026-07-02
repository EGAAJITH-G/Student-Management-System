import React, { useState, useEffect } from 'react';
import { GraduationCap, ShieldCheck } from 'lucide-react';
import styles from './Preloader.module.css';

const Preloader = () => {
  const [loadingText, setLoadingText] = useState('Initializing EduPortal...');
  const [progress, setProgress] = useState(0);

  const loadingSteps = [
    'Establishing Secure SSL Handshake...',
    'Verifying Cryptographic Credentials...',
    'Synchronizing Student Registry Database...',
    'Fetching Weighted GPA Analytics Sheets...',
    'Applying Role-Based Access Controls...',
    'EduPortal Core Console Ready!'
  ];

  useEffect(() => {
    // Cycle through loading steps text
    let stepIndex = 0;
    const textInterval = setInterval(() => {
      if (stepIndex < loadingSteps.length - 1) {
        stepIndex++;
        setLoadingText(loadingSteps[stepIndex]);
      }
    }, 800);

    // Increment progress bar smoothly
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        const diff = Math.floor(Math.random() * 15) + 5;
        return Math.min(prev + diff, 100);
      });
    }, 200);

    return () => {
      clearInterval(textInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className={styles.preloaderContainer}>
      <div className={styles.loaderContent}>
        {/* Pulsing Glowing Logo Badge */}
        <div className={styles.logoOuterGlow}>
          <div className={styles.logoBadge}>
            <GraduationCap className={styles.logoIcon} />
          </div>
        </div>

        {/* Central Brand Header */}
        <div className={styles.brandTitleArea}>
          <h1 className={styles.brandName}>EduPortal</h1>
          <p className={styles.brandSubtitle}>Institutional Management Console</p>
        </div>

        {/* Shimmering Progress Bar */}
        <div className={styles.progressContainer}>
          <div 
            className={styles.progressBar} 
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Animated Loading Steps */}
        <div className={styles.statusArea}>
          <div className={styles.statusIconWrapper}>
            <ShieldCheck className={styles.statusIcon} />
          </div>
          <span className={styles.loadingText}>{loadingText}</span>
        </div>
      </div>

      {/* Decorative footer credentials */}
      <div className={styles.footer}>
        <span>Secure JWT & SSL Certified Session</span>
      </div>
    </div>
  );
};

export default Preloader;
