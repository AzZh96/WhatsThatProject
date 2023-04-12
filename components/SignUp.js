import React, { Component } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { Header } from "react-native-elements";
import * as EmailValidator from "email-validator";


export default class SignUp extends Component {
  constructor(props) {
    super(props);

    this.state = {
      
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      confirmPassword: "",
      error: "",
      submitted: false,
      isLoading: true,
    };

    
  }

  signUp = () => {
    this.setState({ submitted: true });
    this.setState({ error: "" });

    if (
      !(
        this.state.first_name &&
        this.state.last_name &&
        this.state.email &&
        this.state.password &&
        this.state.confirmPassword
      )
    ) {
      this.setState({ error: "All fields are required" });
      return;
    }

    if (!EmailValidator.validate(this.state.email)) {
      this.setState({ error: "Must enter valid email" });
      return;
    }

    const PASSWORD_REGEX = new RegExp(
      "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$"
    );
    if (!PASSWORD_REGEX.test(this.state.password)) {
      this.setState({
        error:
          "Password isn't strong enough (One upper, one lower, one special, one number, at least 8 characters long)",
      });
      return;
    }

    if (this.state.password !== this.state.confirmPassword) {
      this.setState({
        error: "Passwords do not match",
      });
      return;
    }

    let to_send = {
      first_name: this.state.first_name,
      last_name: this.state.last_name,
      email: this.state.email,
      password: this.state.password,
    }
    

    return fetch("http://10.0.2.2:3333/api/1.0.0/user", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        
      },
      body: JSON.stringify(to_send)
    })
    .then((response) => {
      if(response.status === 201){
        return response.json()
      }else if(response.status === 400){
        throw 'Failed validation';
      }else{
        throw 'Something went wrong';
      } 
    })
    .then((responseJson) => {
      
      console.log(responseJson);
      this.setState({"error": "User added successfully"});
      this.setState({"submitted": false});
      this.props.navigation.navigate("Login");

    })
    .catch((errors) => {
      console.log(errors)
      
      this.setState({"submitted": false});
      
    }
    )
  };





  render() {
    const navigation = this.props.navigation;
    return (
      <ScrollView contentContainerStyle={{alignItems: 'center', justifyContent: 'center'}}>
        <View  style={styles.container}>
          <Header
            style={styles.headerContainer}
            centerComponent={{
              text: "WhatsThat",
              style:  { color: "white", fontSize: 30, width: 240, alignContent: "center", justifyContent: 'center',} ,
            }}
            backgroundColor="#4B0082"
          />

          <View style={styles.formContainer}>
            <Text style={styles.title}>Sign Up</Text>
            <View style={styles.firstBox}>
              <Text>First Name:</Text>
              <TextInput
                style={{
                  height: 40,
                  borderWidth: 1,
                  width: "100%",
                  padding: 5,
                }}
                placeholder="Enter First Name"
                onChangeText={(first_name) => this.setState({ first_name })}
                value={this.state.first_name}
              />

              <>
                {this.state.submitted && !this.state.first_name && (
                  <Text style={styles.error}>*First Name is required</Text>
                )}
              </>
            </View>
            <View style={styles.boxOutline}>
              <Text>Last Name:</Text>
              <TextInput
                style={{
                  height: 40,
                  borderWidth: 1,
                  width: "100%",
                  padding: 5,
                }}
                placeholder="Enter Last Name"
                onChangeText={(last_name) => this.setState({ last_name })}
                value={this.state.last_name}
              />

              <>
                {this.state.submitted && !this.state.last_name && (
                  <Text style={styles.error}>*Last Name is required</Text>
                )}
              </>
            </View>

            <View style={styles.boxOutline}>
              <Text>Email:</Text>
              <TextInput
                style={{
                  height: 40,
                  borderWidth: 1,
                  width: "100%",
                  padding: 5,
                }}
                placeholder="Enter email"
                onChangeText={(email) => this.setState({ email })}
                value={this.state.email}
              />

              <>
                {this.state.submitted && !this.state.email && (
                  <Text style={styles.error}>*Email is required</Text>
                )}
                {this.state.submitted &&
                  this.state.email &&
                  !EmailValidator.validate(this.state.email) && (
                    <Text style={styles.error}>*Must enter valid email</Text>
                  )}
              </>
            </View>

            <View style={styles.boxOutline}>
              <Text>Password:</Text>
              <TextInput
                style={{
                  height: 40,
                  borderWidth: 1,
                  width: "100%",
                  padding: 5,
                }}
                placeholder=" Enter password"
                onChangeText={(password) => this.setState({ password })}
                value={this.state.password}
                secureTextEntry
              />

              <>
                {this.state.submitted && !this.state.password && (
                  <Text style={styles.error}>*Password is required</Text>
                )}
              </>
            </View>

            <View style={styles.boxOutline}>
              <Text>Confirm Password:</Text>
              <TextInput
                style={{
                  height: 40,
                  borderWidth: 1,
                  width: "100%",
                  padding: 5,
                }}
                placeholder="Enter password again"
                onChangeText={(confirmPassword) =>
                  this.setState({ confirmPassword })
                }
                value={this.state.confirmPassword}
                secureTextEntry
              />

              <>
                {this.state.submitted && !this.state.confirmPassword && (
                  <Text style={styles.error}>
                    *Confirm Password is required
                  </Text>
                )}
                {this.state.submitted &&
                  this.state.confirmPassword &&
                  this.state.confirmPassword !== this.state.password && (
                    <Text style={styles.error}>*Passwords don't match</Text>
                  )}
              </>
            </View>

            <View style={styles.signupBtn}>
              <TouchableOpacity onPress={this.signUp}>
                <View style={styles.button}>
                  <Text style={styles.buttonText}>Sign Up</Text>
                </View>
              </TouchableOpacity>
            </View>

            <>
              {this.state.error && (
                <Text style={styles.error}>{this.state.error}</Text>
              )}
            </>

            <View>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={styles.login}>Already have an account? Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  title: {
    marginTop: 50,
    textAlign: "center",
    fontSize: 30,
    fontWeight: "bold",
    fontFamily: "",
    color: "#4B0082",
  },

  formContainer: {
    width: "80%",
  },
  firstBox: {
    marginTop: 40,
    marginBottom: 10,
  },
  boxOutline: {
    marginBottom: 10,
  },
  signupBtn: {},
  login: {
    justifyContent: "center",
    textDecorationLine: "underline",
  },
  button: {
    marginTop: 10,
    marginBottom: 30,
    backgroundColor: "#4B0082",
  },
  buttonText: {
    textAlign: "center",
    padding: 20,
    color: "white",
  },
  error: {
    color: "red",
    fontWeight: "900",
  },
});
