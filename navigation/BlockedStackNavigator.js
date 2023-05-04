import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createStackNavigator } from '@react-navigation/stack';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BlockedContacts from '../components/BlockedContacts';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  settingsButtonContainer: {
    marginLeft: 10,
    flexDirection: 'row',
  },
});

const stack = createStackNavigator();

export default class BlockedStackNavigator extends Component {
  render() {
    return (
      <stack.Navigator>
        <stack.Screen
          name="BlockedNav"
          component={BlockedContacts}
          options={{
            title: 'Blocked List',
            headerLeft: () => (
              <TouchableOpacity
                style={styles.settingsButtonContainer}
                onPress={() => { this.props.navigation.goBack(); }}
              >
                <Ionicons name="arrow-back-outline" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            ),
            headerStyle: {
              backgroundColor: '#4B0082',
            },
            headerTintColor: '#FFFFFF',
          }}
        />
      </stack.Navigator>
    );
  }
}

BlockedStackNavigator.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    goBack: PropTypes.func.isRequired,
  }).isRequired,
};
