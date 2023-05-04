import React, { Component } from 'react';
import {
  Button, StyleSheet, Text, TextInput, View,
} from 'react-native';
import PropTypes from 'prop-types';
import { Picker } from '@react-native-picker/picker';
import SearchContactsResults from './SearchContactsResults';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'flex-start',
    backgroundColor: '#FAF5FF',
  },
  inputSearchIn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,

  },
  textInput: {
    fontWeight: 'bold',
    fontStyle: 'italic',
    borderWidth: 1,
    borderColor: '#767676',
    paddingLeft: 5,
    backgroundColor: '#fff',
  },
  limit: {
    marginRight: 10,
  },
  offset: {
    marginRight: 3,
  },

  input: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  inputText: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#767676',
    paddingLeft: 5,
    backgroundColor: '#fff',
  },
  inputTextPlaceholder: {
    opacity: 0.5,

  },
  dropdown: {
    width: 182,
    height: 22,
    marginLeft: 15,
    fontWeight: 'bold',
    fontStyle: 'italic',
    backgroundColor: '#fff',
  },
});

export default class SearchContacts extends Component {
  constructor(props) {
    super(props);

    this.state = {
      searchText: '',
      searchIn: 'all',
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
    navigation.addListener('blur', () => {
      this.setState({ showResults: false });
    });
  }

  render() {
    const {
      searchText, searchIn, searchLimit, offset, showResults,
    } = this.state;

    return (
      <View style={styles.container}>
        <TextInput
          style={styles.inputText}
          placeholder="Search by first name, last name, or email"
          placeholderTextColor="#888"
          placeholderStyle={styles.inputTextPlaceholder}
          value={searchText}
          onChangeText={(text) => this.setState({ searchText: text })}
        />

        <View style={styles.inputSearchIn}>
          <Text style={{ marginRight: 20 }}>Search in:</Text>
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
          <Text style={styles.limit}>Limit Results: </Text>
          <TextInput
            style={styles.textInput}
            placeholder="Limit"
            keyboardType="numeric"
            value={searchLimit.toString()}
            onChangeText={(text) => {
              const value = text.trim() === '' ? '' : parseInt(text, 10);
              this.setState({ searchLimit: value });
            }}
          />
        </View>
        <View style={styles.input}>
          <Text style={styles.offset}>Offset Results: </Text>
          <TextInput
            style={styles.textInput}
            placeholder="Offset"
            keyboardType="numeric"
            value={offset.toString()}
            onChangeText={(text) => {
              const value = text.trim() === '' ? '' : parseInt(text, 10);
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
            navigation={this.props.navigation}
          />
        )}
      </View>
    );
  }
}

SearchContacts.propTypes = {
  navigation: PropTypes.shape({
    addListener: PropTypes.func.isRequired,
  }).isRequired,
};
