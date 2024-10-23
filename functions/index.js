const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
admin.initializeApp();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: functions.config().gmail.email,
    pass: functions.config().gmail.password
  }
});

exports.sendNotificationOnReservation = functions.firestore
  .document('foodDonations/{donationId}')
  .onUpdate(async (change, context) => {
    const newValue = change.after.data();
    const previousValue = change.before.data();

    if (newValue.status === 'reserved' && previousValue.status === 'available') {
      const donorId = previousValue.userId;
      const donorDoc = await admin.firestore().collection('users').doc(donorId).get();
      const donorData = donorDoc.data();
      const donorToken = donorData.fcmToken;
      const donorEmail = donorData.email;

      const recipientId = newValue.reservedBy;
      const recipientDoc = await admin.firestore().collection('users').doc(recipientId).get();
      const recipientData = recipientDoc.data();
      const recipientEmail = recipientData.email;

      // Send push notification
      const message = {
        notification: {
          title: 'Food Item Reserved',
          body: `Your ${previousValue.foodItem} has been reserved!`,
        },
        token: donorToken,
      };

      try {
        await admin.messaging().send(message);
        console.log('Push notification sent successfully');
      } catch (error) {
        console.error('Error sending push notification:', error);
      }

      // Send email to donor
      const donorMailOptions = {
        from: functions.config().gmail.email,
        to: donorEmail,
        subject: 'Your Food Item Has Been Reserved',
        html: `
          <h1>Good news!</h1>
          <p>Your ${previousValue.foodItem} has been reserved by someone in need.</p>
          <p>Please check your Good-Karma app for more details and to arrange the pickup.</p>
        `
      };

      // Send email to recipient
      const recipientMailOptions = {
        from: functions.config().gmail.email,
        to: recipientEmail,
        subject: 'You Have Reserved a Food Item',
        html: `
          <h1>Reservation Confirmed</h1>
          <p>You have successfully reserved ${previousValue.foodItem}.</p>
          <p>Please check your Good-Karma app for more details and to arrange the pickup.</p>
        `
      };

      try {
        await transporter.sendMail(donorMailOptions);
        await transporter.sendMail(recipientMailOptions);
        console.log('Email notifications sent successfully');
      } catch (error) {
        console.error('Error sending email notifications:', error);
      }
    }
  });

exports.sendNotificationOnExpiration = functions.pubsub.schedule('every 24 hours').onRun(async (context) => {
  const now = admin.firestore.Timestamp.now();
  const oneDayFromNow = new admin.firestore.Timestamp(now.seconds + 86400, now.nanoseconds);

  const expiringSoonQuery = await admin.firestore()
    .collection('foodDonations')
    .where('status', '==', 'available')
    .where('expirationDate', '<=', oneDayFromNow)
    .get();

  const notifications = expiringSoonQuery.docs.map(async (doc) => {
    const donation = doc.data();
    const userDoc = await admin.firestore().collection('users').doc(donation.userId).get();
    const userData = userDoc.data();
    const userToken = userData.fcmToken;
    const userEmail = userData.email;

    // Send push notification
    const message = {
      notification: {
        title: 'Food Item Expiring Soon',
        body: `Your ${donation.foodItem} is expiring within 24 hours!`,
      },
      token: userToken,
    };

    try {
      await admin.messaging().send(message);
      console.log('Push notification sent successfully');
    } catch (error) {
      console.error('Error sending push notification:', error);
    }

    // Send email notification
    const mailOptions = {
      from: functions.config().gmail.email,
      to: userEmail,
      subject: 'Your Food Item is Expiring Soon',
      html: `
        <h1>Expiration Alert</h1>
        <p>Your ${donation.foodItem} is expiring within 24 hours!</p>
        <p>Please check your Good-Karma app to update or remove the listing if necessary.</p>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Email notification sent successfully');
    } catch (error) {
      console.error('Error sending email notification:', error);
    }
  });

  await Promise.all(notifications);
});
