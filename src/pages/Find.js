import React, { useState, useEffect } from 'react';
import { firestore, auth } from '../services/firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import MapComponent from '../components/MapComponent';
import RatingAndReview from '../components/RatingAndReview';
import Chat from '../components/Chat';
import SearchAndFilter from '../components/SearchAndFilter';

function Find() {
  const [foodItems, setFoodItems] = useState([]);
  const [filteredFoodItems, setFilteredFoodItems] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    fetchFoodItems();
    getUserLocation();

    return () => unsubscribe();
  }, []);

  const fetchFoodItems = async () => {
    const q = query(collection(firestore, 'foodDonations'), where('status', '==', 'available'));
    const querySnapshot = await getDocs(q);
    const items = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setFoodItems(items);
    setFilteredFoodItems(items);
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting user location:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  const handleReserve = async (itemId) => {
    if (!user) {
      alert('Please log in to reserve food items.');
      return;
    }

    try {
      const itemRef = doc(firestore, 'foodDonations', itemId);
      await updateDoc(itemRef, {
        status: 'reserved',
        reservedBy: user.uid,
        reservedAt: new Date()
      });

      setFilteredFoodItems(filteredFoodItems.map(item => 
        item.id === itemId ? { ...item, status: 'reserved', reservedBy: user.uid } : item
      ));

      alert('Food item reserved successfully!');
    } catch (error) {
      console.error('Error reserving food item: ', error);
      alert('An error occurred while reserving the food item. Please try again.');
    }
  };

  const handleSearch = (searchTerm) => {
    const filtered = foodItems.filter(item => 
      item.foodItem.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredFoodItems(filtered);
  };

  const handleFilter = (filters) => {
    let filtered = [...foodItems];

    if (filters.expirationDate) {
      filtered = filtered.filter(item => 
        new Date(item.expirationDate) >= new Date(filters.expirationDate)
      );
    }

    if (filters.maxDistance && userLocation) {
      filtered = filtered.filter(item => {
        const distance = calculateDistance(userLocation, { lat: item.latitude, lng: item.longitude });
        return distance <= filters.maxDistance;
      });
    }

    if (filters.foodType) {
      filtered = filtered.filter(item => item.foodType === filters.foodType);
    }

    setFilteredFoodItems(filtered);
  };

  const calculateDistance = (point1, point2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLon = (point2.lng - point1.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
  };

  return (
    <div>
      <h2>Find Food</h2>
      <SearchAndFilter onSearch={handleSearch} onFilter={handleFilter} />
      <MapComponent 
        foodItems={filteredFoodItems}
        selectedItem={selectedItem}
        userLocation={userLocation}
        onItemSelect={setSelectedItem}
      />
      {filteredFoodItems.length === 0 ? (
        <p>No food items available matching your search or filters.</p>
      ) : (
        <ul>
          {filteredFoodItems.map((item) => (
            <li key={item.id} onClick={() => setSelectedItem(item)}>
              <h3>{item.foodItem}</h3>
              <p>Quantity: {item.quantity}</p>
              <p>Expiration Date: {item.expirationDate}</p>
              <p>Pickup Location: {item.pickupLocation}</p>
              <p>Food Type: {item.foodType}</p>
              {userLocation && (
                <p>Distance: {calculateDistance(userLocation, { lat: item.latitude, lng: item.longitude }).toFixed(2)} km</p>
              )}
              {item.status === 'available' ? (
                <button onClick={() => handleReserve(item.id)} disabled={!user}>
                  Reserve
                </button>
              ) : (
                <p>Reserved</p>
              )}
              {item.status === 'reserved' && item.reservedBy === user?.uid && (
                <>
                  <RatingAndReview userId={item.userId} itemId={item.id} isForDonor={true} />
                  <Chat donationId={item.id} donorId={item.userId} recipientId={user.uid} />
                </>
              )}
            </li>
          ))}
        </ul>
      )}
      {!user && <p>Please log in to reserve food items.</p>}

      {selectedItem && (
        <div>
          <h3>Selected Item Details</h3>
          <p>Food Item: {selectedItem.foodItem}</p>
          <p>Quantity: {selectedItem.quantity}</p>
          <p>Expiration Date: {selectedItem.expirationDate}</p>
          <p>Pickup Location: {selectedItem.pickupLocation}</p>
          <p>Food Type: {selectedItem.foodType}</p>
          <p>Status: {selectedItem.status}</p>
          {selectedItem.status === 'reserved' && selectedItem.reservedBy === user?.uid && (
            <Chat donationId={selectedItem.id} donorId={selectedItem.userId} recipientId={user.uid} />
          )}
        </div>
      )}
    </div>
  );
}

export default Find;
