import React, { Component } from 'react';
import {
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
} from 'react-native';
import PropTypes from 'prop-types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Toast } from 'react-native-toast-message/lib/src/Toast';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FAF5FF',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    padding: 20,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#4B0082',
    paddingBottom: 14.5,
    paddingLeft: 14.5,
    paddingRight: 14.5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  lastMessageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 10,
  },
  lastMessage: {
    fontSize: 14,
    marginRight: 10,
  },
  timestamp: {
    color: 'gray',
  },
  modalOverlay: {
    flex: 1,
    width: '100%',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  popupChat: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#4B0082',
  },
  textInput: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    width: '100%',
  },
  createGroupButton: {
    backgroundColor: '#4B0082',
    borderRadius: 5,
    padding: 10,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  createGroupButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  containerPopup: {
    top: 250,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  itemText: {
    fontSize: 16,
    marginBottom: 10,
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  chatButtonContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  chatButton: {
    width: 70,
    height: 70,
    borderRadius: 60,
    backgroundColor: '#4B0082',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E9E2F7',
  },
  initials: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4B0082',
  },
  details: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    marginTop: 5,
  },
  chat: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#4B0082',
    paddingBottom: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4B0082',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 22,
    borderRadius: 4,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#008080',
  },
  error: {
    alignItems: 'center',
    justifyContent: 'center',
    color: 'red',
    fontWeight: '900',
  },
});

export default class Chats extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      chats: [],
      newChatModalVisible: false,
      newChatName: '',
    };
  }

  async componentDidMount() {
    const { navigation } = this.props;
    this.unsubscribe = navigation.addListener('focus', () => {
      this.checkedLoggedIn();
      this.refreshChats();
    });
    await this.checkedLoggedIn();
    this.setState({
      isLoading: false,
    });
    this.refreshChats();
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  checkedLoggedIn = async () => {
    const value = await AsyncStorage.getItem('whatsthat_user_token');
    if (value == null) {
      this.props.navigation.navigate('Login');
    } else {
      this.refreshChats();
    }
  };

  async refreshChats() {
    const token = await AsyncStorage.getItem('whatsthat_user_token');
    return fetch('http://localhost:3333/api/1.0.0/chat', {
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
          throw new Error('Something went wrong when updating chats.');
        }
      })
      .then((responseJson) => {
        this.setState({
          isLoading: false,
          chats: responseJson,
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
        } else {
          Toast.show({
            type: 'error',
            text1: error.message,
          });
        }
      });
  }

  async newChat() {
    const token = await AsyncStorage.getItem('whatsthat_user_token');
    const { newChatName } = this.state;

    return fetch('http://localhost:3333/api/1.0.0/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Authorization': token,
      },
      body: JSON.stringify({ name: newChatName }),
    })
      .then((response) => {
        if (response.status === 201) {
          this.setState({
            newChatModalVisible: false,
          });
          Toast.show({
            type: 'success',
            text1: 'Chat created successfully',
          });
          return response.json();
        } if (response.status === 400) {
          throw new Error('Bad Request.');
        } else if (response.status === 401) {
          throw new Error('Unauthorised');
        } else {
          throw new Error('Something went wrong while creating a new chat.');
        }
      })
      .then(() => {
        this.setState({
          newChatModalVisible: false,
          newChatName: '',
        });
        this.refreshChats();
      })
      .catch((error) => {
        this.setState({
          newChatModalVisible: false,
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
  }

  render() {
    const {
      newChatModalVisible, isLoading, chats, newChatName,
    } = this.state;
    const displayTimestamp = (timestamp) => {
      if (!timestamp) {
        return '';
      }

      const currentDate = new Date();
      const messageDate = new Date(timestamp);
      if (currentDate.toDateString() === messageDate.toDateString()) {
        return messageDate.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });
      }
      return messageDate.toLocaleDateString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    };

    return (
      <View style={{ height: '100%' }}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Chats</Text>
        </View>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.container}>
            {isLoading ? (
              <View>
                <ActivityIndicator size="large" color="#4B0082" />
              </View>
            ) : (
              chats.map((chat) => (
                <TouchableOpacity
                  key={chat.chat_id}
                  style={styles.chat}
                  onPress={() => {
                    this.props.navigation.navigate('ChatScreen', {
                      chatInfo: chat,
                    });
                  }}
                >
                  <View style={styles.details}>
                    <Text style={styles.name}>{chat.name}</Text>
                    <View style={styles.lastMessageContainer}>
                      <Text style={styles.lastMessage}>
                        {chat.last_message?.author?.first_name}
                        {': '}
                        {chat.last_message?.message?.slice(0, 60)}
                        {chat.last_message?.message?.length > 60 ? '...' : ''}
                      </Text>
                      <Text style={styles.timestamp}>
                        {displayTimestamp(chat.last_message.timestamp)}
                      </Text>
                    </View>
                  </View>

                </TouchableOpacity>
              ))
            )}
          </View>

          <Modal
            style={styles.modalOverlay}
            animationType="slide"
            transparent
            visible={newChatModalVisible}
            onRequestClose={() => this.setState({ newChatModalVisible: false })}
          >
            <View style={styles.modalContainer}>
              <View style={styles.popupChat}>
                <Text style={styles.title}>Create New Chat</Text>

                <TextInput
                  style={styles.textInput}
                  placeholder="Chat Name"
                  onChangeText={(text) => this.setState({ newChatName: text })}
                />

                <TouchableOpacity
                  style={styles.createGroupButton}
                  onPress={() => {
                  // Handle create group button press here
                    this.newChat();
                  }}
                  disabled={!newChatName}
                >
                  <Text style={styles.createGroupButtonText}>Create Chat</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.createGroupButton}
                  onPress={() => {
                  // Handle create group button press here
                    this.setState({ newChatModalVisible: false });
                  }}
                >
                  <Text style={styles.createGroupButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </ScrollView>
        <View style={styles.chatButtonContainer}>
          <TouchableOpacity
            style={styles.chatButton}
            onPress={() => this.setState({ newChatModalVisible: true })}
          >
            <MaterialCommunityIcons name="android-messages" size={40} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

Chats.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    addListener: PropTypes.func.isRequired,
  }).isRequired,
};
