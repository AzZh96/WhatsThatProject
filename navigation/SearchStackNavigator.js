import React, {Component} from "react";
import { createStackNavigator } from "@react-navigation/stack";
import SearchContacts from "../components/SearchContacts";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, StyleSheet, TouchableOpacity, Text, Button } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import Contacts from "../components/Contacts";
const stack = createStackNavigator();
export default class SearchStackNavigator extends Component{
constructor(props) {
  super(props);
}

render() {
  
  return ( 
    <stack.Navigator>
    <stack.Screen name="ContactsStack" component={Contacts} options={{ headerShown: false }} />
      <stack.Screen name="SearchNav" component={SearchContacts}  options={{
        title: "Search Users",
        headerLeft: () => (
          <TouchableOpacity style={styles.settingsButtonContainer} onPress={()=>{ this.props.navigation.navigate('Contacts')}}>
          <Ionicons name="arrow-back-outline"  size={24} color="#4B0082" />
          </TouchableOpacity>
        ),
        
      }}/>
    </stack.Navigator>
  );
};
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  settingsButtonContainer: {
    marginLeft: 10,
    
    flexDirection: 'row',
  },
  
});
