import React, { useState, useEffect } from 'react';
import { firestore } from '../services/firebase';
import { collection, addDoc, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';

const RatingAndReview = ({ userId, itemId, isForDonor }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [existingReviews, setExistingReviews] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
    fetchReviews();
  }, [userId, itemId]);

  const fetchReviews = async () => {
    const q = query(collection(firestore, 'reviews'), where(isForDonor ? 'donorId' : 'recipientId', '==', userId), where('itemId', '==', itemId));
    const querySnapshot = await getDocs(q);
    const reviews = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setExistingReviews(reviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(firestore, 'reviews'), {
        [isForDonor ? 'donorId' : 'recipientId']: userId,
        itemId,
        rating,
        review,
        createdAt: new Date()
      });
      setRating(0);
      setReview('');
      fetchReviews();
      await updateUserRating();
      await updateUserReputation();
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  const updateUserRating = async () => {
    const userRef = doc(firestore, 'users', userId);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();
    
    const newTotalRatings = userData.totalRatings + 1;
    const newAverageRating = ((userData.averageRating * userData.totalRatings) + rating) / newTotalRatings;
    
    await updateDoc(userRef, { 
      averageRating: newAverageRating,
      totalRatings: newTotalRatings
    });
  };

  const updateUserReputation = async () => {
    const userRef = doc(firestore, 'users', userId);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();
    
    // Simple reputation calculation: increase for high ratings, decrease for low ratings
    let reputationChange = 0;
    if (rating >= 4) {
      reputationChange = 5;
    } else if (rating <= 2) {
      reputationChange = -5;
    }
    
    const newReputation = Math.max(0, Math.min(100, userData.reputation + reputationChange));
    
    await updateDoc(userRef, { reputation: newReputation });
  };

  return (
    <div className="rating-and-review">
      <h3>{isForDonor ? t('ratingReview.rateDonor') : t('ratingReview.rateRecipient')}</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label>{t('ratingReview.rating')}:</label>
          <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
            <option value="0">{t('ratingReview.selectRating')}</option>
            <option value="1">1 {t('ratingReview.star')}</option>
            <option value="2">2 {t('ratingReview.stars')}</option>
            <option value="3">3 {t('ratingReview.stars')}</option>
            <option value="4">4 {t('ratingReview.stars')}</option>
            <option value="5">5 {t('ratingReview.stars')}</option>
          </select>
        </div>
        <div>
          <label>{t('ratingReview.review')}:</label>
          <textarea value={review} onChange={(e) => setReview(e.target.value)} />
        </div>
        <button type="submit">{t('ratingReview.submitReview')}</button>
      </form>
      <div className="existing-reviews">
        <h4>{t('ratingReview.existingReviews')}</h4>
        {existingReviews.map((review) => (
          <div key={review.id} className="review">
            <p>{t('ratingReview.rating')}: {review.rating} {t('ratingReview.stars')}</p>
            <p>{review.review}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RatingAndReview;
