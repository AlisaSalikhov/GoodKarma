import React, { useState, useEffect } from 'react';
import { auth, firestore } from '../services/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import MapComponent from '../components/MapComponent';
import RatingAndReview from '../components/RatingAndReview';
import Chat from '../components/Chat';

function Donate() {
  const [user, setUser] = useState(null);
  const [foodItem, setFoodItem] = useState('');
  const [quantity, setQuantity] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [foodType, setFoodType] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [userDonations, setUserDonations] = useState([]);
  const [selectedDonation, setSelectedDonation] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        fetchUserDonations(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchUserDonations = async (userId) => {
    const q = query(collection(firestore, 'foodDonations'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const donations = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setUserDonations(donations);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to donate food items.');
      return;
    }

    try {
      const docRef = await addDoc(collection(firestore, 'foodDonations'), {
        userId: user.uid,
        foodItem,
        quantity,
        expirationDate,
        pickupLocation,
        latitude,
        longitude,
        foodType,
        createdAt: serverTimestamp(),
        status: 'available'
      });

      setSuccessMessage('Food item successfully listed for donation!');
      setFoodItem('');
      setQuantity('');
      setExpirationDate('');
      setPickupLocation('');
      setLatitude(null);
      setLongitude(null);
      setFoodType('');

      fetchUserDonations(user.uid);

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error adding document: ', error);
      alert('An error occurred while listing your food item. Please try again.');
    }
  };

  const handleMapClick = (event) => {
    setLatitude(event.latLng.lat());
    setLongitude(event.latLng.lng());
  };

  const handleDonationClick = (donation) => {
    setSelectedDonation(donation);
  };

  if (!user) {
    return <p>Please log in to donate food items.</p>;
  }

  return (
    <div>
      <h2>Donate Food</h2>
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="foodItem">Food Item:</label>
          <input
            type="text"
            id="foodItem"
            value={foodItem}
            onChange={(e) => setFoodItem(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="quantity">Quantity:</label>
          <input
            type="text"
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="expirationDate">Expiration Date:</label>
          <input
            type="date"
            id="expirationDate"
            value={expirationDate}
            onChange={(e) => setExpirationDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="pickupLocation">Pickup Location:</label>
          <input
            type="text"
            id="pickupLocation"
            value={pickupLocation}
            onChange={(e) => setPickupLocation(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="foodType">Food Type:</label>
          <select
            id="foodType"
            value={foodType}
            onChange={(e) => setFoodType(e.target.value)}
            required
          >
            <option value="">Select food type</option>
            <option value="fruits">Fruits</option>
            <option value="vegetables">Vegetables</option>
            <option value="grains">Grains</option>
            <option value="protein">Protein</option>
            <option value="dairy">Dairy</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label>Set Location on Map:</label>
          <MapComponent
            foodItems={[]}
            selectedItem={null}
            userLocation={{ lat: latitude || 0, lng: longitude || 0 }}
            onItemSelect={handleMapClick}
          />
        </div>
        <button type="submit">Donate</button>
      </form>

      <h3>Your Donations</h3>
      {userDonations.length === 0 ? (
        <p>You haven't made any donations yet.</p>
      ) : (
        <ul>
          {userDonations.map((donation) => (
            <li key={donation.id} onClick={() => handleDonationClick(donation)}>
              <h4>{donation.foodItem}</h4>
              <p>Quantity: {donation.quantity}</p>
              <p>Expiration Date: {donation.expirationDate}</p>
              <p>Pickup Location: {donation.pickupLocation}</p>
              <p>Food Type: {donation.foodType}</p>
              <p>Status: {donation.status}</p>
              {donation.status === 'reserved' && (
                <>
                  <RatingAndReview userId={user.uid} itemId={donation.id} isForDonor={true} />
                  <Chat donationId={donation.id} donorId={user.uid} recipientId={donation.reservedBy} />
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      {selectedDonation && (
        <div>
          <h3>Selected Donation Details</h3>
          <p>Food Item: {selectedDonation.foodItem}</p>
          <p>Quantity: {selectedDonation.quantity}</p>
          <p>Expiration Date: {selectedDonation.expirationDate}</p>
          <p>Pickup Location: {selectedDonation.pickupLocation}</p>
          <p>Food Type: {selectedDonation.foodType}</p>
          <p>Status: {selectedDonation.status}</p>
          {selectedDonation.status === 'reserved' && (
            <Chat donationId={selectedDonation.id} donorId={user.uid} recipientId={selectedDonation.reservedBy} />
          )}
        </div>
      )}
    </div>
  );
}

export default Donate;
