import React, { Component } from 'react';
import {
  Text,
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PropTypes from 'prop-types';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Toast } from 'react-native-toast-message/lib/src/Toast';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  membersContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginLeft: -40,
    marginTop: -10,
  },
  nameContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  saveButton: {
    marginTop: 16,
    marginRight: 10,
  },
  saveButtonText: {
    alignItems: 'center',
  },

  infoContainer: {
    height: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: '#FAF5FF',
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
  nameMember: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4B0082',
  },
  email: {
    fontSize: 14,
  },

  userInfo: {
    justifyContent: 'center',
    margin: 30,
  },
  name: {
    marginRight: 60,
  },
  nameHolder: {
    color: '#4B0082',
    fontSize: 16,
    fontWeight: 'bold',
  },
  nameText: {
    height: 30,
    fontSize: 20,
    fontWeight: 'bold',
  },
  nameTextEditing: {
    borderColor: '#ccc',
    borderWidth: 1,
    width: 200,
  },
  editButtonName: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 4,
    marginTop: 8,
    marginRight: 10,
  },
  editButtonMembers: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 4,
    marginRight: 10,

  },

  contactContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,

  },
  contactName: {
    fontSize: 20,
    fontWeight: 'bold',
  },

  modalContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF5FF',
    paddingHorizontal: 20,

  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 40,
    color: '#4B0082',
  },
  contactsList: {
    width: '75%',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#4B0082',
    paddingHorizontal: 10,
    paddingVertical: 15,
    borderRadius: 5,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  error: {
    alignItems: 'center',
    justifyContent: 'center',
    color: 'red',
    fontWeight: '900',
  },
});

export default class ChatInfo extends Component {
  constructor(props) {
    super(props);

    const { chatInfo } = this.props.route.params;

    this.state = {
      loggedInUserId: null,
      id: chatInfo.chat_id,
      name: '',
      creator: '',
      members: [],
      editingField: '',
      modalAddVisible: false,
      modalRemoveVisible: false,
      contacts: [],
      selectedContacts: [],
      selectedMembers: [],
      isEditing: false,
    };
  }

  async componentDidMount() {
    this.getContacts();
    this.getChatInfo();
  }

  static getFirstLetter(str) {
    return str?.charAt(0);
  }

