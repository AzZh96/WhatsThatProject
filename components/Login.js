import React, { Component } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import PropTypes from 'prop-types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Header } from 'react-native-elements';
import * as EmailValidator from 'email-validator';

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
    color: '#4B0082',

  },
  subHeader: {
    fontWeight: 'bold',
    color: '#4B0082',

  },

  userInfoInput: {
    height: 40,
    borderWidth: 1,
    width: '100%',
    padding: 5,
    backgroundColor: '#fff',
  },
  formContainer: {
    width: '80%',
  },
  email: {
    marginTop: 40,
    marginBottom: 20,
  },
  password: {
    marginBottom: 20,
  },
  signup: {
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
    marginBottom: 10,
  },
});

export default class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: 'aaron@mmu.com',
      password: 'Aaron!23',
    };
  }

  login = async () => {
    if (!(this.state.email && this.state.password)) {
      this.setState({ error: 'Must enter email and password' });
      return;
    }

    if (!EmailValidator.validate(this.state.email)) {
      this.setState({ error: 'Must enter valid email' });
      return;
    }

    const toSend = {
      email: this.state.email,
      password: this.state.password,
    };

    try {
      const response = await fetch('http://localhost:3333/api/1.0.0/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(toSend),
      });

      if (response.status === 200) {
        const rJson = await response.json();
        await AsyncStorage.setItem('whatsthat_user_id', rJson.id.toString());
        await AsyncStorage.setItem('whatsthat_user_token', rJson.token);
        await AsyncStorage.setItem('whatsthat_user_password', this.state.password);
        this.props.navigation.navigate('TabNav');
      } else if (response.status === 400) {
        this.setState({ error: 'Invalid email/password supplied' });
      } else {
        this.setState({ error: 'Server Error' });
      }
    } catch (error) {
      throw new Error(error);
    }
  };

  render() {
    const { navigation } = this.props;
    return (
      <View style={styles.container}>

        <Header
          containerStyle={styles.headerContainer}
          centerComponent={<Text style={styles.headerText}>WhatsThat</Text>}
        />

        <View style={styles.formContainer}>
          <Text style={styles.title}>
            Welcome to
            {'\n'}
            WhatsThat
          </Text>
          <View style={styles.email}>
            <Text style={styles.subHeader}>Email:</Text>
            <TextInput
              style={styles.userInfoInput}
              placeholder=" Enter email"
              onChangeText={(email) => this.setState({ email })}
              value={this.state.email}
            />

            {this.state.submitted && !this.state.email && (
            <Text style={styles.error}>*Email is required</Text>
            )}

          </View>

          <View style={styles.password}>
            <Text style={styles.subHeader}>Password:</Text>
            <TextInput
              style={styles.userInfoInput}
              placeholder=" Enter password"
              onChangeText={(password) => this.setState({ password })}
              value={this.state.password}
              secureTextEntry
            />

            {this.state.submitted && !this.state.password && (
            <Text style={styles.error}>*Password is required</Text>
            )}

          </View>

          {this.state.error && (
          <Text style={styles.error}>{this.state.error}</Text>
          )}

          <View style={styles.loginBtn}>
            <TouchableOpacity onPress={this.login}>
              <View style={styles.button}>
                <Text style={styles.buttonText}>Login</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.loginBtn}>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <View style={styles.button}>
                <Text style={styles.buttonText}>Sign Up</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

      </View>
    );
  }
}

Login.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    addListener: PropTypes.func.isRequired,
  }).isRequired,
};
