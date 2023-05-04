import React, { Component } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Modal,
} from 'react-native';
import PropTypes from 'prop-types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Toast } from 'react-native-toast-message/lib/src/Toast';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF5FF',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    padding: 20,
    width: '100%',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4B0082',
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
  details: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    marginTop: 5,
  },
  chat: {
    flexDirection: 'row',
    width: 350,
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#4B0082',
    paddingBottom: 10,
  },
  deleteButton: {
    backgroundColor: 'red',
    marginLeft: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    alignSelf: 'flex-end',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  sendButton: {
    backgroundColor: '#4B0082',
    marginLeft: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    alignSelf: 'flex-end',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarButton: {
    backgroundColor: '#4B0082',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    alignSelf: 'flex-end',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 5,
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  alertBox: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  alertText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#4B0082',
  },
  closeButton: {
    backgroundColor: '#4B0082',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#fff',
  },

});

export default class DraftList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      drafts: [],
      isConfirmSentVisible: false,
      showDateTimePicker: false,
      selectedDraftIndex: null,
    };
  }

  componentDidMount() {
    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      this.loadData();
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  loadData = async () => {
    const drafts = JSON.parse(await AsyncStorage.getItem('drafts')) || [];
    this.setState({ drafts, isConfirmSentVisible: false });
  };

  sendMessage = async (draft) => {
    const { chatId } = draft;
    const token = await AsyncStorage.getItem('whatsthat_user_token');
    const chatSearchURL = `http://localhost:3333/api/1.0.0/chat/${chatId}/message`;
    return fetch(chatSearchURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Authorization': token,
      },
      body: JSON.stringify({
        message: draft.messageInput,
      }),
    })
      .then((response) => {
        if (response.status === 200) {
          this.setState({ isConfirmSentVisible: true });
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

  handleDatePicked = (index) => {
    this.setState({
      showDateTimePicker: true,
      selectedDraftIndex: index,
    });
  };

  handleConfirmDate = async (date) => {
    Toast.show({
      type: 'success',
      text1: `Draft scheduled for: ${date.toString()}`,
    });
    const { selectedDraftIndex, drafts } = this.state;
    if (selectedDraftIndex !== null) {
      const selectedDraft = drafts[selectedDraftIndex];
      const updatedDraft = { ...selectedDraft, timestamp: date.toISOString() };
      const updatedDrafts = [...drafts];
      updatedDrafts[selectedDraftIndex] = updatedDraft;
      this.setState({ drafts: updatedDrafts });
      await AsyncStorage.setItem('drafts', JSON.stringify(updatedDrafts));
    }
    this.setState({ showDateTimePicker: false });
    const draft = this.state.drafts[selectedDraftIndex];
    // Check if the selected date is before or after the current date
    const currentDate = new Date();
    if (date.getTime() < currentDate.getTime()) {
      // Selected date is before current date, send the message immediately
      this.sendMessage(draft);
      this.handleDeleteDraft(draft);
    } else {
      // Selected date is after current date, schedule sending the message
      const delay = date.getTime() - currentDate.getTime();
      setTimeout(() => {
        this.sendMessage(draft);
        this.handleDeleteDraft(draft);
      }, delay);
    }
  };

  handleCloseDate = () => {
    this.setState({ showDateTimePicker: false });
  }

  handleViewDraft = (draft) => {
    const { chatId } = draft;
    this.props.navigation.navigate('editDraft', { draft, chatId });
  };

  handleSendDraft = async (draft) => {
    try {
      await this.sendMessage(draft);
      this.handleDeleteDraft(draft);
    } catch (error) {
      throw new Error('Error', error.message);
    }
  };

  handleDeleteDraft = async (draft) => {
    const drafts = this.state.drafts.filter((d) => !(d.messageId === draft.messageId
        && d.chatId === draft.chatId));
    try {
      await AsyncStorage.setItem('drafts', JSON.stringify(drafts));
      this.setState({ drafts });
    } catch (error) {
      throw new Error(error);
    }
  };

  renderDraft = ({ item: draft, index }) => {
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

    const isDateTimePickerVisible = this.state.showDateTimePicker
    && this.state.selectedDraftIndex === index;
    return (
      <View>
        <TouchableOpacity
          onPress={() => this.handleViewDraft(draft)}
          style={styles.chat}
        >
          <View style={styles.details}>
            <View style={styles.lastMessageContainer}>
              <Text style={styles.name}>{draft.chatName}</Text>
              <Text style={styles.name}>Send on/at:</Text>
            </View>
            <View style={styles.lastMessageContainer}>
              <Text style={styles.lastMessage}>
                {draft.messageInput?.slice(0, 60)}
                {draft.messageInput?.length > 60 ? '...' : ''}
              </Text>
              <Text style={styles.timestamp}>
                {displayTimestamp(draft.timestamp)}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => this.handleSendDraft(draft)}>
            <View style={styles.sendButton}>
              <Ionicons name="paper-plane-outline" size={24} color="white" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.handleDatePicked(index)}>
            <View style={styles.calendarButton}>
              <Ionicons name="calendar" size={24} color="white" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.handleDeleteDraft(draft)}>
            <View style={styles.deleteButton}>
              <Ionicons name="trash-outline" size={24} color="white" />
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
        {isDateTimePickerVisible && (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <View>
              <DateTimePicker
                onAccept={(newValue) => this.handleConfirmDate(newValue.toDate())}
                onClose={() => this.handleCloseDate()}
              />
            </View>
          </LocalizationProvider>
        )}
      </View>
    );
  };

  render() {
    return (
      <View style={styles.container}>
        <FlatList
          data={this.state.drafts}
          renderItem={this.renderDraft}
          keyExtractor={(item) => `${item.chatId}-${item.messageId}`}
        />
        {this.state.isConfirmSentVisible && (
        <Modal transparent>
          <View style={styles.modalContainer}>
            <View style={styles.alertBox}>
              <Text style={styles.alertText}>Draft Sent</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => this.setState({ isConfirmSentVisible: false })}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        )}
      </View>
    );
  }
}

DraftList.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    addListener: PropTypes.func.isRequired,
  }).isRequired,
};
