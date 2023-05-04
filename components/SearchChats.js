import React, { Component } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";
import { Picker } from "@react-native-picker/picker";
import SearchChatsResults from "./SearchChatsResults";

export default class SearchChats extends Component {
  constructor(props) {
    super(props);

    this.state = {
      searchId: "",
      searchLimit: 20,
      offset: 0,
      showResults: false,
      error: null,
    };
    this.handleSearch = this.handleSearch.bind(this);
  }

  handleSearch() {
    const { navigation } = this.props;
    const { searchId } = this.state;

    if (!searchId || isNaN(searchId)) {
      this.setState({ error: "Please enter a valid search ID." });
      return;
    }

    this.setState({ showResults: false, error: null }, () => {
      this.setState({ showResults: true });
    });
    navigation.addListener("blur", () => {
      this.setState({ showResults: false });
    });
  }

  render() {
    const { searchId, searchLimit, offset, showResults, error } = this.state;

    return (
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="Search by chat id"
          value={searchId}
          onChangeText={(id) => this.setState({ searchId: id })}
          keyboardType="numeric"
        />
        {error && <Text style={styles.error}>{error}</Text>}
        <View style={styles.input}>
          <Text style={{marginRight:10}}>Limit Results: </Text>
          <TextInput
          style={styles.headerText}
            placeholder="Limit"
            keyboardType="numeric"
            value={searchLimit.toString()}
            onChangeText={(text) => {
              const value = text.trim() === "" ? "" : parseInt(text);
              this.setState({ searchLimit: value });
            }}
          />
        </View>
        <View style={styles.input}>
          <Text style={{marginRight:8}}>Offset Results: </Text>
          <TextInput
          style={styles.headerText}
            placeholder="Offset"
            keyboardType="numeric"
            value={offset.toString()}
            onChangeText={(text) => {
              const value = text.trim() === "" ? "" : parseInt(text);
              this.setState({ offset: value });
            }}
          />
        </View>
        <Button
          color="#4B0082"
          title="Search"
          onPress={this.handleSearch}
          disabled={!searchId || isNaN(searchId)}
        />
        {showResults && (
          <SearchChatsResults
            q={searchId}
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
  headerText: {
    fontWeight: "bold",
    fontStyle: "italic"
  },
  error: {
    color: "red",
    marginBottom: 16,
  },
});
