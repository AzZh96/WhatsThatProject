import React, { Component } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  ActivityIndicator,
  Keyboard,
  Modal,
} from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PropTypes from 'prop-types';
import { Ionicons } from '@expo/vector-icons';
import { Toast } from 'react-native-toast-message/lib/src/Toast';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAF5FF',
  },
  containerMessage: {
    flex: 1,
    width: '100%',
  },
  wrapper: {
    width: '100%',
    flex: 1,
    alignSelf: 'stretch',
  },
  modalOverlay: {
    zIndex: 998,
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  message: {
    margin: 5,
    padding: 10,
    borderRadius: 5,
  },
  author: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  content: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#4B0082',
    padding: 10,
  },
  input: {
    flex: 1,
    height: 40,
    paddingHorizontal: 10,
    backgroundColor: '#FAF5FF',
    borderRadius: 20,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#4B0082',
    borderRadius: 20,
    padding: 10,
    marginLeft: 5,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  myMessageContainer: {
    backgroundColor: '#C38CF9',
    alignSelf: 'flex-end',
    borderRadius: 10,
    padding: 10,
    margin: 5,
    maxWidth: '75%',
  },
  popupContainer: {
    backgroundColor: '#FAF5FF',
    position: 'absolute',
    bottom: 60,
    width: '100%',

    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 999,
  },
  popup: {
    backgroundColor: '#FAF5FF',
    borderRadius: 5,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  popupButton: {
    backgroundColor: '#4B0082',
    borderRadius: 5,
    padding: 10,
    marginRight: 5,
    marginLeft: 5,
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
  },
  popupButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 5,
  },

  otherMessageContainer: {
    backgroundColor: '#4B068C',
    alignSelf: 'flex-start',
    borderRadius: 10,
    padding: 10,
    margin: 5,
    maxWidth: '75%',
  },
  messageText: {
    fontWeight: 'bold',
    color: '#ffffff',
    fontSize: 16,
  },
  timestampLeft: {
    alignSelf: 'flex-start',
    fontSize: 12,
    color: '#ffffff',
    marginTop: 3,
  },
  timestampRight: {
    alignSelf: 'flex-end',
    fontSize: 12,
    color: '#ffffff',
    marginTop: 3,
  },
  senderName: {
    color: '#FAF5FF',
    fontWeight: 'bold',

    marginBottom: 5,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
    zIndex: 1000,
  },
  modalView: {
    width: '90%',
    backgroundColor: '#FAF5FF',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    zIndex: 1000,
    elevation: 5,
  },
  editTextInput: {
    height: 100,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    padding: 10,
    textAlignVertical: 'top',
    width: '100%',
  },
});

export default class ChatScreen extends Component {
  constructor(props) {
    super(props);

    const { chatInfo } = this.props.route.params;

    this.state = {
      userId: '',
      id: chatInfo.chat_id,
      name: '',
      messages: [],
      messageInput: '',
      isLoading: true,
      selectedMessage: null,
      isPopupVisible: false,
      isEditing: false,
      editingMessageText: '',
    };
  }

