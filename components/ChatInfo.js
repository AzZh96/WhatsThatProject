import React, { Component } from "react";
import { Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default class ChatInfo extends Component {
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
  //Patch Info
  //Add user - do a get /contacts, display contacts with a check box, 
  //those selected get sent to the POST /user/{user}
  //remove user

  render() {
    return (
      <View>
        <Text>Name: {this.state.name ? this.state.name : ""}</Text>
        <Text>
          Created by: {this.state.creator.first_name} {this.state.creator.last_name}
        </Text>
        <Text>Members:</Text>
        {this.state.members && this.state.members.length ? (
          this.state.members.length === 1 ? (
            <Text>
              {this.state.members[0].first_name} {this.state.members[0].last_name}
            </Text>
          ) : (
            this.state.members.map((member) => (
              <Text key={member.user_id}>
                {member.first_name} {member.last_name}
              </Text>
            ))
          )
        ) : null}
      </View>
    );
  }
}
