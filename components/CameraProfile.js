import React, { useState, useCallback, useEffect } from 'react';
import {
  Camera, CameraType,
  requestCameraPermissionsAsync,
} from 'expo-camera';
import {
  StyleSheet, View, TouchableOpacity, Text, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PropTypes from 'prop-types';
import { Toast } from 'react-native-toast-message/lib/src/Toast';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  camera: {
    width: '100%',
    height: '100%',
  },
  buttonBar: {

    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4B0082',
    height: 100,
  },
  button: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 50,
  },
});

export default function CameraProfile({ navigation }) {
  const [type, setType] = useState(CameraType.back);
  const [camera, setCamera] = useState(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(null);

  useEffect(() => {
    (async () => {
      const { status: cameraStatus } = await requestCameraPermissionsAsync();
      setHasCameraPermission(cameraStatus === 'granted');
    })();
  }, []);

  const toggleCameraType = useCallback(() => {
    setType((current) => (current === CameraType.back ? CameraType.front : CameraType.back));
  }, []);

  async function sendToServer(data) {
    const token = await AsyncStorage.getItem('whatsthat_user_token');
    const id = await AsyncStorage.getItem('whatsthat_user_id');
    const res = await fetch(data.base64);
    const blob = await res.blob();
    return fetch(`http://localhost:3333/api/1.0.0/user/${id}/photo`, {
      method: 'POST',
      headers: {
        'X-Authorization': token,
        'Content-Type': 'image/png',
      },
      body: blob,
    })
      .then((response) => {
        if (response.status === 200) {
          return response.blob();
        } if (response.status === 400) {
          throw new Error('Bad Request');
        } else if (response.status === 401) {
          throw new Error('Unauthorised');
        } else if (response.status === 403) {
          throw new Error('Forbidden');
        } else if (response.status === 404) {
          throw new Error('Something went wrong while taking profile picture.');
        } else {
          throw new Error('Something went wrong while taking profile picture.');
        }
      })
      .then(() => {
        navigation.navigate('UserInfo');
      })
      .catch((error) => {
        // handle error response
        if (error.message === 'Unauthorised') {
          Toast.show({
            type: 'error',
            text1: 'Unauthorised',
          });
          navigation.navigate('Login');
        } else if (error.message === 'Forbidden') {
          Toast.show({
            type: 'error',
            text1: 'Forbidden',
          });
          navigation.navigate('Login');
        } else {
          Toast.show({
            type: 'error',
            text1: error.message,
          });
        }
      });
  }

  const takePhoto = useCallback(async () => {
    if (camera && hasCameraPermission) {
      const options = { quality: 0.5, base64: true };
      const data = await camera.takePictureAsync(options);
      sendToServer(data);
    }
  }, [camera, hasCameraPermission, sendToServer]);

  if (hasCameraPermission === null) {
    return (
      <View>
        <ActivityIndicator size="large" color="#4B0082" />
      </View>
    );
  }
  if (hasCameraPermission === false) {
    return <Text>No access to camera or media library</Text>;
  }
  return (
    <View style={styles.container}>
      <View style={styles.cameraContainer}>
        <Camera style={styles.camera} type={type} ref={(ref) => setCamera(ref)} />
      </View>
      <View style={styles.buttonBar}>
        <TouchableOpacity style={styles.button} onPress={takePhoto}>
          <Ionicons name="camera-outline" size={35} color="#4B0082" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={toggleCameraType}>
          <Ionicons name="camera-reverse-outline" size={35} color="#4B0082" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

CameraProfile.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    addListener: PropTypes.func.isRequired,
  }).isRequired,
};
