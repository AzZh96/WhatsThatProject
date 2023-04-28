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
    console.log("search")
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
        <View style={styles.inputSearchIn}>
          <Text style={{marginRight:20}}>Search in:</Text>
          <Picker
            style={styles.dropdown}
            selectedValue={searchIn}
            onValueChange={(value) => this.setState({ searchIn: value })}
          >
            <Picker.Item label="All" value="all" />
            <Picker.Item label="Contacts" value="contacts" />
          </Picker>
        </View>
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
        <Text style={{marginRight:7}}>Offset Results: </Text>
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
        <Button color="#4B0082" title="Search" onPress={this.handleSearch} />
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
  inputSearchIn: {
    flexDirection: "row",
    alignItems: "center",
    
  },
  headerText: {
    fontWeight: "bold",
    fontStyle: "italic"
  },

  input: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  dropdown: {
    flex: 1,
    marginLeft: 8,
    fontWeight: "bold",
    fontStyle: "italic",
    backgroundColor: "#f0f0f0",
  },
});