  getContacts = async () => {
    const token = await AsyncStorage.getItem('whatsthat_user_token');

    return fetch('http://localhost:3333/api/1.0.0/contacts', {
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
          throw new Error('Something went wrong when getting contacts.');
        }
      })
      .then((responseJson) => {
        this.setState({
          isLoading: false,
          contacts: responseJson,
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

  async getChatInfo() {
    const { id } = this.state;
    const token = await AsyncStorage.getItem('whatsthat_user_token');
    const { navigation } = this.props;
    this.state.loggedInUserId = await AsyncStorage.getItem('whatsthat_user_id');
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
          throw new Error('Something went wrong getting Chat information');
        }
      })
      .then((responseJson) => {
        this.setState({
          isLoading: false,
          name: responseJson.name,
          creator: responseJson.creator,
          members: responseJson.members,
        });
      })
      .catch((error) => {
        // handle error response
        if (error.message === 'Unauthorised') {
          Toast.show({
            type: 'error',
            text1: 'Unauthorised',
          });
          navigation.navigate('Login');
        } else if (error.message === 'Forbidden') {
          Toast.show({
            type: 'error',
            text1: 'Forbidden',
          });
          navigation.navigate('Login');
        } else {
          Toast.show({
            type: 'error',
            text1: error.message,
          });
        }
      });
  }

  // Patch Info
  editChatName = async () => {
    const token = await AsyncStorage.getItem('whatsthat_user_token');
    const { id } = this.state;
    const { navigation } = this.props;
    return fetch(`http://localhost:3333/api/1.0.0/chat/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-Authorization': token,
      },
      body: JSON.stringify({
        name: this.state.name,
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
          throw new Error('Something went wrong while editing chat name.');
        }
      })
      .then(() => {
        this.setState({
          isLoading: false,
        });
      })
      .catch((error) => {
        // handle error response
        if (error.message === 'Unauthorised') {
          Toast.show({
            type: 'error',
            text1: 'Unauthorised',
          });
          navigation.navigate('Login');
        } else if (error.message === 'Forbidden') {
          Toast.show({
            type: 'error',
            text1: 'Forbidden',
          });
          navigation.navigate('Login');
        } else {
          Toast.show({
            type: 'error',
            text1: error.message,
          });
        }
      });
  };

  // Add user - do a get /contacts, display contacts with a check box,
  addMembers = async () => {
    const chatId = this.state.id;
    const token = await AsyncStorage.getItem('whatsthat_user_token');
    const { navigation } = this.props;
    const promises = this.state.selectedContacts.map((contact) => {
      const userId = contact.user_id;
      return fetch(
        `http://localhost:3333/api/1.0.0/chat/${chatId}/user/${userId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Authorization': token,
          },
        },
      )
        .then((response) => {
          if (response.status === 200) {
            this.setState({ modalAddVisible: false });
            Toast.show({
              type: 'success',
              text1: 'Member(s) Added',
            });
          } else if (response.status === 400) {
            throw new Error('Bad Request.');
          } else if (response.status === 401) {
            throw new Error('Unauthorised');
          } else if (response.status === 403) {
            throw new Error('Forbidden');
          } else if (response.status === 404) {
            throw new Error('Not Found.');
          } else {
            throw new Error('Something went wrong while adding users.');
          }
        })
        .then(() => {
          this.setState({ modalAddVisible: false });
          this.getContacts();
          this.getChatInfo();
        })
        .catch((error) => {
          this.setState({ modalAddVisible: false });
          // handle error response
          if (error.message === 'Unauthorised') {
            Toast.show({
              type: 'error',
              text1: 'Unauthorised',
            });
            navigation.navigate('Login');
          } else if (error.message === 'Forbidden') {
            Toast.show({
              type: 'error',
              text1: 'Forbidden',
            });
            navigation.navigate('Login');
          } else {
            Toast.show({
              type: 'error',
              text1: error.message,
            });
          }
        });
    });

    Promise.all(promises.filter(Boolean))
      .then(() => {
        this.setState({ selectedContacts: [] });
        this.getChatInfo();
      });
  };

  renderContact = ({ item }) => (
    <TouchableOpacity
      style={styles.contactContainer}
      onPress={() => this.toggleContactSelection(item)}
    >

      <View style={styles.circle}>
        <Text style={styles.initials}>
          {item?.first_name
            ? ChatInfo.getFirstLetter(item.first_name)
            : 'UU'}
        </Text>
      </View>
      <View style={styles.details}>
        <Text style={styles.nameMember}>
          {item.first_name}
          {' '}
          {item.last_name}
        </Text>
        <Text style={styles.email}>{item.email}</Text>
      </View>
      <Ionicons
        name={
          this.isContactSelected(item) ? 'checkmark-circle' : 'ellipse-outline'
        }
        size={24}
        color="#333"
      />

    </TouchableOpacity>
  );

  toggleContactSelection = (contact) => {
    const index = this.state.selectedContacts.findIndex(
      (c) => c.user_id === contact.user_id,
    );
    if (index === -1) {
      this.setState((prevState) => ({
        selectedContacts: [...prevState.selectedContacts, contact],
      }));
    } else {
      this.setState((prevState) => ({
        selectedContacts: prevState.selectedContacts.filter(
          (c) => c.user_id !== contact.user_id,
        ),
      }));
    }
  };

  isContactSelected = (contact) => (
    this.state.selectedContacts.findIndex(
      (c) => c.user_id === contact.user_id,
    ) !== -1
  );

  removeMembers = async () => {
    const chatId = this.state.id;
    const token = await AsyncStorage.getItem('whatsthat_user_token');

    const promises = this.state.selectedMembers
      .filter((member) => member.user_id !== this.state.creator.user_id)
      .map((member) => fetch(
        `http://localhost:3333/api/1.0.0/chat/${chatId}/user/${member.user_id}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'X-Authorization': token,
          },
        },
      ).then((response) => {
        if (response.status === 200) {
          this.setState({ modalRemoveVisible: false });
          Toast.show({
            type: 'success',
            text1: 'Member(s) Removed',
          });
        } else if (response.status === 400) {
          throw new Error('Bad Request.');
        } else if (response.status === 401) {
          throw new Error('Unauthorised');
        } else if (response.status === 403) {
          throw new Error('Forbidden');
        } else if (response.status === 404) {
          throw new Error('Not Found.');
        } else {
          throw new Error('Something went wrong while removing users.');
        }
      }).catch((error) => {
        this.setState({ modalRemoveVisible: false });
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
      }));

    Promise.all(promises.filter(Boolean))
      .then(() => {
        this.setState({ selectedMembers: [], modalRemoveVisible: false });
        this.getChatInfo();
      })
      .catch((error) => {
        throw new Error(error);
      });
  };

  renderMember = ({ item }) => (
    <TouchableOpacity
      style={styles.contactContainer}
      onPress={() => this.toggleMemberSelection(item)}
    >

      <View style={styles.circle}>
        <Text style={styles.initials}>
          {item?.first_name
            ? ChatInfo.getFirstLetter(item.first_name)
            : 'UU'}
        </Text>
      </View>
      <View style={styles.details}>
        <Text style={styles.nameMember}>
          {item.first_name}
          {' '}
          {item.last_name}
        </Text>
        <Text style={styles.email}>{item.email}</Text>
      </View>
      <Ionicons
        name={
          this.isMemberSelected(item) ? 'checkmark-circle' : 'ellipse-outline'
        }
        size={24}
        color="#333"
      />

    </TouchableOpacity>

  );

  toggleMemberSelection = (member) => {
    const index = this.state.selectedMembers.findIndex(
      (m) => m.user_id === member.user_id,
    );
    if (index === -1) {
      this.setState((prevState) => ({
        selectedMembers: [...prevState.selectedMembers, member],
      }));
    } else {
      this.setState((prevState) => ({
        selectedMembers: prevState.selectedMembers.filter(
          (m) => m.user_id !== member.user_id,
        ),
      }));
    }
  };

  isMemberSelected = (member) => (
    this.state.selectedMembers.findIndex(
      (m) => m.user_id === member.user_id,
    ) !== -1
  );

  handleModalClose = () => {
    this.setState({
      selectedContacts: [],
      selectedMembers: [],
      modalAddVisible: false,
      modalRemoveVisible: false,
    });
  };

  // those selected get sent to the POST /user/{user}
  // remove user
  handleFieldChange = (value) => {
    const { editingField } = this.state;
    this.setState({ [editingField]: value });
  };

  handleSaveChanges = () => {
    this.editChatName();
    this.setState({ editingField: null });
  };

  render() {
    return (
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {this.state.isLoading ? (
          <View>
            <ActivityIndicator size="large" color="#4B0082" />
          </View>
        ) : (

          <View style={styles.container}>
            <View style={styles.infoContainer}>
              <View style={styles.userInfo}>
                <View style={styles.nameContainer}>
                  <View style={styles.name}>
                    <Text style={styles.nameHolder}>Group Name: </Text>
                    {this.state.editingField === 'name' ? (
                      <TextInput
                        style={[styles.nameText, this.state.isEditing
                        && styles.nameTextEditing]}
                        placeholder="Enter text here"
                        value={this.state.name}
                        onChangeText={this.handleFieldChange}
                      />

                    ) : (
                      <Text style={styles.nameText}>{this.state.name}</Text>
                    )}
                    {this.state.name === ''
                    && this.state.editingField === 'name' && (
                      <Text style={styles.error}>*Cannot be empty</Text>
                    )}
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'flex-end',
                      marginTop: 10,
                    }}
                  >
                    {this.state.editingField === 'name' && (
                    <TouchableOpacity
                      style={styles.editButtonName}
                      onPress={this.handleSaveChanges}
                      disabled={!this.state.name}
                    >
                      <Icon name="save" size={24} color="#4B0082" />
                    </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      style={styles.editButtonName}
                      onPress={() => this.setState({ editingField: 'name', isEditing: true })}
                    >
                      <Icon name="pencil" size={24} color="#4B0082" />
                    </TouchableOpacity>

                  </View>
                </View>
                <View style={styles.nameContainer}>
                  <View style={styles.name}>
                    <Text style={styles.nameHolder}>Created by:</Text>
                    <Text style={styles.nameText}>
                      {this.state.creator.first_name}
                      {' '}
                      {this.state.creator.last_name}
                    </Text>
                  </View>
                </View>
                <View style={styles.nameContainer}>
                  <View style={styles.name}>
                    <Text style={styles.nameHolder}>Members:</Text>
                    {this.state.members && this.state.members.length > 0 && (
                      this.state.members.length === 1 ? (
                        <Text style={styles.nameText}>
                          {this.state.members[0].first_name}
                          {' '}
                          {this.state.members[0].last_name}
                        </Text>
                      ) : (
                        this.state.members.map((member) => (
                          <Text style={styles.nameText} key={member.user_id}>
                            {member.first_name}
                            {' '}
                            {member.last_name}
                          </Text>
                        ))
                      )
                    )}
                  </View>
                  <View style={styles.membersContainer}>
                    <TouchableOpacity
                      style={styles.editButtonMembers}
                      onPress={() => this.setState({ modalAddVisible: true })}
                    >
                      <Ionicons
                        name="person-add"
                        size={22}
                        color="#4B0082"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.editButtonMembers}
                      onPress={() => this.setState({ modalRemoveVisible: true })}
                    >
                      <Ionicons
                        name="person-remove"
                        size={22}
                        color="#4B0082"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

              </View>
            </View>

            <Modal
              animationType="slide"
              visible={this.state.modalAddVisible}
            >
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Add Members</Text>
                <FlatList
                  style={styles.contactsList}
                  data={this.state.contacts.filter(
                    (contact) => !this.state.members.find(
                      (member) => member.user_id === contact.user_id,
                    ),
                  )}
                  keyExtractor={(item) => item.user_id.toString()}
                  renderItem={this.renderContact}
                />

                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => this.addMembers()}
                >
                  <Text style={styles.modalButtonText}>Add Selected Members</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={this.handleModalClose}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </Modal>

            <Modal
              animationType="slide"
              visible={this.state.modalRemoveVisible}
            >
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Remove Members</Text>
                <FlatList
                  style={styles.contactsList}
                  data={this.state.members.filter(
                    (member) => member.user_id !== parseInt(this.state.loggedInUserId, 10),
                  )}
                  keyExtractor={(item) => item.user_id.toString()}
                  renderItem={this.renderMember}
                />

                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => this.removeMembers()}
                >
                  <Text style={styles.modalButtonText}>
                    Remove Selected Members
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={this.handleModalClose}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </Modal>
          </View>
        )}
      </ScrollView>
    );
  }
}

ChatInfo.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    addListener: PropTypes.func.isRequired,
  }).isRequired,
  route: PropTypes.shape({
    params: PropTypes.shape({
      chatInfo: PropTypes.shape({
        chat_id: PropTypes.number.isRequired,
      }).isRequired,
    }).isRequired,
  }).isRequired,
};
