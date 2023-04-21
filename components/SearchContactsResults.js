import React, { Component } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default class SearchContactResults extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: [],
      isLoading: true,
      contactActionsVisible: false,
      selectedContact: null,
      blockedUsers: [],
      addedUsers: [],
      error: "",
      loggedInUserId: "",
      filteredData: [],
      isContactAdded: false,
    };
  }

  async componentDidMount() {
    const { q, search_in, limit, offset } = this.props;
    const token = await AsyncStorage.getItem("whatsthat_user_token");
    console.log(token);
    this.state.loggedInUserId = await AsyncStorage.getItem("whatsthat_user_id");
    const addedUsers = await AsyncStorage.getItem("whatsthat_added_users");
    if (addedUsers) {
      this.setState({ addedUsers: JSON.parse(addedUsers) });
    }
    const blockedUsers = await AsyncStorage.getItem("whatsthat_blocked_users");
    if (blockedUsers) {
      this.setState({ blockedUsers: JSON.parse(blockedUsers) });
    }

    console.log("addedUsers", this.state.addedUsers);
    // Define the URLs for the three API endpoints
    let searchUrl = `http://10.0.2.2:3333/api/1.0.0/search?q=${q}&search_in=${search_in}&limit=${limit}&offset=${offset}`;
    let contactsUrl = "http://10.0.2.2:3333/api/1.0.0/contacts";
    let blockedUrl = "http://10.0.2.2:3333/api/1.0.0/blocked";

    // Make the three fetch requests simultaneously and parse the responses as JSON
    Promise.all([
      fetch(searchUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Authorization": token,
        },
      }),
      fetch(contactsUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Authorization": token,
        },
      }),
      fetch(blockedUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Authorization": token,
        },
      }),
    ])
      .then((responses) =>
        Promise.all(responses.map((response) => response.json()))
      )
      .then(([searchResponse, contactsResponse, blockedResponse]) => {
        const blockedUsers = blockedResponse.map(
          (blockedUser) => blockedUser.user_id
        );
        const data = searchResponse
          .filter((contact) => !blockedUsers.includes(contact.user_id))
          .map((contact) => ({
            ...contact,
          }));
        console.log(data);

        this.setState({ data: data, isLoading: false });
      })
      .catch((error) => {
        console.log(error);
        this.setState({ isLoading: false, error: error });
      });
  }

  handleAddContact = async (contact) => {
    const token = await AsyncStorage.getItem("whatsthat_user_token");
    const { addedUsers } = this.state;

    // Make the API call to add the contact
    fetch(`http://10.0.2.2:3333/api/1.0.0/user/${contact.user_id}/contact`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Authorization": token,
      },
    })
      .then((response) => {
        if (response.status === 200) {
          console.log("Contact Added");

          // Update the addedUsers state and save to AsyncStorage
          const updatedAddedUsers = [...addedUsers, contact];
          AsyncStorage.setItem(
            "whatsthat_added_users",
            JSON.stringify(updatedAddedUsers)
          );
          this.setState({
            addedUsers: updatedAddedUsers,
            contactActionsVisible: false,
            selectedContact: null,
          });
        } else {
          throw "Something went wrong";
        }
      })
      .catch((error) => {
        console.log(error);
        this.setState({ isLoading: false, error: error });
      });
  };

  handleRemoveContact = async (contact) => {
    const token = await AsyncStorage.getItem("whatsthat_user_token");
    const { addedUsers } = this.state;

    // Make the API call to remove the contact
    fetch(`http://10.0.2.2:3333/api/1.0.0/user/${contact.user_id}/contact`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "X-Authorization": token,
      },
    })
      .then((response) => {
        if (response.status === 200) {
          console.log("Contact Removed");
          console.log("Contacts: ", addedUsers);
          // Update the addedUsers state and save to AsyncStorage
          const updatedAddedUsers = addedUsers.filter(
            
            (user) => user.user_id !== contact.user_id
          );
          console.log("updated", updatedAddedUsers)
          AsyncStorage.setItem(
            "whatsthat_added_users",
            JSON.stringify(updatedAddedUsers)
          );
          this.setState({
            addedUsers: updatedAddedUsers,
            contactActionsVisible: false,
            selectedContact: null,
          });
        } else {
          throw "Something went wrong";
        }
      })
      .catch((error) => {
        console.log(error);
        this.setState({ isLoading: false, error: error });
      });
  };

  handleCancel = () => {
    this.setState({
      contactActionsVisible: false,
      selectedContact: null,
      error: "",
    });
  };

  render() {
    const {
      data,
      isLoading,
      error,
      contactActionsVisible,
      selectedContact,
      addedUsers,
      blockedUsers,
    } = this.state;

    const isContactAdded =
      addedUsers.find((user) => user.user_id === selectedContact?.user_id) !==
      undefined;

    return (
      <View style={styles.container}>
        {isLoading ? (
          <Text>Loading...</Text>
        ) : (
          <FlatList
            data={data}
            keyExtractor={(item) => item.user_id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  if (item.user_id !== this.state.loggedInUserId) {
                    this.setState({
                      contactActionsVisible: true,
                      selectedContact: item,
                    });
                  }
                }}
                disabled={
                  item.user_id.toString() ===
                  this.state.loggedInUserId.toString()
                }
              >
                <Text style={styles.itemText}>
                  {item.given_name} {item.family_name} ({item.email})
                </Text>
              </TouchableOpacity>
            )}
          />
        )}

        <Modal visible={contactActionsVisible} animationType="fade" transparent>
          <View style={styles.containerPopup}>
            <View style={styles.popup}>
              {isContactAdded ? (
                <Text>Contact already added</Text>
              ) : (
                <TouchableOpacity
                  onPress={() => this.handleAddContact(selectedContact)}
                  style={styles.button}
                >
                  <Text style={styles.buttonText}>Add Contact</Text>
                </TouchableOpacity>
              )}
              {isContactAdded && (
                <TouchableOpacity
                  onPress={() => this.handleRemoveContact(selectedContact)}
                  style={styles.button}
                >
                  <Text style={styles.buttonText}>Remove Contact</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={this.handleCancel}
                style={styles.button}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity
              style={styles.modalOverlay}
              onPress={() => {
                this.setState({ contactActionsVisible: false });
              }}
            />
        </Modal>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  containerPopup: {
       zIndex: 9999,
      top: 250,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    
  },
  popup: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    width: "100%",
    position: "relative",
    bottom: 0,
  },
  itemText: {
    fontSize: 16,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#2196F3",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  error: {
    color: "red",
    marginBottom: 10,
  },
  errorContainer: {
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
  },
  errorText: {
    color: "#fff",
    fontSize: 16,
  },
});
