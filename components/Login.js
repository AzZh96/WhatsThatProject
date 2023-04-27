import React, { Component } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Button
} from "react-native";
import { Header } from "react-native-elements";
import * as EmailValidator from "email-validator";
import AsyncStorage from "@react-native-async-storage/async-storage";


export default class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: "",
      password: "",
      error: ""
    };

    
  }

  login = async () => {
    

    if (!(this.state.email && this.state.password)) {
      this.setState({ error: "Must enter email and password" });
      return;
    }

    if (!EmailValidator.validate(this.state.email)) {
      this.setState({ error: "Must enter valid email" });
      return;
    }

    let to_send = {
      email: this.state.email,
      password: this.state.password,
    }
    return fetch("http://localhost:3333/api/1.0.0/login", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(to_send)    
    })
    .then((response) => {
      if(response.status === 200){
        console.log("tried to login");
        return response.json()
        
      }else if(response.status === 400){
        this.setState({ error: "Invalid email/password supplied" });
        console.log("error");
      }else{
        this.setState({ error: "Server Error" });
      }
    })
    .then(async (rJson) => {
      console.log(rJson)
      
        await AsyncStorage.setItem("whatsthat_user_id", rJson.id.toString())
        await AsyncStorage.setItem("whatsthat_user_token", rJson.token)
        await AsyncStorage.setItem("whatsthat_user_password", this.state.password)
        
        this.props.navigation.navigate("Home")
      
    }).catch((error) => {
      
      console.log(error);
    });
  }
  
//   clearAsyncStorage = async() => {
//     AsyncStorage.clear();
// }
  render() {
    const navigation = this.props.navigation;
    return (
      <View style={styles.container}>
        
        <Header style={styles.headerContainer}
          centerComponent={{
            text: "WhatsThat",
            style: { paddingLeft: 45, color: "white", fontSize: 30, width: 240, alignContent: "center", justifyContent: 'center',},
          }}
          backgroundColor="#4B0082"
        />

        <View style={styles.formContainer}>
          <Text style={styles.title}>Welcome to{'\n'}WhatsThat</Text>
          <View style={styles.email}>
            <Text>Email:</Text>
            <TextInput
              style={{ height: 40, borderWidth: 1, width: "100%", padding: 5 }}
              placeholder=" Enter email"
              onChangeText={(email) => this.setState({ email })}
              value={this.state.email}
            />

            <>
              {this.state.submitted && !this.state.email && (
                <Text style={styles.error}>*Email is required</Text>
              )}
            </>
          </View>

          <View style={styles.password}>
            <Text>Password:</Text>
            <TextInput
              style={{ height: 40, borderWidth: 1, width: "100%", padding: 5 }}
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

          <View style={styles.loginBtn}>
            <TouchableOpacity onPress={this.login}>
              <View style={styles.button}>
                <Text style={styles.buttonText}>Login</Text>
              </View>
            </TouchableOpacity>
          </View>

          <>
            {this.state.error && (
              <Text style={styles.error}>{this.state.error}</Text>
            )}
          </>

          <View>
            <TouchableOpacity  onPress={() => navigation.navigate('SignUp')} >
            <Text style={styles.signup}>Need an account? Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
        
      </View>
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
  headerContainer: {

  },
  title:{
    marginTop: 50,
    textAlign: "center",
    fontSize: 30,
    fontWeight: "bold",
    fontFamily: "",
    color: "#4B0082"
    

  },
  
  formContainer: {
    width: "80%",
    
  },
  email: {
    marginTop: 40,
    marginBottom: 5,
  },
  password: {
    marginBottom: 10,
  },
  loginBtn: {

  },
  signup: {
    justifyContent: "center",
    textDecorationLine: "underline",
  },
  button: {
    marginTop:10,
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
