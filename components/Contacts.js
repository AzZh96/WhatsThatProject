import React, { Component } from "react";
import {
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

export default class Contacts extends Component {
  constructor(props) {
    super(props);

    this.state = {
      contacts: [],
      blockedUsers: [],
      selectedContact: null,
      contactActionsVisible: false,
      error: null,
      isLoading: true,
      showViewBlockedContacts: false,
    };
  }
  async componentDidMount() {
    this.unsubscribe = this.props.navigation.addListener("focus", () => {
      this.checkedLoggedIn();
      this.refreshContacts();
    });
    await this.checkedLoggedIn();
    this.setState({
      isLoading: false,
    });
    this.refreshContacts();
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  checkedLoggedIn = async () => {
    const value = await AsyncStorage.getItem("whatsthat_user_token");
    if (value == null) {
      this.props.navigation.navigate("Login");
    }
  };

  refreshContacts = async() => {
    const token = await AsyncStorage.getItem("whatsthat_user_token");
    return fetch("http://10.0.2.2:3333/api/1.0.0/contacts", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Authorization": token,
      },
    })
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        } else if (response.status === 401) {
          throw ("Unauthorised", this.props.navigation.navigate("Login"));
        } else {
          throw "Something went wrong";
        }
      })
      .then((responseJson) => {
        console.log(responseJson);
        this.setState({
          isLoading: false,
          contacts: responseJson,
          showViewBlockedContacts: false,
        });
      })
      .catch((error) => {
        this.setState({ error: error.message });
      });
  }



  getFirstLetter(str) {
    return str?.charAt(0);
  }

  handleRemoveContact = async (contact) => {
    const token = await AsyncStorage.getItem("whatsthat_user_token");
    const { contacts } = this.state;

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

          // Update the state and save to AsyncStorage
          const updatedContacts = contacts.filter(
            (c) => c.user_id !== contact.user_id
          );

          console.log("wwwww", updatedContacts);
          AsyncStorage.setItem(
            "whatsthat_added_users",
            JSON.stringify(updatedContacts)
          );

          this.setState({
            contacts: updatedContacts,
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

  handleBlockContact = async (contact) => {
    const token = await AsyncStorage.getItem("whatsthat_user_token");
    const { blockedUsers } = this.state;

    // Make the API call to add the contact
    fetch(`http://10.0.2.2:3333/api/1.0.0/user/${contact.user_id}/block`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Authorization": token,
      },
    })
      .then((response) => {
        if (response.status === 200) {
          console.log("Contact Blocked");

          // Update the state and save to AsyncStorage
          const updatedBlockedUsers = [...blockedUsers, contact.user_id];
          AsyncStorage.setItem(
            "whatsthat_blocked_users",
            JSON.stringify(updatedBlockedUsers)
          );
          this.setState({
            blockedUsers: updatedBlockedUsers,
            contactActionsVisible: false,
            selectedContact: null,
          });

          this.getContacts();
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
      showViewBlockedContacts: false,
    });
  };
  hideModal = () => this.setState({ isModalVisible: false });
  render() {
    const {
      data,
      isLoading,
      error,
      contactActionsVisible,
      selectedContact,
      showViewBlockedContacts,
    } = this.state;

    return (
      <View>
        <Modal visible={showViewBlockedContacts} transparent={true}>
          <View style={styles.modalContainer}>
            <View style={styles.popupDots}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => this.props.navigation.navigate("Blocked")}
              >
                <Text style={styles.buttonText}>View Blocked List</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                onPress={this.handleCancel}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity
            style={styles.modalOverlay}
            onPress={() => {
              this.setState({ showViewBlockedContacts: false });
            }}
          />
        </Modal>
        <View style={styles.header}>
          <Text style={styles.headerText}>Contacts</Text>
          <View style={styles.settingsButtonContainer}>
            <TouchableOpacity
              style={styles.settingsButtons}
              onPress={() => {
                this.props.navigation.navigate("Search");
              }}
            >
              <Ionicons name="search-sharp" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.settingsButtons}
              onPress={() => {
                this.setState({
                  showViewBlockedContacts: true,
                });
              }}
            >
              <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.container}>
          {isLoading ? (
            <View>
              <ActivityIndicator size="large" color="ff00ff00" />
            </View>
          ) : (
            this.state.contacts.map((contact) => {
              return (
                <TouchableOpacity
                  key={contact.user_id}
                  style={styles.contact}
                  onPress={() => {
                    this.setState({
                      contactActionsVisible: true,
                      selectedContact: contact,
                    });
                  }}
                >
                  <View style={styles.circle}>
                    <Text style={styles.initials}>
                      {contact?.first_name
                        ? this.getFirstLetter(contact.first_name)
                        : "UU"}
                    </Text>
                  </View>
                  <View style={styles.details}>
                    <Text style={styles.name}>
                      {contact.first_name} {contact.last_name}
                    </Text>
                    <Text style={styles.email}>{contact.email}</Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
          <Modal
            visible={contactActionsVisible}
            animationType="fade"
            transparent
          >
            <View style={styles.containerPopup}>
              <View style={styles.popupContact}>
                <TouchableOpacity
                  onPress={() => this.handleRemoveContact(selectedContact)}
                  style={styles.button}
                >
                  <Text style={styles.buttonText}>Remove Contact</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => this.handleBlockContact(selectedContact)}
                  style={styles.button}
                >
                  <Text style={styles.buttonText}>Block Contact</Text>
                </TouchableOpacity>

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
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    alignItems: "flex-start",
    justifyContent: "flex-start",
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#4B0082",
    padding: 14.5,
  },
  headerText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  settingsButtonContainer: {
    marginRight: 10,

    flexDirection: "row",
  },
  settingsButtons: {
    marginLeft: 10,
    zIndex: 9998,
  },
  circle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E9E2F7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    borderWidth: 2,
    borderColor: "#4B0082",
  },
  containerPopup: {
    top: 250,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  popupContact: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    width: "100%",
    position: "relative",
    bottom: 0,
    zIndex: 9999,
  },
  popupDots: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    width: "100%",
    borderWidth: 1,
    borderColor: "#4B0082",

    zIndex: 9999,
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
  initials: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4B0082",
  },
  details: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
  },
  contact: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: "#4B0082",
    paddingBottom: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
  },
  email: {
    fontSize: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  modalContainer: {
    alignItems: "center",
    alignSelf: "flex-end", // Align to the right side of the screen
    position: "absolute",
    top: 20,
    right: 20,

    zIndex: 9999,
  },
  modalContent: {
    backgroundColor: "white",
    padding: 22,
    borderRadius: 4,
    alignItems: "center",
  },
  modalText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: "#008080",
  },
  error: {
    alignItems: "center",
    justifyContent: "center",
    color: "red",
    fontWeight: "900",
  },
});
