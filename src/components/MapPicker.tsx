import React, { useRef, useCallback, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Platform, PermissionsAndroid, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import Geolocation from '@react-native-community/geolocation';
import { Navigation } from 'lucide-react-native';

interface MapPickerProps {
  initialLatitude?: number;
  initialLongitude?: number;
  onLocationSelect: (latitude: number, longitude: number) => void;
}

const MapPicker: React.FC<MapPickerProps> = ({
  initialLatitude = 42.4602,  // Default to Nukus, Karakalpakstan
  initialLongitude = 59.6034,
  onLocationSelect,
}) => {
  const webViewRef = useRef<WebView>(null);
  const [isLocating, setIsLocating] = useState(false);

  const handleMessage = useCallback((event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'locationSelected') {
        onLocationSelect(data.lat, data.lng);
      }
    } catch (error) {
      console.error('Error parsing map message:', error);
    }
  }, [onLocationSelect]);

  const requestLocationPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'ios') {
      return true;
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Joylashuv ruxsati',
          message: 'Ilova joriy joylashuvingizni aniqlash uchun GPS dan foydalanishi kerak',
          buttonNeutral: 'Keyinroq',
          buttonNegative: 'Bekor qilish',
          buttonPositive: 'Ruxsat berish',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const getCurrentLocation = async () => {
    setIsLocating(true);

    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      setIsLocating(false);
      Alert.alert('Xato', 'Joylashuvga ruxsat berilmadi');
      return;
    }

    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        // Send location to WebView to update map
        webViewRef.current?.injectJavaScript(`
          map.setView([${latitude}, ${longitude}], 16);
          if (marker) {
            marker.setLatLng([${latitude}, ${longitude}]);
          } else {
            marker = L.marker([${latitude}, ${longitude}], { icon: markerIcon }).addTo(map);
          }
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'locationSelected',
            lat: ${latitude},
            lng: ${longitude}
          }));
          true;
        `);

        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        console.error('Geolocation error:', error);
        Alert.alert('Xato', 'Joylashuvni aniqlab bo\'lmadi. GPS yoqilganligini tekshiring.');
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000
      }
    );
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { width: 100%; height: 100%; overflow: hidden; }
        #map { width: 100%; height: 100%; }
        .custom-marker {
          background: #FF4444;
          border: 3px solid #fff;
          border-radius: 50%;
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        }
        .leaflet-control-attribution { display: none !important; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map', {
          zoomControl: true,
          attributionControl: false,
          doubleClickZoom: false
        }).setView([${initialLatitude}, ${initialLongitude}], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
        }).addTo(map);

        var marker = null;
        var markerIcon = L.divIcon({
          className: 'custom-marker',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        // Add initial marker if coordinates provided
        ${initialLatitude && initialLongitude ? `
          marker = L.marker([${initialLatitude}, ${initialLongitude}], { icon: markerIcon }).addTo(map);
        ` : ''}

        // Handle tap to select location
        map.on('click', function(e) {
          var lat = e.latlng.lat;
          var lng = e.latlng.lng;

          if (marker) {
            marker.setLatLng(e.latlng);
          } else {
            marker = L.marker(e.latlng, { icon: markerIcon }).addTo(map);
          }

          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'locationSelected',
            lat: lat,
            lng: lng
          }));
        });
      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: htmlContent }}
        style={styles.webview}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
      />

      {/* Current Location Button */}
      <TouchableOpacity
        style={[styles.locationButton, isLocating && styles.locationButtonActive]}
        onPress={getCurrentLocation}
        disabled={isLocating}
      >
        <Navigation
          size={22}
          color={isLocating ? '#007AFF' : '#333'}
          fill={isLocating ? '#007AFF' : 'transparent'}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
  },
  locationButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  locationButtonActive: {
    backgroundColor: '#E8F4FD',
  },
});

export default MapPicker;
