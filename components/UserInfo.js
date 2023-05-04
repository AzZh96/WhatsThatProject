import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { Component } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import PropTypes from 'prop-types';
import * as EmailValidator from 'email-validator';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Toast } from 'react-native-toast-message/lib/src/Toast';
import placeholderImage from '../assets/placeholder.png';

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    flex: 1,
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#FAF5FF',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#4B0082',
    paddingBottom: 14.5,
    paddingLeft: 14.5,
    paddingRight: 14.5,
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  namePasswordContainer: {
    width: '100%',
    flexDirection: 'row',
    marginTop: 25,
    alignItems: 'center',
  },
  nameEmailContainer: {
    width: '100%',
    flexDirection: 'row',
    marginBottom: 5,
    alignItems: 'center',
  },
  saveButtonText: {
    paddingLeft: 10,
  },

  infoContainer: {
    width: '100%',
    alignItems: 'center',

    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: '#FAF5FF',
  },
  avatarContainer: {
    marginTop: 10,
  },
  avatarImage: {
    width: 150,
    height: 150,
    borderRadius: 76,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  editButtonAvatar: {
    zIndex: 999,
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 4,
  },

  userInfo: {
    marginTop: 30,
    width: '80%',
    height: 600,
  },
  nameEmail: {
    flex: 1,
    paddingRight: 10,
    width: '100%',
    height: 40,
  },
  nameTextEditing: {
    borderColor: '#ccc',
    borderWidth: 1,
    backgroundColor: '#fff',
  },
  nameEmailHolder: {
    color: '#4B0082',
    fontSize: 16,
    fontWeight: 'bold',
  },
  nameEmailText: {
    height: 30,
    fontSize: 20,
    fontWeight: 'bold',
  },
  confirmPasswordText: {
    height: 30,
    fontSize: 20,
    fontWeight: 'bold',
    width: 250,
    marginBottom: 5,
  },
  confirmPasswordEditing: {
    borderColor: '#ccc',
    borderWidth: 1,
    backgroundColor: '#fff',
  },
  buttonNameEmail: {
    backgroundColor: '#fff',
    borderRadius: 15,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 5,
    marginLeft: 5,
  },

  error: {
    alignItems: 'center',
    justifyContent: 'center',
    color: 'red',
    fontWeight: '900',
  },
  confirmed: {
    alignItems: 'center',
    justifyContent: 'center',
    color: 'green',
    fontWeight: '900',
  },
});

