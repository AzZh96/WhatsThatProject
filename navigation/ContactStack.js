import React, { Component } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import ChatScreen from "../components/ChatScreen";
import Chats from "../components/Chats";
import { Ionicons } from "@expo/vector-icons";
import ChatInfo from "../components/ChatInfo";
import SearchChats from "../components/SearchChats";
import Contacts from "../components/Contacts";
import SearchContacts from "../components/SearchContacts";
import BlockedContacts from "../components/BlockedContacts";
const Stack = createStackNavigator();

export default class ContactStack extends Component {
  constructor(props) {
    super(props);
 
  }

  
  render() {
    
    return (
      <Stack.Navigator>
        <Stack.Screen name="Contacts" component={Contacts} options={{ headerShown: false }} />
       
        <Stack.Screen name="SearchContact" component={SearchContacts} options={{
          title: "Search for Contacts"
        }}/>
        <Stack.Screen name="BlockedContacts" component={BlockedContacts} options={{
          title: "Blocked Contacts"
        }}/>
      </Stack.Navigator>
    );
  }
}
