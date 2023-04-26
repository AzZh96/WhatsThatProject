import React, { Component } from "react";
import { Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default class ChatScreen extends Component {
  constructor(props) {
    super(props);

    const chatInfo = this.props.route.params.chatInfo;

    this.state = {
      name: chatInfo.name,
      creator: chatInfo.creator,
      members: chatInfo.members,
      messages: chatInfo.messages,
    };
  }

  render() {
    return (
      <View>
        <Text>{this.state.name ? this.state.name : ""}</Text>
        {/* <Text>
          Created by: {this.state.creator.first_name} {this.state.creator.last_name}
        </Text>
        <Text>Members:</Text>
        {this.state.members.map((member) => (
          <Text key={member.user_id}>
            {member.first_name} {member.last_name}
          </Text>
        ))} */}
        <Text>Messages:</Text>
        {this.state.messages && this.state.messages.length ? (
          this.state.messages.map((message) => (
            <View key={message.message_id}>
              <Text>
                {message.author.first_name} {message.author.last_name}
              </Text>
              <Text>{message.message}</Text>
            </View>
          ))
        ) : (
          <Text>No messages yet</Text>
        )}
      </View>
    );
  }
}
