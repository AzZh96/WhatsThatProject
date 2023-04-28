import 'react-native-gesture-handler';
import React, { Component } from "react";
import { StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { AuthStackNavigator } from "./navigation/AuthStackNavigator";
import "react-native";

export default class App extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <NavigationContainer style={styles.container}>
        <AuthStackNavigator />
      </NavigationContainer>
    );
  }
}
  render() {
    return (
      <NavigationContainer style={styles.container}>
        <AuthStackNavigator />
      </NavigationContainer>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