  async componentDidMount() {
    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      this.getChatInfo();
      this.checkedLoggedIn();
    });
    await this.checkedLoggedIn();

    this.setState({
      isLoading: false,
    });
    this.getChatInfo();

    this.props.navigation.setOptions({ title: this.state.name });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  checkedLoggedIn = async () => {
    const value = await AsyncStorage.getItem('whatsthat_user_token');
    if (value == null) {
      this.props.navigation.navigate('Login');
    }
  };

  getChatInfo = async () => {
    const loggedInUserId = await AsyncStorage.getItem('whatsthat_user_id');
    const { id } = this.state;
    const token = await AsyncStorage.getItem('whatsthat_user_token');
    const chatSearchURL = `http://localhost:3333/api/1.0.0/chat/${id}`;
    return fetch(chatSearchURL, {
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
        } else if (response.status === 403) {
          throw new Error('Forbidden');
        } else if (response.status === 404) {
          throw new Error('Not Found.');
        } else {
          throw new Error('Something went wrong when getting chat information.');
        }
      })
      .then((responseJson) => {
        this.setState({
          isLoading: false,
          name: responseJson.name,
          messages: responseJson.messages,
          messageInput: '',
          userId: loggedInUserId,
        });

        this.props.navigation.setOptions({ title: this.state.name });
      })
      .catch((error) => {
        // handle error response
        if (error.message === 'Unauthorised') {
          Toast.show({
            type: 'error',
            text1: 'Unauthorised',
          });
          this.props.navigation.navigate('Login');
        } else if (error.message === 'Forbidden') {
          Toast.show({
            type: 'error',
            text1: 'Forbidden',
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

  sendMessage = async () => {
    // set loading to true
    this.setState({ isLoading: true });

    const { id } = this.state;
    const token = await AsyncStorage.getItem('whatsthat_user_token');
    const chatSearchURL = `http://localhost:3333/api/1.0.0/chat/${id}/message`;
    return fetch(chatSearchURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Authorization': token,
      },
      body: JSON.stringify({
        message: this.state.messageInput,
      }),
    })
      .then((response) => {
        if (response.status === 200) {
          return;
        } if (response.status === 400) {
          throw new Error('Bad Request.');
        } else if (response.status === 401) {
          throw new Error('Unauthorised');
        } else if (response.status === 403) {
          throw new Error('Forbidden');
        } else if (response.status === 404) {
          throw new Error('Not Found.');
        } else {
          throw new Error('Something went wrong when sending message.');
        }
      })
      .catch((error) => {
        // handle error response
        if (error.message === 'Unauthorised') {
          Toast.show({
            type: 'error',
            text1: 'Unauthorised',
          });
          this.props.navigation.navigate('Login');
        } else if (error.message === 'Forbidden') {
          Toast.show({
            type: 'error',
            text1: 'Forbidden',
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

  saveDraft = async () => {
    const { id, messageInput, name } = this.state;
    const chatId = id;
    const chatName = name;
    const messageId = uuidv4();
    const timestamp = '';
    const calendarShown = false;
    const scheduled = false;
    const draft = {
      messageId,
      messageInput,
      chatId,
      chatName,
      timestamp,
      calendarShown,
      scheduled,
    };
    try {
      const drafts = JSON.parse(await AsyncStorage.getItem('drafts')) || [];
      drafts.push(draft);
      await AsyncStorage.setItem('drafts', JSON.stringify(drafts));
      await this.getChatInfo();
      Toast.show({
        type: 'success',
        text1: 'Draft Saved',
      });
    } catch (error) {
      throw new Error(error);
    }
  }

  handleSend = async () => {
    await this.sendMessage();
    await this.getChatInfo();
    Keyboard.dismiss();
  };

  handleInputChange = (text) => {
    this.setState({
      messageInput: text,
    });
  };

  handleEdit = (message) => {
    this.setState({
      isEditing: true,
      isPopupVisible: false,
      selectedMessage: message,
      editingMessageText: message.message,
    });
  };

  handleEditPatch = async (message) => {
    const token = await AsyncStorage.getItem('whatsthat_user_token');
    const chatId = this.state.id;
    const messageId = message.message_id;
    const editMessageURL = `http://localhost:3333/api/1.0.0/chat/${chatId}/message/${messageId}`;
    return fetch(editMessageURL, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-Authorization': token,
      },
      body: JSON.stringify({
        message: this.state.editingMessageText,
      }),
    })
      .then((response) => {
        if (response.status === 200) {
          return 'OK';
        } if (response.status === 400) {
          throw new Error('Bad Request.');
        } else if (response.status === 401) {
          throw new Error('Unauthorised');
        } else if (response.status === 403) {
          throw new Error('Forbidden');
        } else if (response.status === 404) {
          throw new Error('Not Found.');
        } else {
          throw new Error('Something went wrong when editing message.');
        }
      })
      .then(() => {
        this.setState({
          isLoading: false,
          isEditing: false,
        });
        this.getChatInfo();
      })
      .catch((error) => {
        this.setState({
          isEditing: false,
        });
        // handle error response
        if (error.message === 'Unauthorised') {
          Toast.show({
            type: 'error',
            text1: 'Unauthorised',
          });
          this.props.navigation.navigate('Login');
        } else if (error.message === 'Forbidden') {
          Toast.show({
            type: 'error',
            text1: 'Forbidden',
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

  handleDelete = async (message) => {
    const token = await AsyncStorage.getItem('whatsthat_user_token');
    const chatId = this.state.id;
    const messageId = message.message_id;
    const { messages } = this.state;
    const deleteMessageURL = `http://localhost:3333/api/1.0.0/chat/${chatId}/message/${messageId}`;
    // Make the API call to remove the contact
    fetch(deleteMessageURL, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-Authorization': token,
      },
    })
      .then((response) => {
        if (response.status === 200) {
          return 'OK';
        } if (response.status === 400) {
          throw new Error('You cant remove yourself.');
        } else if (response.status === 401) {
          throw new Error('Unauthorised');
        } else if (response.status === 404) {
          throw new Error('Not Found.');
        } else {
          throw new Error('Something went wrong when deleting message.');
        }
      })
      .then(() => {
        const updatedMessages = messages.filter(
          (m) => m.message_id !== message.message_id,
        );
        this.setState({
          messages: updatedMessages,
          isPopupVisible: false,
          selectedMessage: null,
        });
        this.getChatInfo();
      })
      .catch((error) => {
        this.setState({
          isPopupVisible: false,
          selectedMessage: null,
        });
        // handle error response
        if (error.message === 'Unauthorised') {
          Toast.show({
            type: 'error',
            text1: 'Unauthorised',
          });
          this.props.navigation.navigate('Login');
        } else if (error.message === 'Forbidden') {
          Toast.show({
            type: 'error',
            text1: 'Forbidden',
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

  render() {
    const { isLoading, messages, messageInput } = this.state;
    const isMessageInputEmpty = messageInput.trim().length === 0;
    if (isLoading) {
      return (
        <View>
          <ActivityIndicator size="large" color="#4B0082" />
        </View>
      );
    }
    return (
      <View style={styles.container}>
        <View style={styles.containerMessage}>
          <FlatList
            inverted
            data={messages}
            renderItem={({ item }) => {
              const isMyMessage = item.author.user_id === parseInt(this.state.userId, 10);
              const { timestamp } = item;
              const date = new Date(timestamp);
              const hours = date.getHours();
              const minutes = date.getMinutes();
              const timeString = `${hours.toString().padStart(2, '0')
              }:${
                minutes.toString().padStart(2, '0')}`;

              return (
                <TouchableOpacity
                  onPress={() => {
                    this.setState({
                      isPopupVisible: true,
                      selectedMessage: item,
                    });
                  }}
                  disabled={!isMyMessage}
                  style={
                    isMyMessage
                      ? styles.myMessageContainer
                      : styles.otherMessageContainer
                  }
                >
                  {!isMyMessage && (
                    <Text style={styles.senderName}>
                      {item.author.first_name}
                    </Text>
                  )}
                  <Text style={styles.messageText}>{item.message}</Text>
                  <Text
                    style={
                      isMyMessage ? styles.timestampRight : styles.timestampLeft
                    }
                  >
                    {timeString}
                  </Text>
                </TouchableOpacity>
              );
            }}
            keyExtractor={(item) => item.message_id}
            ListHeaderComponent={<View style={styles.wrapper} />}
          />

          <KeyboardAvoidingView
            keyboardVerticalOffset={-50}
            style={styles.inputContainer}
          >
            <TextInput
              style={styles.input}
              placeholder="Type your message here..."
              value={messageInput}
              onChangeText={this.handleInputChange}
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={this.saveDraft}
              disabled={isMessageInputEmpty}
            >
              <Ionicons name="save" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sendButton}
              onPress={this.handleSend}
              disabled={isMessageInputEmpty}
            >
              <Ionicons name="send" size={24} color="white" />
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </View>
        <Modal
          visible={this.state.isPopupVisible}
          animationType="fade"
          transparent
        >
          <View style={styles.popupContainer}>
            <View style={styles.popup}>
              <TouchableOpacity
                style={styles.popupButton}
                onPress={() => this.handleEdit(this.state.selectedMessage)}
              >
                <Ionicons name="pencil" size={24} color="white" />
                <Text style={styles.popupButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.popupButton}
                onPress={() => this.handleDelete(this.state.selectedMessage)}
              >
                <Ionicons name="trash" size={24} color="white" />
                <Text style={styles.popupButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity
            style={styles.modalOverlay}
            onPress={() => {
              this.setState({ isPopupVisible: false, isEditing: false });
            }}
          />
        </Modal>
        {this.state.isEditing && (
          <Modal
            animationType="slide"
            transparent
            visible={this.state.isEditing}
            onRequestClose={() => {
              this.setState({ isEditing: false });
            }}
          >
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <Text style={{ fontWeight: 'bold' }}>Edit your message:</Text>
                <TextInput
                  style={styles.editTextInput}
                  multiline
                  numberOfLines={4}
                  value={this.state.editingMessageText}
                  onChangeText={(text) => this.setState({ editingMessageText: text })}
                />

                <View style={styles.popup}>
                  <TouchableOpacity
                    style={styles.popupButton}
                    onPress={() => this.handleEditPatch(this.state.selectedMessage)}
                  >
                    <Ionicons name="save" size={24} color="white" />
                    <Text style={styles.popupButtonText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.popupButton}
                    onPress={() => this.setState({ isEditing: false })}
                  >
                    <Ionicons name="close" size={24} color="white" />
                    <Text style={styles.popupButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <TouchableOpacity
              style={styles.modalOverlay}
              onPress={() => {
                this.setState({ isPopupVisible: false, isEditing: false });
              }}
            />
          </Modal>
        )}
      </View>
    );
  }
}

ChatScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    addListener: PropTypes.func.isRequired,
    setOptions: PropTypes.func.isRequired,
  }).isRequired,
  route: PropTypes.shape({
    params: PropTypes.shape({
      chatInfo: PropTypes.shape({
        chat_id: PropTypes.number.isRequired,
      }).isRequired,
    }).isRequired,
  }).isRequired,
};
