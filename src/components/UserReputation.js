import React from 'react';
import { useTranslation } from 'react-i18next';

const UserReputation = ({ reputation, averageRating, totalRatings }) => {
  const { t } = useTranslation();

  const getReputationLevel = (reputation) => {
    if (reputation >= 90) return t('reputation.excellent');
    if (reputation >= 70) return t('reputation.good');
    if (reputation >= 50) return t('reputation.fair');
    return t('reputation.poor');
  };

  return (
    <div className="user-reputation">
      <h3>{t('reputation.title')}</h3>
      <p>{t('reputation.score')}: {reputation}</p>
      <p>{t('reputation.level')}: {getReputationLevel(reputation)}</p>
      <p>{t('reputation.averageRating')}: {averageRating.toFixed(1)} ({totalRatings} {t('reputation.ratings')})</p>
    </div>
  );
};

export default UserReputation;
