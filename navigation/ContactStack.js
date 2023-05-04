import React, { Component } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Contacts from '../components/Contacts';
import SearchStackNavigator from './SearchStackNavigator';
import BlockedStackNavigator from './BlockedStackNavigator';

const Stack = createStackNavigator();

export default class ContactStack extends Component {
  render() {
    return (
      <Stack.Navigator>
        <Stack.Screen
          name="Contacts"
          component={Contacts}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SearchContacts"
          component={SearchStackNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="BlockedContacts"
          component={BlockedStackNavigator}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    );
  }
}
