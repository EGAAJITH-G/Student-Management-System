import React from 'react';
import styles from './Skeleton.module.css';

const Skeleton = ({ type = 'text', count = 1, className = '' }) => {
  const getSkeletonClass = () => {
    switch (type) {
      case 'avatar':
        return styles.avatar;
      case 'title':
        return styles.title;
      case 'card':
        return styles.card;
      case 'table-row':
        return styles.tableRow;
      case 'rect':
        return styles.rect;
      case 'text':
      default:
        return styles.text;
    }
  };

  const renderSingle = (index) => (
    <div
      key={index}
      className={`${styles.skeleton} ${getSkeletonClass()} ${className}`}
    />
  );

  return (
    <>
      {Array.from({ length: count }).map((_, idx) => renderSingle(idx))}
    </>
  );
};

export default Skeleton;
