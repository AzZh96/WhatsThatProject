import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import ChatScreen from '../components/ChatScreen';
import Chats from '../components/Chats';
import ChatInfo from '../components/ChatInfo';

const Stack = createStackNavigator();

function ChatStack({ navigation }) {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Chats" component={Chats} options={{ headerShown: false }} />
      <Stack.Screen
        name="ChatScreen"
        component={ChatScreen}
        options={({ route }) => ({
          title: route.params.chatInfo.name,
          headerRight: () => (
            <Ionicons
              name="ios-information-circle-outline"
              size={28}
              color="#fff"
              style={{ marginRight: 10 }}
              onPress={() => navigation.navigate('ChatInfo', { chatInfo: route.params.chatInfo })}
            />
          ),
          headerStyle: {
            backgroundColor: '#4B0082',
            height: 47,
            borderBottomWidth: 0,
          },
          headerTintColor: '#fff',
        })}
      />
      <Stack.Screen
        name="ChatInfo"
        component={ChatInfo}
        options={{
          title: 'Chat Information',
          headerStyle: {
            backgroundColor: '#4B0082',
            height: 47,
            borderBottomWidth: 0,
          },
          headerTintColor: '#fff',
        }}
      />
    </Stack.Navigator>
  );
}
ChatStack.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};

export default ChatStack;
