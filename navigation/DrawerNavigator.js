import React, { Component } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";

import { createDrawerNavigator } from "@react-navigation/drawer";
import TabNavigation from "./TabNavigation";
import DrawerContents from "../components/DrawerContents";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SearchStackNavigator from "./SearchStackNavigator";
import SearchContacts from "../components/SearchContacts";

import BlockedStackNavigator from "./BlockedStackNavigator";
const Drawer = createDrawerNavigator();

export default class DrawerNavigator extends Component {
  constructor(props) {
    super(props);
  }
  async componentDidMount() {
    this.unsubscribe = this.props.navigation.addListener("focus", () => {
      this.checkedLoggedIn();
    });
    await this.checkedLoggedIn();
    this.setState({
      isLoading: false,
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  checkedLoggedIn = async () => {
    const value = await AsyncStorage.getItem("whatsthat_user_token");
    if (value == null) {
      this.props.navigation.navigate("Login");
    }
  };

  render() {
    return (
      <Drawer.Navigator
        screenOptions={{
          headerShown: false,
          drawerStyle: {
            backgroundColor: "#E9E2F7",
          },
        }}
        useLegacyImplementation={false}
        drawerContent={(props) => <DrawerContents {...props} />}
      >
        <Drawer.Screen
          name="Home"
          component={TabNavigation}
          options={{
            drawerItemStyle: {
              backgroundColor: "#ccc",
              padding: 10,
            },
          }}
        />
        <Drawer.Screen
          name="Search"
          component={SearchStackNavigator}
          options={{
            drawerItemStyle: {
              backgroundColor: "#ccc",
              padding: 10,
            },
          }}
        />
        <Drawer.Screen
          name="Blocked"
          component={BlockedStackNavigator}
          options={{
            drawerItemStyle: {
              backgroundColor: "#ccc",
              padding: 10,
            },
          }}
        />
      </Drawer.Navigator>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchButton: {
    backgroundColor: "#ccc",
    padding: 10,
    marginTop: 20,
  },
  logoutButton: {
    backgroundColor: "#ccc",
    padding: 10,
    marginBottom: 20,
  },
});
