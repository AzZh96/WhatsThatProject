import 'react-native-gesture-handler';
import React, { Component } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthStackNavigator from './navigation/AuthStackNavigator';
import { enGB, registerTranslation } from 'react-native-paper-dates'
registerTranslation('en-GB', enGB);

export default class App extends Component {
  render() {
    return (
      <NavigationContainer>
        <AuthStackNavigator />
      </NavigationContainer>
    );
  }
}
