import React from 'react';
import { GoogleMap, LoadScript, Marker, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';

const MapComponent = ({ foodItems, selectedItem, userLocation, onItemSelect }) => {
  const [directions, setDirections] = React.useState(null);

  const mapContainerStyle = {
    width: '100%',
    height: '400px'
  };

  const center = userLocation || { lat: 0, lng: 0 };

  const directionsCallback = (response) => {
    if (response !== null) {
      if (response.status === 'OK') {
        setDirections(response);
      } else {
        console.log('Directions request failed');
      }
    }
  };

  return (
    <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={10}
      >
        {foodItems.map((item) => (
          <Marker
            key={item.id}
            position={{ lat: item.latitude, lng: item.longitude }}
            onClick={() => onItemSelect(item)}
          />
        ))}

        {selectedItem && userLocation && (
          <DirectionsService
            options={{
              destination: { lat: selectedItem.latitude, lng: selectedItem.longitude },
              origin: userLocation,
              travelMode: 'DRIVING'
            }}
            callback={directionsCallback}
          />
        )}

        {directions && <DirectionsRenderer directions={directions} />}
      </GoogleMap>
    </LoadScript>
  );
};

export default MapComponent;
