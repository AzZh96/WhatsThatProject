import React, { Component } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import ChatScreen from "../components/ChatScreen";
import Chats from "../components/Chats";
import { Ionicons } from "@expo/vector-icons";
import ChatInfo from "../components/ChatInfo";
const Stack = createStackNavigator();

export default class ChatStack extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { navigation } = this.props;
    return (
      <Stack.Navigator>
        <Stack.Screen name="ChatsStack" component={Chats} options={{ headerShown: false }} />
        <Stack.Screen
          name="ChatScreen"
          component={ChatScreen}
          options={({ route }) => ({
            title: route.params.chatInfo.name,
            headerRight: () => (
              <Ionicons
                name="ios-information-circle-outline"
                size={28}
                color="#4B0082"
                style={{ marginRight: 10 }}
                onPress={() =>
                  navigation.navigate("ChatInfo", { chatInfo: route.params.chatInfo })
                }
              />
            ),
          })}
        />
        <Stack.Screen name="ChatInfo" component={ChatInfo} options={{
          title: "Chat Information"
        }}/>
      </Stack.Navigator>
    );
  }
}
