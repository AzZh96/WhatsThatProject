import React, { Component } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  ActivityIndicator
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default class BlockedContacts extends Component {
  constructor(props) {
    super(props);
    console.log("BlockedContacts constructor called");
    this.state = {
      isLoading : true,
      blockedUsers: [],
      
      selectedContact: null,
      unblockActionVisible: false,
      error: ""
    };
  }
  async componentDidMount() {
    this.unsubscribe = this.props.navigation.addListener("focus", () => {
      
      this.checkedLoggedIn();
      this.refreshBlockedList() ;
    });
    await this.checkedLoggedIn();
    this.setState({
      isLoading: false,
    });
    const token = await AsyncStorage.getItem("whatsthat_user_token");
  
 

  let blockedUrl = "http://localhost:3333/api/1.0.0/blocked";
  fetch(blockedUrl, {
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
      blockedUsers: responseJson,
      unblockActionVisible: false,
      error: "",
      selectedContact: null,
    });
  })
  .catch((error) => {
    console.log(error);
    this.setState({ isLoading: false, error: error });
  });
    
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

  async refreshBlockedList() {
    const token = await AsyncStorage.getItem("whatsthat_user_token");
    
    
    let blockedUrl = "http://localhost:3333/api/1.0.0/blocked";
    return fetch(blockedUrl, {
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
          blockedUsers: responseJson,
          unblockActionVisible: false,
          error: "",
          selectedContact: null,
        });
      });
  }

  handleUnblockContact = async (contact) => {
    const token = await AsyncStorage.getItem("whatsthat_user_token");
    const { blockedUsers } = this.state;

    // Make the API call to remove the contact
    fetch(`http://localhost:3333/api/1.0.0/user/${contact.user_id}/block`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "X-Authorization": token,
      },
    })
      .then((response) => {
        if (response.status === 200) {
          console.log("Contact Unblocked");

          // Update the blockedUsers state and save to AsyncStorage
          const updatedBlockedUsers = blockedUsers.filter(
            (userId) => userId !== contact.user_id
          );
          AsyncStorage.setItem(
            "whatsthat_blocked_users",
            JSON.stringify(updatedBlockedUsers)
          );
          this.setState({ blockedUsers: updatedBlockedUsers, unblockActionVisible: false,
            selectedContact: null, });
            this.refreshBlockedList();
          } else if (response.status === 400) {
            throw ("You cant block yourself")
          } else if (response.status === 401) {
            throw ("Unauthorised", this.props.navigation.navigate("Login"));
          }  else if (response.status === 404) {
            throw ("Not Found");
          }else {
            throw "Something went wrong";
          }
      })
      .catch((error) => {
        console.log(error);
        this.setState({ isLoading: false, error: error });
      });
  };
  getFirstLetter(str) {
    return str?.charAt(0);
  }
  handleCancel = () => {
    this.setState({
        unblockActionVisible: false,
      selectedContact: null,
      error: "",
    });
  };


  render() {
    const {
        isLoading,
      blockedUsers,
      
      selectedContact,
      unblockActionVisible,
      error,
      } = this.state;
      return(
      <View style={styles.container}>
       {isLoading ? (
        <View>
              <ActivityIndicator size="large" color="ff00ff00" />
            </View>
        ) : (
            blockedUsers.map((contact) => {
              return (
                <TouchableOpacity
                  key={contact.user_id}
                  style={styles.contact}
                  onPress={() => {
                    this.setState({
                        unblockActionVisible: true,
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
            visible={unblockActionVisible}
            animationType="fade"
            transparent
          >
            <View style={styles.containerPopup}>
              <View style={styles.popupContact}>
                <TouchableOpacity
                  onPress={() => this.handleUnblockContact(selectedContact)}
                  style={styles.button}
                >
                  <Text style={styles.buttonText}>Unblock Contact</Text>
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
                this.setState({ unblockActionVisible: false });
              }}
            />
          </Modal>


      </View>
      )
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
      button: {
        backgroundColor: "#4B0082",
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
      initials: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#4B0082",
      },
      name: {
        fontSize: 16,
        fontWeight: "bold",
      },
      email: {
        fontSize: 14,
      },
    itemText: {
        fontSize: 16,
        marginBottom: 10,
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
