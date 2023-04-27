import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import UserInfo from "../components/UserInfo";
import ChatStack from "./ChatStack";
import { createStackNavigator } from "@react-navigation/stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { View, Text, Button, TouchableOpacity, StyleSheet } from "react-native";
import ContactStack from "./ContactStack";

const Stack = createStackNavigator();
const drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4B0082",
    height: 60,
  },
  headerIcon: {
    marginLeft: 10,
    color: "#fff",
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 10,
  },
  tabBarContainer: {
    display: "flex",
    height: 60,
    borderTopWidth: 0,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  tabBarLabel: {
    fontSize: 14,
    fontWeight: "bold",
    paddingBottom: 5,
  },
});

function Home({ navigation, route }) {
  const { tabBarVisible } = route.params || { tabBarVisible: true };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.headerContainer}>
        <Ionicons
          name="menu"
          size={24}
          style={styles.headerIcon}
          onPress={() => navigation.openDrawer()}
        />
        <Text style={styles.headerText}>WhatsThat</Text>
      </View>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarVisible,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === "Contacts") {
              iconName = focused ? "people" : "people-outline";
            } else if (route.name === "Chats") {
              iconName = focused ? "chatbubbles" : "chatbubbles-outline";
            } else if (route.name === "Profile") {
              iconName = focused ? "person-circle" : "person-circle-outline";
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarStyle: [styles.tabBarContainer, null],
          tabBarLabelStyle: styles.tabBarLabel,
        })}
        tabBarOptions={{
          activeTintColor: "#4B0082",
          inactiveTintColor: "gray",
        }}
      >
        <Tab.Screen
          name="Chats"
          component={ChatStack}
          options={{
            tabBarLabel: "Chats",
          }}
        />
        <Tab.Screen
          name="Contacts"
          component={ContactStack}
          options={{
            tabBarLabel: "Contacts",
          }}
        />
        <Tab.Screen
          name="Profile"
          component={UserInfo}
          options={{
            tabBarLabel: "Profile",
          }}
        />
      </Tab.Navigator>
    </View>
  );
}

function Drawer() {
  return (
    <drawer.Navigator useLegacyImplementation>
      <drawer.Screen name="Home" component={Home} options={{headerShown: false}} />
    </drawer.Navigator>
  );
}

function TabNavigation() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Drawer"
        component={Drawer}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
export default TabNavigation;
