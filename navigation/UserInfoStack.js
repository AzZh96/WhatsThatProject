import React, { Component } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import UserInfo from '../components/UserInfo';
import CameraProfile from '../components/CameraProfile';

const Stack = createStackNavigator();

export default class UserInfoStack extends Component {
  render() {
    return (
      <Stack.Navigator>
        <Stack.Screen name="UserInfo" component={UserInfo} options={{ headerShown: false }} />

        <Stack.Screen
          name="CameraProfile"
          component={CameraProfile}
          options={{
            title: 'Upload Profile Picture',
            headerStyle: {
              backgroundColor: '#4B0082',
              height: 47,
              borderBottomWidth: 0,
            },
            headerTintColor: '#fff',
          }}
        />
      </Stack.Navigator>
    );
  }
}
