import Toast from 'react-native-toast-message';
import 'react-native-gesture-handler';
import React, { Component } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { enGB, registerTranslation } from 'react-native-paper-dates';
import AuthStackNavigator from './navigation/AuthStackNavigator';

registerTranslation('en-GB', enGB);

export default class App extends Component {
  render() {
    return (
      <>
        <NavigationContainer>
          <AuthStackNavigator />
        </NavigationContainer>
        <Toast />
      </>
    );
  }
}
