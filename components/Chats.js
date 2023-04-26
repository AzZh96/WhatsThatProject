import React, { Component } from "react";
import {
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
export default class Chats extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      error: null,
      chats: [],
      newChatModalVisible: false,
      newChatName: ''
     

    };
  }

  async componentDidMount() {
    this.unsubscribe = this.props.navigation.addListener("focus", () => {
      this.checkedLoggedIn();
      this.refreshChats();
    });
    await this.checkedLoggedIn();
    this.setState({
      isLoading: false,
    });
    this.refreshChats();
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

  async refreshChats() {
    const token = await AsyncStorage.getItem("whatsthat_user_token");
    return fetch("http://10.0.2.2:3333/api/1.0.0/chat", {
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
       
        this.setState({
          isLoading: false,
          chats: responseJson,         
        });
      })
      .catch((error) => {
        this.setState({ error: error.message });
      });
  }
  async newChat() {
    const token = await AsyncStorage.getItem("whatsthat_user_token");
    const { newChatName } = this.state;

    return fetch("http://10.0.2.2:3333/api/1.0.0/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Authorization": token,
      },
      body: JSON.stringify({ name: newChatName }),
    })
      .then((response) => {
        if (response.status === 201) {
          return response.json();
        } else if (response.status === 400) {
          throw "Bad Request";
        } else if (response.status === 401) {
          throw "Unauthorised";
        } else {
          throw "Something went wrong";
        }
      })
      .then((responseJson) => {
        this.setState({
          newChatModalVisible: false,
          newChatName: "",
        });
        this.refreshChats();
       
      })
      .catch((error) => {
        this.setState({ error: error.message });
      });
    }



  
  getFirstLetter(str) {
    return str?.charAt(0);
  }

  render() {
    const {
      newChatModalVisible,
      newChatName,
      isLoading,
      error,
      chats
      
    } = this.state;
    const displayTimestamp = (timestamp) => {
      if (!timestamp) {
        return "";
      }
    
      const currentDate = new Date();
      const messageDate = new Date(timestamp * 1000);
      if (currentDate.toDateString() === messageDate.toDateString()) {
        return messageDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      } else {
        return messageDate.toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" });
      }
    };
    
    return (
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
       <View style={styles.container}>
          {isLoading ? (
            <View>
              <ActivityIndicator size="large" color="ff00ff00" />
            </View>
          ) : (
            chats.map((chat) => {
              return (
                <TouchableOpacity
                  key={chat.chat_id}
                  style={styles.chat}
                  onPress={() => {               
                    console.log(chat);
                    this.props.navigation.navigate('ChatScreen', { chatInfo: chat });
                  }}
                >
                  <View style={styles.details}>
                    <Text style={styles.name}>
                      {chat.name}
                    </Text>
                    <View>
                    <Text style={styles.lastMessage}>{chat.last_message.message}</Text>
                    <Text>{displayTimestamp(chat.last_message.timestamp)}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
          
        </View>
        
        <View style={styles.chatButtonContainer}>
  <TouchableOpacity
    style={styles.chatButton}
    onPress={() => this.setState({ newChatModalVisible: true })}
  >
    <Ionicons name="add" size={30} color="#FFFFFF" />
  </TouchableOpacity>
</View>
<Modal style={styles.modalOverlay} 
          animationType="slide"
          transparent={true}
          visible={newChatModalVisible}
          onRequestClose={() => this.setState({ newChatModalVisible: false })}
        >
          

          <View style={styles.modalContainer}>
            <View style={styles.popupChat}>
              <Text style={styles.title}>Create New Chat</Text>

              <TextInput
                style={styles.textInput}
                placeholder="Chat Name"
                onChangeText={(text) => this.setState({ newChatName: text })}
              />

              <TouchableOpacity
                style={styles.createGroupButton}
                onPress={() => {
                  // Handle create group button press here
                  this.newChat();
                  
                }}
              >
                <Text style={styles.createGroupButtonText}>Create Chat</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.createGroupButton}
                onPress={() => {
                  // Handle create group button press here
                  this.setState({ newChatModalVisible: false});
                  
                }}
              >
                <Text style={styles.createGroupButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
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
    width: "100%",
    
    
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',

  },
  popupChat: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  textInput: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    width: '100%',
  },
  createGroupButton: {
    backgroundColor: '#4B0082',
    borderRadius: 5,
    padding: 10,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10
  },
  createGroupButtonText: {
    color: 'white',
    fontWeight: 'bold',
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
  chatButtonContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  chatButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4B0082',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E9E2F7',
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
  chat: {
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
  lastMessage: {
    fontSize: 14,
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
