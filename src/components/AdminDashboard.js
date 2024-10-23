import React, { useState, useEffect } from 'react';
import { firestore, auth } from '../services/firebase';
import { collection, query, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDonations: 0,
    totalReservations: 0,
  });

  useEffect(() => {
    fetchUsers();
    fetchDonations();
    calculateStats();
  }, []);

  const fetchUsers = async () => {
    const usersQuery = query(collection(firestore, 'users'));
    const usersSnapshot = await getDocs(usersQuery);
    const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setUsers(usersList);
  };

  const fetchDonations = async () => {
    const donationsQuery = query(collection(firestore, 'foodDonations'));
    const donationsSnapshot = await getDocs(donationsQuery);
    const donationsList = donationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setDonations(donationsList);
  };

  const calculateStats = async () => {
    const usersCount = users.length;
    const donationsCount = donations.length;
    const reservationsCount = donations.filter(donation => donation.status === 'reserved').length;

    setStats({
      totalUsers: usersCount,
      totalDonations: donationsCount,
      totalReservations: reservationsCount,
    });
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      await deleteDoc(doc(firestore, 'users', userId));
      fetchUsers();
    }
  };

  const handleToggleUserRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    await updateDoc(doc(firestore, 'users', userId), { role: newRole });
    fetchUsers();
  };

  const handleDeleteDonation = async (donationId) => {
    if (window.confirm('Are you sure you want to delete this donation?')) {
      await deleteDoc(doc(firestore, 'foodDonations', donationId));
      fetchDonations();
    }
  };

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      <div className="stats">
        <h3>Statistics</h3>
        <p>Total Users: {stats.totalUsers}</p>
        <p>Total Donations: {stats.totalDonations}</p>
        <p>Total Reservations: {stats.totalReservations}</p>
      </div>
      <div className="user-management">
        <h3>User Management</h3>
        <ul>
          {users.map(user => (
            <li key={user.id}>
              {user.email} - Role: {user.role || 'user'}
              <button onClick={() => handleToggleUserRole(user.id, user.role)}>
                Toggle Role
              </button>
              <button onClick={() => handleDeleteUser(user.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
      <div className="donation-management">
        <h3>Donation Management</h3>
        <ul>
          {donations.map(donation => (
            <li key={donation.id}>
              {donation.foodItem} - Status: {donation.status}
              <button onClick={() => handleDeleteDonation(donation.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AdminDashboard;
