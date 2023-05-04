import React from 'react';
import { View, Text } from 'react-native';
import PropTypes from 'prop-types';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
          // Navigate to the login screen
          navigation.replace('Login');
        } else if (response.status === 401) {
          await AsyncStorage.removeItem('whatsthat_user_token');
          await AsyncStorage.removeItem('whatsthat_user_id');
          await AsyncStorage.removeItem('whatsthat_user_password');
          navigation.replace('Login');
          throw new Error('Unauthorised');
        } else {
          throw new Error('Server Error');
        }
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
    replace: PropTypes.func.isRequired,
  }).isRequired,
};

export default Logout;
