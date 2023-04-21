import React, {Component} from "react";
import { createStackNavigator } from "@react-navigation/stack";
import SearchContacts from "../components/SearchContacts";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, StyleSheet, TouchableOpacity, Text, Button } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import BlockedContacts from "../components/BlockedContacts";
const stack = createStackNavigator();
export default class BlockedStackNavigator extends Component{



constructor(props) {
  super(props);
}

render() {
  return (
    <stack.Navigator>
      <stack.Screen name="BlockedNav" component={BlockedContacts}  options={{
        title: "Blocked List",
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
