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

export default class SearchChatsResults extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: [],
      isLoading: true,
      chatsActionsVisible: false,
      selectedChat: null,
      error: "",
      loggedInUserId: "",
      filteredData: [],
    };
  }

  async componentDidMount() {
    const { q, limit, offset } = this.props;
    const token = await AsyncStorage.getItem("whatsthat_user_token");
    console.log(token)
    this.state.loggedInUserId = await AsyncStorage.getItem("whatsthat_user_id");
    let chatSearchURL = `http://localhost:3333/api/1.0.0/chat/${q}?limit=${limit}&offset=${offset}`
    return fetch(chatSearchURL, {
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
        } else if (response.status === 403) {
          throw ("Forbidden", this.props.navigation.navigate("Login"));
        } else if (response.status === 404) {
            throw ("Not Found");
        }else {
          throw "Something went wrong";
        }
      })
      .then((responseJson) => {
       console.log(responseJson)
        this.setState({
          isLoading: false,
            data: responseJson
        });
      })
      .catch((error) => {
        this.setState({ error: error });
      });
    
  }

 
  handleCancel = () => {
    this.setState({
      chatsActionsVisible: false,
      selectedChat: null,
      error: "",
    });
  };

  render() {
    const {
      data,
      isLoading,
      error,
      chatsActionsVisible,
      selectedChat,
    } = this.state;
    
    console.log("data", data)
    return (
      <View style={styles.container}>
        {isLoading ? (
          <Text>Loading...</Text>
        ) : (
          <FlatList
            data={data}
            keyExtractor={(item) => item.name.toString()}
            renderItem={({ item }) => (          
              <TouchableOpacity
                onPress={() => {                 
                    this.setState({
                      chatsActionsVisible: true,
                      selectedChat: item,
                    });
                 
                }}
                
              >
                <Text style={styles.itemText}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
          />
        )}

        
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
