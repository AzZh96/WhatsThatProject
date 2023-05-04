import React, { Component } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import PropTypes from 'prop-types';
import { Header } from 'react-native-elements';
import * as EmailValidator from 'email-validator';
import { Toast } from 'react-native-toast-message/lib/src/Toast';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#FAF5FF',
  },
  headerContainer: {
    backgroundColor: '#4B0082',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    height: 80,
  },
  headerText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  title: {
    marginTop: 50,
    textAlign: 'center',
    fontSize: 30,
    fontWeight: 'bold',
    fontFamily: '',
    color: '#4B0082',
  },
  newUserInput: {
    height: 40,
    borderWidth: 1,
    width: '100%',
    padding: 5,
    backgroundColor: '#fff',
  },
  formContainer: {
    width: '80%',
  },
  firstBox: {
    marginTop: 40,
    marginBottom: 10,
  },
  boxOutline: {
    marginBottom: 10,
  },
  subHeader: {
    fontWeight: 'bold',
    color: '#4B0082',

  },
  login: {
    justifyContent: 'center',
    textDecorationLine: 'underline',
  },
  button: {
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: '#4B0082',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  buttonText: {
    textAlign: 'center',
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  error: {
    color: 'red',
    fontWeight: '900',
  },
});

export default class SignUp extends Component {
  constructor(props) {
    super(props);

    this.state = {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      confirmPassword: '',
      error: '',
      submitted: false,
      isLoading: false,
    };
  }

  signUp = () => {
    this.setState({ submitted: true });
    this.setState({ error: '' });

    if (
      !(
        this.state.first_name
        && this.state.last_name
        && this.state.email
        && this.state.password
        && this.state.confirmPassword
      )
    ) {
      this.setState({ error: 'All fields are required' });
      return;
    }

    if (!EmailValidator.validate(this.state.email)) {
      this.setState({ error: 'Must enter valid email' });
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])(?=.*[^\da-zA-Z]).{8,}$/;
    if (!passwordRegex.test(this.state.password)) {
      this.setState({
        error:
      'Password isn\'t strong enough (One upper, one lower, one special, one number, at least 8 characters long)',
      });
      return;
    }

    if (this.state.password !== this.state.confirmPassword) {
      this.setState({
        error: 'Passwords do not match',
      });
      return;
    }

    const toSend = {
      first_name: this.state.first_name,
      last_name: this.state.last_name,
      email: this.state.email,
      password: this.state.password,
    };

    fetch('http://localhost:3333/api/1.0.0/user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(toSend),
    })
      .then((response) => {
        if (response.status === 201) {
          Toast.show({
            type: 'success',
            text1: 'User Created',
          });
          return response.json();
        } if (response.status === 400) {
          throw new Error('Bad Request.');
        } else {
          throw new Error('Something went wrong when signing up.');
        }
      })
      .then(() => {
        this.setState({ submitted: false });
        this.props.navigation.navigate('Login');
      })
      .catch((error) => {
        this.setState({ submitted: false });
        Toast.show({
          type: 'error',
          text1: error.message,
        });
      });
  }

  render() {
    const { navigation } = this.props;
    return (
      <ScrollView contentContainerStyle={{ alignItems: 'center', justifyContent: 'center' }}>
        {this.state.isLoading ? (
          <View>
            <ActivityIndicator size="large" color="#4B0082" />
          </View>
        ) : (
          <View style={styles.container}>
            <Header
              containerStyle={styles.headerContainer}
              centerComponent={<Text style={styles.headerText}>WhatsThat</Text>}
            />

            <View style={styles.formContainer}>

              <Text style={styles.title}>Sign Up</Text>
              <View style={styles.firstBox}>
                <Text style={styles.subHeader}>First Name:</Text>
                <TextInput
                  style={styles.newUserInput}
                  placeholder="Enter First Name"
                  onChangeText={(firstName) => this.setState({ first_name: firstName })}
                  value={this.state.first_name}
                />

                <View>
                  {this.state.submitted && !this.state.first_name && (
                  <Text style={styles.error}>*First Name is required</Text>
                  )}
                </View>
              </View>
              <View style={styles.boxOutline}>
                <Text style={styles.subHeader}>Last Name:</Text>
                <TextInput
                  style={styles.newUserInput}
                  placeholder="Enter Last Name"
                  onChangeText={(lastName) => this.setState({ last_name: lastName })}
                  value={this.state.last_name}
                />

                <View>
                  {this.state.submitted && !this.state.last_name && (
                  <Text style={styles.error}>*Last Name is required</Text>
                  )}
                </View>
              </View>

              <View style={styles.boxOutline}>
                <Text style={styles.subHeader}>Email:</Text>
                <TextInput
                  style={styles.newUserInput}
                  placeholder="Enter email"
                  onChangeText={(email) => this.setState({ email })}
                  value={this.state.email}
                />

                <>
                  {this.state.submitted && !this.state.email && (
                  <Text style={styles.error}>*Email is required</Text>
                  )}
                  {this.state.submitted
                  && this.state.email
                  && !EmailValidator.validate(this.state.email) && (
                    <Text style={styles.error}>*Must enter valid email</Text>
                  )}
                </>
              </View>

              <View style={styles.boxOutline}>
                <Text style={styles.subHeader}>Password:</Text>
                <TextInput
                  style={styles.newUserInput}
                  placeholder="Enter password"
                  onChangeText={(password) => this.setState({ password })}
                  value={this.state.password}
                  secureTextEntry
                />

                <View>
                  {this.state.submitted && !this.state.password && (
                  <Text style={styles.error}>*Password is required</Text>
                  )}
                </View>
              </View>

              <View style={styles.boxOutline}>
                <Text style={styles.subHeader}>Confirm Password:</Text>
                <TextInput
                  style={styles.newUserInput}
                  placeholder="Enter password again"
                  onChangeText={(confirmPassword) => this.setState({ confirmPassword })}
                  value={this.state.confirmPassword}
                  secureTextEntry
                />

                <>
                  {this.state.submitted && !this.state.confirmPassword && (
                  <Text style={styles.error}>
                    *Confirm Password is required
                  </Text>
                  )}
                  {this.state.submitted
                  && this.state.confirmPassword
                  && this.state.confirmPassword !== this.state.password && (
                    <Text style={styles.error}>*Passwords do not match</Text>
                  )}
                </>
              </View>

              {/* eslint-disable-next-line react/jsx-no-useless-fragment */}
              <>
                {this.state.error && (
                <Text style={styles.error}>{this.state.error}</Text>
                )}
              </>

              <View style={styles.signupBtn}>
                <TouchableOpacity onPress={this.signUp}>
                  <View style={styles.button}>
                    <Text style={styles.buttonText}>Sign Up</Text>
                  </View>
                </TouchableOpacity>

              </View>

              <View style={styles.signupBtn}>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <View style={styles.button}>
                    <Text style={styles.buttonText}>Already have an account? Login</Text>
                  </View>
                </TouchableOpacity>

              </View>

            </View>

          </View>
        )}
      </ScrollView>
    );
  }
}

SignUp.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};
