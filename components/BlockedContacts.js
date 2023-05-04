/* eslint-disable class-methods-use-this */
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PropTypes from 'prop-types';
import Toast from 'react-native-toast-message';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    padding: 20,
  },
  containerPopup: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  popupContact: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    width: '70%',
    top: -100,
  },
  button: {
    backgroundColor: '#4B0082',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  circle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E9E2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#4B0082',
  },
  initials: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4B0082',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 14,
  },
  itemText: {
    fontSize: 16,
    marginBottom: 10,
  },
  details: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  contact: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#4B0082',
    paddingBottom: 10,
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
  errorContainer: {
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default class BlockedContacts extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      blockedUsers: [],
      selectedContact: null,
      unblockActionVisible: false,
    };
  }

  async componentDidMount() {
    const { navigation } = this.props;
    this.unsubscribe = navigation.addListener('focus', () => {
      this.checkedLoggedIn();
      this.refreshBlockedList();
    });
    await this.checkedLoggedIn();
    this.setState({
      isLoading: false,
    });
    const token = await AsyncStorage.getItem('whatsthat_user_token');

    const blockedUrl = 'http://localhost:3333/api/1.0.0/blocked';
    fetch(blockedUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Authorization': token,
      },
    })
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        } if (response.status === 401) {
          throw new Error('Unauthorised');
        } else {
          throw new Error('Something went wrong while fetching blocked users.');
        }
      })
      .then((responseJson) => {
        // handle success response
        this.setState({
          isLoading: false,
          blockedUsers: responseJson,
          unblockActionVisible: false,
          selectedContact: null,
        });
      })
      .catch((error) => {
        // handle error response
        this.setState({
          unblockActionVisible: false,
          selectedContact: null,
        });
        if (error.message === 'Unauthorised') {
          Toast.show({
            type: 'error',
            text1: 'Unauthorised',
          });
          this.props.navigation.navigate('Login');
        } else {
          Toast.show({
            type: 'error',
            text1: error.message,
          });
        }
        this.setState({ isLoading: false });
      });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  async handleUnblockContact(contact) {
    const token = await AsyncStorage.getItem('whatsthat_user_token');
    const { blockedUsers } = this.state;
    const { navigation } = this.props;
    // Make the API call to remove the contact
    fetch(`http://localhost:3333/api/1.0.0/user/${contact.user_id}/block`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-Authorization': token,
      },
    })
      .then((response) => {
        if (response.status === 200) {
          // Update the blockedUsers state and save to AsyncStorage
          const updatedBlockedUsers = blockedUsers.filter(
            (userId) => userId !== contact.user_id,
          );
          AsyncStorage.setItem(
            'whatsthat_blocked_users',
            JSON.stringify(updatedBlockedUsers),
          );
          this.setState({
            blockedUsers: updatedBlockedUsers,
            unblockActionVisible: false,
            selectedContact: null,
          });
          Toast.show({
            type: 'success',
            text1: 'User unblocked',
          });
          this.refreshBlockedList();
        } else if (response.status === 400) {
          throw new Error('You cannot unblock yourself.');
        } else if (response.status === 401) {
          throw new Error('You are not authorised to perform this action.');
        } else if (response.status === 404) {
          throw new Error('Something went wrong while fetching blocked users.');
        } else {
          throw new Error('Something went wrong while fetching blocked users.');
        }
      })
      .catch((error) => {
        // handle error response
        this.setState({
          unblockActionVisible: false,
          selectedContact: null,
        });
        if (error.message === 'Unauthorised') {
          Toast.show({
            type: 'error',
            text1: 'Unauthorised',
          });
          navigation.navigate('Login');
        } else {
          Toast.show({
            type: 'error',
            text1: error.message,
          });
        }
        this.setState({ isLoading: false });
      });
  }

  handleCancel() {
    this.setState({
      unblockActionVisible: false,
      selectedContact: null,
    });
  }

  static getFirstLetter(str) {
    return str.charAt(0);
  }

  async checkedLoggedIn() {
    const { navigation } = this.props;
    const value = await AsyncStorage.getItem('whatsthat_user_token');
    if (value == null) {
      navigation.navigate('Login');
    }
  }

  async refreshBlockedList() {
    const token = await AsyncStorage.getItem('whatsthat_user_token');
    const { navigation } = this.props;
    const blockedUrl = 'http://localhost:3333/api/1.0.0/blocked';
    return fetch(blockedUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Authorization': token,
      },
    })
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        } if (response.status === 401) {
          throw new Error('Unauthorised');
        } else {
          throw new Error('Something went wrong while fetching blocked users.');
        }
      })
      .then((responseJson) => {
        this.setState({
          isLoading: false,
          blockedUsers: responseJson,
          unblockActionVisible: false,
          selectedContact: null,
        });
      })
      .catch((error) => {
        // handle error response
        this.setState({
          unblockActionVisible: false,
          selectedContact: null,
        });
        if (error.message === 'Unauthorised') {
          Toast.show({
            type: 'error',
            text1: 'Unauthorised',
          });
          navigation.navigate('Login');
        } else {
          Toast.show({
            type: 'error',
            text1: error.message,
          });
        }
        this.setState({ isLoading: false });
      });
  }

  render() {
    const {
      isLoading,
      blockedUsers,
      selectedContact,
      unblockActionVisible,
    } = this.state;
    return (
      <View style={styles.container}>
        {isLoading ? (
          <View>
            <ActivityIndicator size="large" color="#4B0082" />
          </View>
        ) : (
          blockedUsers.map((contact) => (
            <TouchableOpacity
              key={contact.user_id}
              style={styles.contact}
              onPress={() => {
                this.setState({
                  unblockActionVisible: true,
                  selectedContact: contact,
                });
              }}
            >
              <View style={styles.circle}>
                <Text style={styles.initials}>
                  {contact.first_name
                    ? BlockedContacts.getFirstLetter(contact.first_name)
                    : 'UU'}
                </Text>
              </View>
              <View style={styles.details}>
                <Text style={styles.name}>
                  {contact.first_name}
                  {' '}
                  {contact.last_name}
                </Text>
                <Text style={styles.email}>{contact.email}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
        <Modal
          visible={unblockActionVisible}
          animationType="fade"
          transparent
        >
          <View style={styles.containerPopup}>
            <View style={styles.popupContact}>
              <TouchableOpacity
                onPress={() => this.handleUnblockContact(selectedContact)}
                style={styles.button}
              >
                <Text style={styles.buttonText}>Unblock Contact</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={this.handleCancel}
                style={styles.button}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </View>
    );
  }
}
BlockedContacts.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    addListener: PropTypes.func.isRequired,
  }).isRequired,
};
