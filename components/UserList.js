import React, { Component } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Header } from 'react-native-elements';
import UserListItem from './UserListItem';

export default class UserList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      users: [
        { id: 1, name: 'Alice', email: 'alice@example.com' },
        { id: 2, name: 'Bob', email: 'bob@example.com' },
        { id: 3, name: 'Charlie', email: 'charlie@example.com' },
        { id: 4, name: 'David', email: 'david@example.com' },
        { id: 5, name: 'Alice', email: 'alice@example.com' },
        { id: 6, name: 'Bob', email: 'bob@example.com' },
        { id: 7, name: 'Charlie', email: 'charlie@example.com' },
        { id: 8, name: 'David', email: 'david@example.com' },
        { id: 9, name: 'Alice', email: 'alice@example.com' },
        { id: 10, name: 'Bob', email: 'bob@example.com' },
        { id: 11, name: 'Charlie', email: 'charlie@example.com' },
        { id: 12, name: 'David', email: 'david@example.com' },
        { id: 13, name: 'Alice', email: 'alice@example.com' },
        { id: 14, name: 'Bob', email: 'bob@example.com' },
        { id: 15, name: 'Charlie', email: 'charlie@example.com' },
        { id: 16, name: 'David', email: 'david@example.com' },
      ],
    };
  }

  render() {
    return (
      <View style={styles.container}>
      <Header
          centerComponent={{ text: 'User List', style: { color: '#fff', fontSize: 24 } }}
          backgroundColor="#4B0082"
        />
        <FlatList
          data={this.state.users}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <UserListItem user={item} />}
        />
      </View>
    );
  }
  
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
  });

