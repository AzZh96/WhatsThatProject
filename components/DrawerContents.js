import React, { Component } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { DrawerActions } from '@react-navigation/native';
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from "@react-navigation/drawer";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default class DrawerContents extends Component {
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

  async logout() {
    console.log("Logout");

    return fetch("http://10.0.2.2:3333/api/1.0.0/logout", {
      method: "POST",
      headers: {
        "X-Authorization": await AsyncStorage.getItem("whatsthat_user_token"),
      },
    })
      .then(async (response) => {
        if (response.status === 200) {
          await AsyncStorage.removeItem("whatsthat_user_id", response.id);
          await AsyncStorage.removeItem("whatsthat_user_token", response.token);
          this.props.navigation.navigate("Login");
        } else if (response.status === 401) {
          console.log("Unauthorised");
          await AsyncStorage.removeItem("whatsthat_user_id", response.id);
          await AsyncStorage.removeItem("whatsthat_user_token", response.token);

          this.props.navigation.navigate("Login");
        } else {
          throw "Something went wrong";
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  render() {
    const { navigation } = this.props;
    return (
      <DrawerContentScrollView {...this.props} style={styles.container} >
        <DrawerItemList {...this.props} />
        
        <DrawerItem
          label="Log Out"
          style={styles.logoutButton}
          onPress={() => {
            this.logout();
            this.props.navigation.dispatch(DrawerActions.closeDrawer());}}
        ></DrawerItem>
      </DrawerContentScrollView>
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