export default class UserInfo extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      first_name: '',
      editingField: '',
      last_name: '',
      email: '',
      password: '',
      isEditingPassword: false,
      newPassword: '',
      confirmPassword: '',
      photo: '',
      error: '',
      confirmed: '',
      isEditing: false,
    };
  }

  async componentDidMount() {
    const { navigation } = this.props;
    this.unsubscribe = navigation.addListener('focus', () => {
      this.checkedLoggedIn();
      this.getUserData();
      this.getUserPhoto();
    });
    await this.checkedLoggedIn();
    this.setState({
      isLoading: false,
    });
    this.getUserData();
    this.getUserPhoto();
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  handleFieldChange = (value) => {
    this.setState({ isEditingPassword: false });
    const { editingField } = this.state;

    if (editingField === 'newPassword') {
      this.setState({ newPassword: value });
    } else if (editingField === 'confirmPassword') {
      this.setState({ confirmPassword: value });
    } else {
      this.setState({ [editingField]: value });
    }
  };

  handleSaveChanges = () => {
    this.editUserData();
    this.setState({ editingField: null });
  }

  async getUserData() {
    const token = await AsyncStorage.getItem('whatsthat_user_token');
    const id = await AsyncStorage.getItem('whatsthat_user_id');
    this.state.password = await AsyncStorage.getItem('whatsthat_user_password');
    const { navigation } = this.props;
    return fetch(`http://localhost:3333/api/1.0.0/user/${id}`, {
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
        } else if (response.status === 404) {
          throw new Error('Something went wrong while fetching user data.');
        } else {
          throw new Error('Something went wrong while fetching user data.');
        }
      })
      .then((responseJson) => {
        this.setState({
          isLoading: false,
          first_name: responseJson.first_name,
          last_name: responseJson.last_name,
          email: responseJson.email,
          confirmed: '',
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
        } else {
          Toast.show({
            type: 'error',
            text1: error.message,
          });
        }
      });
  }

  async getUserPhoto() {
    const token = await AsyncStorage.getItem('whatsthat_user_token');
    const id = await AsyncStorage.getItem('whatsthat_user_id');
    const { navigation } = this.props;
    return fetch(`http://localhost:3333/api/1.0.0/user/${id}/photo`, {
      method: 'GET',
      headers: {
        'X-Authorization': token,
      },
    })
      .then((response) => {
        if (response.status === 200) {
          return response.blob();
        } if (response.status === 401) {
          throw new Error('Unauthorised');
        } else if (response.status === 404) {
          throw new Error('Something went wrong while fetching user photo.');
        } else {
          throw new Error('Something went wrong while fetching user photo.');
        }
      })
      .then((resBlob) => {
        const data = URL.createObjectURL(resBlob);
        this.setState({
          photo: data,
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
        } else {
          Toast.show({
            type: 'error',
            text1: error.message,
          });
        }
      });
  }

  isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const atIndex = email.indexOf('@');
    return regex.test(email) && email.substring(atIndex + 1).match(/^\D*$/);
  };

  handleCamera = () => {
    this.props.navigation.navigate('CameraProfile');
  };

  async editUserData() {
    const token = await AsyncStorage.getItem('whatsthat_user_token');
    const id = await AsyncStorage.getItem('whatsthat_user_id');
    const { navigation } = this.props;
    return fetch(`http://localhost:3333/api/1.0.0/user/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-Authorization': token,
      },
      body: JSON.stringify({
        first_name: this.state.first_name,
        last_name: this.state.last_name,
        email: this.state.email,
        password: this.state.newPassword,
      }),
    })
      .then((response) => {
        if (response.status === 200) {
          return 'OK';
        } if (response.status === 400) {
          throw new Error('Bad Request');
        } else if (response.status === 401) {
          throw new Error('Unauthorised');
        } else if (response.status === 403) {
          throw new Error('Forbidden');
        } else if (response.status === 404) {
          throw new Error('Not Found.');
        } else {
          throw new Error('Something went wrong while editing user data.');
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
  }

  async checkedLoggedIn() {
    const { navigation } = this.props;
    const value = await AsyncStorage.getItem('whatsthat_user_token');
    if (value == null) {
      navigation.navigate('Login');
    }
  }

  validatePassword() {
    const PASSWORD_REGEX = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
    this.setState({
      confirmed: '',
    });

    if (!PASSWORD_REGEX.test(this.state.newPassword)) {
      this.setState({
        error:
          'Password isn\'t strong enough (One upper, one lower, one special, one number, at least 8 characters long)',
      });
    } else if (this.state.newPassword !== this.state.confirmPassword) {
      this.setState({
        error: 'Passwords do not match',
      });
    } else {
      this.setState((prevState) => ({
        error: '',
        confirmed: 'Password Changed Successfully',
        password: prevState.newPassword,
        newPassword: '',
        confirmPassword: '',
        isEditingPassword: false,
      }));
      Toast.show({
        type: 'success',
        text1: 'Password Changed Successfully',
      });
      this.handleSaveChanges();
    }
  }

  render() {
    if (this.state.isLoading) {
      return (
        <View>
          <ActivityIndicator size="large" color="#4B0082" />
        </View>
      );
    }
    return (
      <View>
        <View style={styles.header}>
          <Text style={styles.headerText}>Profile</Text>
        </View>
        <ScrollView>
          <View style={styles.container}>
            <View style={styles.infoContainer}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatarImage}>
                  {this.state.photo ? (
                    <Image style={styles.avatar} source={this.state.photo} />
                  ) : (
                    <Image style={styles.avatar} source={placeholderImage} />
                  )}

                </View>
                <TouchableOpacity
                  style={styles.editButtonAvatar}
                  onPress={this.handleCamera}
                >
                  <Icon name="pencil" size={24} color="#4B0082" />
                </TouchableOpacity>
              </View>
              <View style={styles.userInfo}>
                <View style={styles.nameEmailContainer}>
                  <View style={styles.nameEmail}>
                    <Text style={styles.nameEmailHolder}>First Name: </Text>
                    {this.state.editingField === 'first_name' ? (
                      <TextInput
                        style={[styles.nameEmailText, this.state.isEditing
                        && styles.nameTextEditing]}
                        value={this.state.first_name}
                        onChangeText={this.handleFieldChange}
                      />
                    ) : (
                      <Text style={styles.nameEmailText}>
                        {this.state.first_name}
                      </Text>
                    )}
                    {this.state.first_name === ''
                        && this.state.editingField === 'first_name' && (

                        <Text style={styles.error}>*Cannot be empty</Text>

                    )}
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'flex-end',
                      marginTop: 25,
                    }}
                  >
                    {this.state.editingField === 'first_name' && (
                    <TouchableOpacity
                      style={styles.buttonNameEmail}
                      onPress={this.handleSaveChanges}
                      disabled={!this.state.first_name}
                    >
                      <Icon name="save" size={24} color="#4B0082" />
                    </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      style={styles.buttonNameEmail}
                      onPress={() => this.setState({
                        isEditing: true,
                        editingField: 'first_name',
                        error: '',
                        newPassword: '',
                        confirmPassword: '',
                        isEditingPassword: false,
                      })}
                    >
                      <Icon name="pencil" size={24} color="#4B0082" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.nameEmailContainer}>
                  <View style={styles.nameEmail}>
                    <Text style={styles.nameEmailHolder}>Last Name: </Text>
                    {this.state.editingField === 'last_name' ? (
                      <TextInput
                        style={[styles.nameEmailText, this.state.isEditing
                        && styles.nameTextEditing]}
                        value={this.state.last_name}
                        onChangeText={this.handleFieldChange}
                      />
                    ) : (

                      <Text style={styles.nameEmailText}>
                        {this.state.last_name}
                      </Text>

                    )}
                    {this.state.last_name === ''
                        && this.state.editingField === 'last_name' && (
                          <Text style={styles.error}>*Cannot be empty</Text>
                    )}
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'flex-end',
                      marginTop: 25,
                    }}
                  >
                    {this.state.editingField === 'last_name' && (
                    <TouchableOpacity
                      style={styles.buttonNameEmail}
                      onPress={this.handleSaveChanges}
                      disabled={!this.state.last_name}
                    >
                      <Icon name="save" size={24} color="#4B0082" />
                    </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={styles.buttonNameEmail}
                      onPress={() => this.setState({
                        isEditing: true,
                        editingField: 'last_name',
                        error: '',
                        newPassword: '',
                        confirmPassword: '',
                        isEditingPassword: false,
                      })}
                    >
                      <Icon name="pencil" size={24} color="#4B0082" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.nameEmailContainer}>
                  <View style={styles.nameEmail}>
                    <Text style={styles.nameEmailHolder}>Email: </Text>
                    {this.state.editingField === 'email' ? (
                      <TextInput
                        style={[styles.nameEmailText, this.state.isEditing
                        && styles.nameTextEditing]}
                        value={this.state.email}
                        onChangeText={this.handleFieldChange}
                        keyboardType="email-address"
                      />
                    ) : (
                      <Text style={styles.nameEmailText}>
                        {this.state.email}
                      </Text>
                    )}
                    {(this.state.email === ''
                        || !this.isValidEmail(this.state.email)
                        || !EmailValidator.validate(this.state.email))
                        && this.state.editingField === 'email' && (
                          <View>
                            <Text style={styles.error}>
                              {this.state.email === ''
                                ? '*Cannot be empty'
                                : '*Must enter valid email'}
                            </Text>
                          </View>
                    )}
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'flex-end',
                      marginTop: 25,
                    }}
                  >
                    {this.state.editingField === 'email' && (
                    <TouchableOpacity
                      style={[
                        styles.buttonNameEmail,
                        {
                          opacity:
                                this.state.email
                                && EmailValidator.validate(this.state.email)
                                  ? 1
                                  : 0.5,
                        },
                      ]}
                      onPress={this.handleSaveChanges}
                      disabled={
                            !this.state.email
                            || !EmailValidator.validate(this.state.email)
                          }
                    >
                      <Icon name="save" size={24} color="#4B0082" />
                    </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={styles.buttonNameEmail}
                      onPress={() => this.setState({
                        isEditing: true,
                        editingField: 'email',
                        error: '',
                        newPassword: '',
                        confirmPassword: '',
                        isEditingPassword: false,
                      })}
                    >
                      <Icon name="pencil" size={24} color="#4B0082" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.namePasswordContainer}>
                  <View style={styles.nameEmail}>
                    <Text style={styles.nameEmailHolder}>Password: </Text>
                    {this.state.isEditingPassword ? (
                      <View>
                        <View style={[styles.nameEmailContainer, { marginBottom: 5 }]}>
                          <View style={styles.nameEmail}>
                            <Text style={styles.nameEmailText}>
                              {this.state.password.replace(/./g, '*')}
                            </Text>
                            <Text style={styles.nameEmailHolder}>
                              New Password:
                            </Text>
                            <TextInput
                              style={[styles.nameEmailText, this.state.isEditing
                        && styles.nameTextEditing]}
                              placeholder="enter new password"
                              placeholderTextColor="#9A9A9A"
                              onChangeText={(newPassword) => this.setState({ newPassword })}
                              value={this.state.newPassword}
                              secureTextEntry
                            />
                          </View>
                        </View>
                        <View
                          style={{
                            marginTop: 20,
                          }}
                        >
                          <View style={styles.namePasswordContainer}>
                            <View style={styles.nameEmail}>
                              <Text style={styles.nameEmailHolder}>
                                Confirm Password:
                              </Text>

                              <View
                                style={{
                                  flexDirection: 'row',
                                }}
                              >
                                <TextInput
                                  style={[styles.confirmPasswordText, this.state.isEditing
                        && styles.confirmPasswordEditing]}
                                  placeholder="confirm password"
                                  placeholderTextColor="#9A9A9A"
                                  onChangeText={
                                    (confirmPassword) => this.setState({ confirmPassword })
                                    }
                                  value={this.state.confirmPassword}
                                  secureTextEntry
                                />
                                {this.state.editingField === 'password' && (
                                <View
                                  style={{
                                    flexDirection: 'row',
                                    justifyContent: 'flex-end',
                                    marginTop: -8,
                                  }}
                                >
                                  <TouchableOpacity
                                    style={[
                                      styles.buttonNameEmail, { marginLeft: 5, marginBottom: 5 },
                                    ]}
                                    onPress={() => this.validatePassword()}
                                    disabled={
                                          !this.state.newPassword
                                          || !this.state.confirmPassword
                                        }
                                  >
                                    <Icon
                                      name="save"
                                      size={24}
                                      color="#4B0082"
                                    />
                                  </TouchableOpacity>
                                  <TouchableOpacity
                                    style={[styles.buttonNameEmail, { marginRight: 0 }]}
                                    onPress={() => this.setState({
                                      error: '',
                                      newPassword: '',
                                      confirmPassword: '',
                                      isEditingPassword: false,
                                    })}
                                  >
                                    <Icon
                                      name="close"
                                      size={24}
                                      color="#4B0082"
                                    />
                                  </TouchableOpacity>
                                </View>
                                )}
                              </View>
                            </View>
                          </View>
                        </View>
                      </View>
                    ) : (
                      <Text style={styles.nameEmailText}>
                        {this.state.password.replace(/./g, '*')}
                      </Text>
                    )}
                    <>
                      {this.state.error && (
                        <Text style={styles.error}>{this.state.error}</Text>
                      )}

                      {this.state.confirmed && (
                        <Text style={styles.confirmed}>
                          {this.state.confirmed}
                        </Text>
                      )}
                    </>
                  </View>
                  <TouchableOpacity
                    style={styles.buttonNameEmail}
                    onPress={() => this.setState({
                      isEditing: true,
                      editingField: 'password',
                      isEditingPassword: true,
                    })}
                  >
                    <Icon name="pencil" size={24} color="#4B0082" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }
}

UserInfo.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    addListener: PropTypes.func.isRequired,
  }).isRequired,
};
