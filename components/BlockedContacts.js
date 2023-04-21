import React, { Component } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default class BlockedContacts extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading,
      blockedUsers: [],
      blockedUsersVisible: false,
    };
  }
  async componentDidMount() {
    const token = await AsyncStorage.getItem("whatsthat_user_token");
    const blockedUsers = await AsyncStorage.getItem("whatsthat_blocked_users");
    if (blockedUsers) {
      this.setState({ blockedUsers: JSON.parse(blockedUsers) });
    }
    let blockedUrl = "http://10.0.2.2:3333/api/1.0.0/blocked";
    return fetch(blockedUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Authorization": token,
      },
    })
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        } else if (response.status === 401) {
          throw ("Unauthorised", this.props.navigation.navigate("Login"));
        } else {
          throw "Something went wrong";
        }
      })
      .then((responseJson) => {
        console.log(responseJson);
        this.setState({
          isLoading: false,
          blockedUsers: responseJson
        });
      });
  }
}
