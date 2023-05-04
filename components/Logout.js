import React from 'react';
import { View, Text } from 'react-native';
import PropTypes from 'prop-types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Toast } from 'react-native-toast-message/lib/src/Toast';

function Logout({ navigation }) {
  // Make the API request to log the user out
  const logout = async () => {
    const token = await AsyncStorage.getItem('token');
    return fetch('http://localhost:3333/api/1.0.0/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Authorization': token,
      },
    })
      .then(async (response) => {
        if (response.status === 200) {
          // Clear any user-related data that you may have stored in AsyncStorage
          await AsyncStorage.removeItem('whatsthat_user_token');
          await AsyncStorage.removeItem('whatsthat_user_id');
          await AsyncStorage.removeItem('whatsthat_user_password');
          throw new Error('Logged Out');
          // Navigate to the login screen
        } else if (response.status === 401) {
          await AsyncStorage.removeItem('whatsthat_user_token');
          await AsyncStorage.removeItem('whatsthat_user_id');
          await AsyncStorage.removeItem('whatsthat_user_password');
          throw new Error('Logged Out');
        } else {
          throw new Error('Server Error');
        }
      })
      .catch((error) => {
        // handle error response
        if (error.message === 'Unauthorised') {
          Toast.show({
            type: 'error',
            text1: 'Unauthorised',
          });
        } else {
          Toast.show({
            type: 'error',
            text1: error.message,
          });
        }
        navigation.navigate('Login');
      });
  };

  // Call the logout function when the component mounts
  React.useEffect(() => {
    logout();
  }, []);

  return (
    <View>
      <Text>Logging out...</Text>
    </View>
  );
}
Logout.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    replace: PropTypes.func.isRequired,
  }).isRequired,
};

export default Logout;
