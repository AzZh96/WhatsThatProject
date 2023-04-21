import React, { Component } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";
import { Picker } from "@react-native-picker/picker";
import SearchContactsResults from "./SearchContactsResults";

export default class SearchContacts extends Component {
  constructor(props) {
    super(props);

    this.state = {
      searchText: "",
      searchIn: "all",
      searchLimit: 20,
      offset: 0,
      showResults: false,
    };
    this.handleSearch = this.handleSearch.bind(this);
  }

  handleSearch() {
    const { navigation } = this.props;
    this.setState({ showResults: false }, () => {
      this.setState({ showResults: true });
    });
    navigation.addListener("blur", () => {
      this.setState({ showResults: false });
    });
  }

  render() {
    const { searchText, searchIn, searchLimit, offset, showResults } = this.state;

    return (
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="Search by first name, last name, or email"
          value={searchText}
          onChangeText={(text) => this.setState({ searchText: text })}
        />
        <View style={styles.input}>
          <Text>Search in:</Text>
          <Picker
            style={styles.dropdown}
            selectedValue={searchIn}
            onValueChange={(value) => this.setState({ searchIn: value })}
          >
            <Picker.Item label="All" value="all" />
            <Picker.Item label="Contacts" value="contacts" />
          </Picker>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Limit"
          keyboardType="numeric"
          value={searchLimit.toString()}
          onChangeText={(text) => {
            const value = text.trim() === "" ? "" : parseInt(text);
            this.setState({ searchLimit: value });
          }}
        />
        <TextInput
          style={styles.input}
          placeholder="Offset"
          keyboardType="numeric"
          value={offset.toString()}
          onChangeText={(text) => {
            const value = text.trim() === "" ? "" : parseInt(text);
            this.setState({ offset: value });
          }}
        />
        <Button title="Search" onPress={this.handleSearch} />
        {showResults && (
          <SearchContactsResults
            q={searchText}
            search_in={searchIn}
            limit={searchLimit}
            offset={offset}
          />
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "flex-start",
  },
  input: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  dropdown: {
    flex: 1,
    marginLeft: 8,
    padding: 8,
    backgroundColor: "#f0f0f0",
  },
});
