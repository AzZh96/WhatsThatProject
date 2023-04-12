import React, { Component } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Contacts from "../components/Contacts";
import Chats from "../components/Chats";
import { Ionicons } from "@expo/vector-icons";
import UserInfo from "../components/UserInfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StyleSheet } from "react-native";
import ChatStack from "./ChatStack";
const Tab = createBottomTabNavigator();

export default class TabNavigation extends Component {
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
      <Tab.Navigator
        name="HomeTab"
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused }) => {
            let iconName;
            if (route.name === "Contacts") {
              iconName = focused ? "people" : "people-outline";
            } else if (route.name === "Chats") {
              iconName = focused ? "chatbubbles" : "chatbubbles-outline";
            } else if (route.name === "Profile") {
              iconName = focused ? "person-circle" : "person-circle-outline";
            }

            return <Ionicons name={iconName} />;
          },
          tabBarActiveTintColor: "purple",
          tabBarInactiveTintColor: "gray",
          tabBarStyle: [
            {
              display: "flex",
            },
            null,
          ],
        })}
      >
        <Tab.Screen
          name="Chats"
          component={ChatStack}
          options={{
            headerStyle: {
              backgroundColor: "#4B0082",
            },
            unmountOnBlur: true,
            headerTintColor: "#fff",
          }}
        />
        <Tab.Screen
          name="Contacts"
          component={Contacts}
          options={{
            headerShown: false,
            
            headerStyle: {
              backgroundColor: "#4B0082",
            },
            unmountOnBlur: true,
            headerTintColor: "#fff",
          }}
        />
        <Tab.Screen
          name="Profile"
          component={UserInfo}
          options={{
            headerStyle: {
              backgroundColor: "#4B0082",
            },
            unmountOnBlur: true,
            headerTintColor: "#fff",
          }}
        />
      </Tab.Navigator>
    );
  }
}
