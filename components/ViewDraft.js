import React, { Component } from 'react';
import {
  View, TextInput, Button, StyleSheet,
} from 'react-native';
import PropTypes from 'prop-types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Toast } from 'react-native-toast-message/lib/src/Toast';

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#FAF5FF',
  },
  input: {
    marginBottom: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  button: {
    borderRadius: 4,
    color: '#fff',
  },
});

export default class ViewDraft extends Component {
  constructor(props) {
    super(props);

    this.state = {
      messageInput: props.route.params.draft.messageInput,
    };
  }

  handleSave = async () => {
    const { draft, chatId } = this.props.route.params;
    const { messageInput } = this.state;
    const draftsString = await AsyncStorage.getItem('drafts');
    const drafts = JSON.parse(draftsString) || [];
    const index = drafts.findIndex((d) => d.chatId === chatId && d.messageId === draft.messageId);
    const newDraft = { ...draft, messageInput };
    if (index !== -1) {
      drafts.splice(index, 1, newDraft);
    } else {
      drafts.push(newDraft);
    }
    await AsyncStorage.setItem('drafts', JSON.stringify(drafts));
    Toast.show({
      type: 'success',
      text1: 'Draft Edited Successfully',
    });
    this.props.navigation.replace('DraftList', { chatId, draft: newDraft });
  };

  render() {
    const { messageInput } = this.state;
    const isMessageInputEmpty = messageInput.trim().length === 0;

    return (
      <View style={styles.container}>
        <TextInput
          value={messageInput}
          placeholder="Enter message.."
          onChangeText={(text) => this.setState({ messageInput: text })}
          style={styles.input}
        />
        <Button color="#4B0082" title="Save" onPress={this.handleSave} disabled={isMessageInputEmpty} style={styles.button} />
      </View>
    );
  }
}

ViewDraft.propTypes = {
  navigation: PropTypes.shape({
    replace: PropTypes.func.isRequired,
  }).isRequired,
  route: PropTypes.shape({
    params: PropTypes.shape({
      chatId: PropTypes.number.isRequired,
      draft: PropTypes.shape({
        messageInput: PropTypes.string.isRequired,
        messageId: PropTypes.string.isRequired,

      }).isRequired,
    }).isRequired,
  }).isRequired,
};
