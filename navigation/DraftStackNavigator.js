import React, { Component } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import PropTypes from 'prop-types';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DraftList from '../components/DraftList';
import ViewDraft from '../components/ViewDraft';

const styles = StyleSheet.create({
  settingsButtonContainer: {
    marginLeft: 10,
    flexDirection: 'row',
  },
  header: {
    backgroundColor: '#4B0082',
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

const stack = createStackNavigator();
export default class DraftStackNavigator extends Component {
  render() {
    return (
      <stack.Navigator>
        <stack.Screen
          name="DraftList"
          component={DraftList}
          options={{
            title: 'View Drafts',
            headerStyle: styles.header,
            headerTitleStyle: styles.headerText,
            headerTintColor: '#fff',
            headerLeft: () => (
              <TouchableOpacity
                style={styles.settingsButtonContainer}
                onPress={() => { this.props.navigation.goBack(); }}
              >
                <Ionicons name="arrow-back-outline" size={24} color="#fff" />
              </TouchableOpacity>
            ),
          }}
        />
        <stack.Screen
          name="editDraft"
          component={ViewDraft}
          options={{
            title: 'Edit Draft',
            headerStyle: styles.header,
            headerTitleStyle: styles.headerText,
            headerTintColor: '#fff',
            headerLeft: () => (
              <TouchableOpacity
                style={styles.settingsButtonContainer}
                onPress={() => { this.props.navigation.navigate('DraftList'); }}
              >
                <Ionicons name="arrow-back-outline" size={24} color="#fff" />
              </TouchableOpacity>
            ),
          }}
        />

      </stack.Navigator>
    );
  }
}

DraftStackNavigator.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    goBack: PropTypes.func.isRequired,
  }).isRequired,
};
