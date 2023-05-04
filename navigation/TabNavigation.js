/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import {
  View, Text, StyleSheet,
} from 'react-native';
import PropTypes from 'prop-types';
import SearchStackNavigator from './SearchStackNavigator';
import BlockedStackNavigator from './BlockedStackNavigator';
import ChatStack from './ChatStack';
import ContactStack from './ContactStack';
import Logout from '../components/Logout';
import UserInfoStack from './UserInfoStack';
import DraftStackNavigator from './DraftStackNavigator';

const Stack = createStackNavigator();
const drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4B0082',
    height: 60,
  },
  headerIcon: {
    marginLeft: 10,
    color: '#fff',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
  },
  tabBarContainer: {
    borderTopWidth: 2,
    borderTopColor: '#4B0082',
    display: 'flex',
    height: 70,
    backgroundColor: '#fff',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  tabBarLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    paddingBottom: 5,
  },
});

function Home({ navigation }) {
  const { tabBarVisible } = true;
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.headerContainer}>
        <Ionicons
          name="menu"
          size={20}
          style={styles.headerIcon}
          onPress={() => navigation.openDrawer()}
        />
        <Text style={styles.headerText}>WhatsThat</Text>
      </View>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarVisible,
          tabBarIcon: ({ focused, color }) => {
            let iconName;
            if (route.name === 'ContactsTab') {
              iconName = focused ? 'people' : 'people-outline';
            } else if (route.name === 'ChatsTab') {
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person-circle' : 'person-circle-outline';
            }

            return <Ionicons name={iconName} size={20} color={color} />;
          },
          tabBarActiveBackgroundColor: '#4B0082',
          tabBarInactiveBackgroundColor: '#4B0082',
          tabBarActiveTintColor: '#fff',
          tabBarInactiveTintColor: '#FAF5FF',
          tabBarStyle: [styles.tabBarContainer, null],
          tabBarLabelStyle: styles.tabBarLabel,
        })}
      >
        <Tab.Screen
          name="ChatsTab"
          component={ChatStack}
          options={{
            tabBarLabel: 'Chats',
          }}
        />
        <Tab.Screen
          name="ContactsTab"
          component={ContactStack}
          options={{
            tabBarLabel: 'Contacts',
          }}
        />
        <Tab.Screen
          name="Profile"
          component={UserInfoStack}
          options={{
            tabBarLabel: 'Profile',
          }}
        />
      </Tab.Navigator>
    </View>
  );
}

function Drawer() {
  return (
    <drawer.Navigator
      useLegacyImplementation
      drawerStyle={{
        backgroundColor: '#FAF5FF',
        width: '80%',
      }}
      screenOptions={{
        drawerActiveTintColor: '#4B0082',
        drawerInactiveTintColor: '#4B0082',
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: 'bold',
        },
        drawerItemStyle: {
          marginVertical: 10,
          paddingHorizontal: 20,
        },
      }}
    >
      <drawer.Screen
        name="Home"
        component={Home}
        options={{
          drawerIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={size}
              color={color}
            />
          ),
          headerShown: false,
        }}
      />
      <drawer.Screen
        name="Search"
        component={SearchStackNavigator}
        options={{
          drawerIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'search' : 'search-outline'}
              size={size}
              color={color}
            />
          ),
          headerShown: false,
        }}
      />
      <drawer.Screen
        name="Drafts"
        component={DraftStackNavigator}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons
              name="create-outline"
              size={size}
              color={color}
            />
          ),
          headerShown: false,
        }}
      />
      <drawer.Screen
        name="Blocked"
        component={BlockedStackNavigator}
        options={{
          drawerIcon: ({ color, size }) => (
            <FontAwesome
              name="ban"
              size={size}
              color={color}
            />
          ),
          headerShown: false,
        }}
      />
      <drawer.Screen
        name="Logout"
        component={Logout}
        options={{
          drawerIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'exit' : 'exit-outline'}
              size={size}
              color={color}
            />
          ),
          headerShown: false,
        }}
      />

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
Home.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    openDrawer: PropTypes.func.isRequired,
    addListener: PropTypes.func.isRequired,
  }).isRequired,
  route: PropTypes.shape({
    params: PropTypes.bool,
    name: PropTypes.string,
  }).isRequired,
};

export default TabNavigation;
