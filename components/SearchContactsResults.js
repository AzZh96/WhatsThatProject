/* eslint-disable camelcase */
import React, { Component } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
} from 'react-native';
import PropTypes from 'prop-types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Toast } from 'react-native-toast-message/lib/src/Toast';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  itemContainer: {
    backgroundColor: '#FAF5FF',
    padding: 20,
    marginBottom: 10,
    borderRadius: 5,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#4B0082',
  },
  itemEmail: {
    fontSize: 16,
    color: '#555',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  containerPopup: {
    zIndex: 9999,
    top: 250,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  popup: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    width: '100%',
    position: 'relative',
    bottom: 0,
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

export default class SearchContactResults extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: [],
      isLoading: true,
      contactActionsVisible: false,
      selectedContact: null,
      addedUsers: [],
      loggedInUserId: '',
    };
  }

  async componentDidMount() {
    const {
      q, search_in, limit, offset,
    } = this.props;
    const token = await AsyncStorage.getItem('whatsthat_user_token');
    this.state.loggedInUserId = await AsyncStorage.getItem('whatsthat_user_id');
    // Define the URLs for the three API endpoints
    const searchUrl = `http://localhost:3333/api/1.0.0/search?q=${q}&search_in=${search_in}&limit=${limit}&offset=${offset}`;
    const contactsUrl = 'http://localhost:3333/api/1.0.0/contacts';
    const blockedUrl = 'http://localhost:3333/api/1.0.0/blocked';

    // Make the three fetch requests simultaneously and parse the responses as JSON
    Promise.all([
      fetch(searchUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Authorization': token,
        },
      }),
      fetch(contactsUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Authorization': token,
        },
      }),
      fetch(blockedUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Authorization': token,
        },
      }),
    ])
      .then((responses) => Promise.all(responses.map((response) => {
        if (response.status === 200) {
          return response.json();
        } if (response.status === 400) {
          throw new Error('Unauthorised/Bad Request');
        } else if (response.status === 401) {
          throw new Error('Unauthorised');
        } else {
          throw new Error('Something went wrong when searching for contacts.');
        }
      })))
      .then(([searchResponse, contactsResponse, blockedResponse]) => {
        const blockedUsers = blockedResponse.map(
          (blockedUser) => blockedUser.user_id,
        );
        const data = searchResponse
          .filter((contact) => !blockedUsers.includes(contact.user_id))
          .map((contact) => ({
            ...contact,
          }));
        this.setState({
          data,
          isLoading: false,
          addedUsers: contactsResponse,
        });
      })
      .catch((error) => {
        // handle error response
        if (error.message === 'Unauthorised') {
          Toast.show({
            type: 'error',
            text1: 'Unauthorised',
          });
          this.props.navigation.navigate('Login');
        } else if (error.message === 'Unauthorised/Bad Request') {
          Toast.show({
            type: 'error',
            text1: 'Unauthorised/Bad Request',
          });
          this.props.navigation.navigate('Login');
        } else {
          Toast.show({
            type: 'error',
            text1: error.message,
          });
        }
      });
  }

  handleAddContact = async (contact) => {
    const token = await AsyncStorage.getItem('whatsthat_user_token');
    const { addedUsers } = this.state;

    // Make the API call to add the contact
    fetch(`http://localhost:3333/api/1.0.0/user/${contact.user_id}/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Authorization': token,
      },
    })
      .then((response) => {
        if (response.status === 200) {
          const updatedAddedUsers = [...addedUsers, contact];
          this.setState({
            addedUsers: updatedAddedUsers,
            contactActionsVisible: false,
            selectedContact: null,
          });
          Toast.show({
            type: 'success',
            text1: 'User Added to Contacts',
          });
        } else if (response.status === 400) {
          throw new Error('You cant add yourself.');
        } else if (response.status === 401) {
          throw new Error('Unauthorised');
        } else if (response.status === 404) {
          throw new Error('Not Found.');
        } else {
          throw new Error('Something went wrong when adding contact.');
        }
      })
      .catch((error) => {
        this.setState({
          contactActionsVisible: false,
          selectedContact: null,
        });
        // handle error response
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
      });
  };

  handleRemoveContact = async (contact) => {
    const token = await AsyncStorage.getItem('whatsthat_user_token');
    const { addedUsers } = this.state;

    // Make the API call to remove the contact
    fetch(`http://localhost:3333/api/1.0.0/user/${contact.user_id}/contact`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-Authorization': token,
      },
    })
      .then((response) => {
        if (response.status === 200) {
          const updatedAddedUsers = addedUsers.filter(
            (user) => user.user_id !== contact.user_id,
          );
          this.setState({
            addedUsers: updatedAddedUsers,
            contactActionsVisible: false,
            selectedContact: null,
          });
          Toast.show({
            type: 'success',
            text1: 'User Removed from Contacts',
          });
        } else if (response.status === 400) {
          throw new Error('You cant remove yourself.');
        } else if (response.status === 401) {
          throw new Error('Unauthorised');
        } else if (response.status === 404) {
          throw new Error('Not Found.');
        } else {
          throw new Error('Something went wrong when removing contact.');
        }
      })
      .catch((error) => {
        this.setState({
          contactActionsVisible: false,
          selectedContact: null,
        });
        // handle error response
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
      });
  };

  handleCancel = () => {
    this.setState({
      contactActionsVisible: false,
      selectedContact: null,
    });
  };

  render() {
    const {
      data,
      isLoading,
      contactActionsVisible,
      selectedContact,
      addedUsers,
    } = this.state;
    const isContactAdded = addedUsers.find((user) => user.user_id === selectedContact?.user_id)
      !== undefined;

    return (
      <View style={styles.container}>
        {isLoading ? (
          <Text>Loading...</Text>
        ) : (
          <FlatList
            data={data}
            keyExtractor={(item) => item.user_id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  if (item.user_id !== this.state.loggedInUserId) {
                    this.setState({
                      contactActionsVisible: true,
                      selectedContact: item,
                    });
                  }
                }}
                disabled={
              item.user_id.toString()
              === this.state.loggedInUserId.toString()
            }
                style={styles.itemContainer}
              >
                <Text style={styles.itemName}>
                  {item.given_name}
                  {' '}
                  {item.family_name}
                </Text>
                <Text style={styles.itemEmail}>
                  {item.email}
                </Text>
              </TouchableOpacity>
            )}
          />
        )}

        <Modal visible={contactActionsVisible} animationType="fade" transparent>
          <View style={styles.containerPopup}>
            <View style={styles.popup}>
              {isContactAdded ? (
                <Text>Contact already added</Text>
              ) : (
                <TouchableOpacity
                  onPress={() => this.handleAddContact(selectedContact)}
                  style={styles.button}
                >
                  <Text style={styles.buttonText}>Add Contact</Text>
                </TouchableOpacity>
              )}
              {isContactAdded && (
                <TouchableOpacity
                  onPress={() => this.handleRemoveContact(selectedContact)}
                  style={styles.button}
                >
                  <Text style={styles.buttonText}>Remove Contact</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={this.handleCancel}
                style={styles.button}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity
            style={styles.modalOverlay}
            onPress={() => {
              this.setState({ contactActionsVisible: false });
            }}
          />
        </Modal>
      </View>
    );
  }
}

SearchContactResults.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
  q: PropTypes.string.isRequired,
  search_in: PropTypes.string.isRequired,
  limit: PropTypes.number.isRequired,
  offset: PropTypes.number.isRequired,
};
