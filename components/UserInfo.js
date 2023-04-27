import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { Component, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal
} from "react-native";
import { Button, Header } from "react-native-elements";
import * as EmailValidator from "email-validator";
import DocumentPicker from "react-native-document-picker";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import placeholderImage from "../assets/placeholder.png";
import Icon from "react-native-vector-icons/FontAwesome";
import { Ionicons } from "@expo/vector-icons";
import CameraProfile from "./CameraProfile";

export default class UserInfo extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      first_name: "",
      editingField: "",
      last_name: "",
      email: "",
      password: "",
      isEditingPassword: false,
      passSubmitted: false,
      newPassword: "",
      confirmPassword: "",
      photo: "",
      error: "",
      confirmed: "",
      showCamera: false,
    };
  }

  async componentDidMount() {
    this.unsubscribe = this.props.navigation.addListener("focus", () => {
      this.checkedLoggedIn();
      this.getUserData();
      this.getUserPhoto();
    });
    await this.checkedLoggedIn();
    this.setState({
      isLoading: false,
    });
    this.getUserData();
    this.getUserPhoto();
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

  getUserData = async () => {
    const token = await AsyncStorage.getItem("whatsthat_user_token");
    const id = await AsyncStorage.getItem("whatsthat_user_id");
    this.state.password = await AsyncStorage.getItem("whatsthat_user_password");
    return fetch("http://localhost:3333/api/1.0.0/user/" + id, {
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
        } else if (response.status === 404) {
          throw "Not Found";
        } else {
          throw "Something went wrong";
        }
      })
      .then((responseJson) => {
        console.log(responseJson);
        this.setState({
          isLoading: false,
          first_name: responseJson.first_name,
          last_name: responseJson.last_name,
          email: responseJson.email,
          confirmed: "",
        });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  editUserData = async () => {
    const token = await AsyncStorage.getItem("whatsthat_user_token");
    const id = await AsyncStorage.getItem("whatsthat_user_id");

    console.log(this.state.password);
    return fetch("http://localhost:3333/api/1.0.0/user/" + id, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-Authorization": token,
      },
      body: JSON.stringify({
        first_name: this.state.first_name,
        last_name: this.state.last_name,
        email: this.state.email,
        password: this.state.newPassword,
      }),
    })
      .then((response) => {
        if (response.status === 200) {
          return "OK";
        } else if (response.status === 400) {
          throw "Bad Request";
        } else if (response.status === 401) {
          throw ("Unauthorised", this.props.navigation.navigate("Login"));
        } else if (response.status === 403) {
          throw ("Forbidden", this.props.navigation.navigate("Login"));
        } else if (response.status === 404) {
          throw "Not Found";
        } else {
          throw "Something went wrong";
        }
      })
      .then((responseJson) => {
        console.log(responseJson);
        this.setState({
          isLoading: false,
        });
      })
      .catch((error) => {
        console.log(error.toString());
      });
  };

  getUserPhoto = async () => {
    const token = await AsyncStorage.getItem("whatsthat_user_token");
    const id = await AsyncStorage.getItem("whatsthat_user_id");

    return fetch("http://localhost:3333/api/1.0.0/user/" + id + "/photo", {
      method: "GET",
      headers: {
        "X-Authorization": token,
      },
    })
      .then((response) => {
        if (response.status === 200) {
          return response.blob();
        } else if (response.status === 401) {
          throw ("Unauthorised", this.props.navigation.navigate("Login"));
        } else if (response.status === 404) {
          throw "Not Found";
        } else {
          throw "Something went wrong";
        }
      })
      .then((resBlob) => {
        console.log(resBlob);
        let data = URL.createObjectURL(resBlob)
        this.setState({
          photo: data,
          isLoading: false,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  addUserPhoto = async (photo) => {
    const token = await AsyncStorage.getItem("whatsthat_user_token");
    const id = await AsyncStorage.getItem("whatsthat_user_id");
  
    const formData = new FormData();
    formData.append("photo", {
      uri: photo.uri,
      type: "image/jpeg",
      name: "photo.jpg",
    });
  
    return fetch("http://localhost:3333/api/1.0.0/user/photo", {
      method: "POST",
      headers: {
        "Content-Type": "multipart/form-data",
        "X-Authorization": token,
      },
      body: formData,
    })
      .then((response) => {
        if (response.status === 201) {
          this.getUserPhoto();
        
          return "OK";
        } else if (response.status === 400) {
          throw "Bad Request";
        } else if (response.status === 401) {
          throw ("Unauthorised", this.props.navigation.navigate("Login"));
        } else if (response.status === 403) {
          throw ("Forbidden", this.props.navigation.navigate("Login"));
        } else if (response.status === 404) {
          throw "Not Found";
        } else {
          throw "Something went wrong";
        }
      })
      .then((responseJson) => {
        console.log(responseJson);
        this.setState({
          isLoading: false,
        });
      })
      .catch((error) => {
        console.log(error.toString());
      });
  };
  

  handleFieldChange = (value) => {
    this.setState({ isEditingPassword: false });
    const { editingField } = this.state;

    if (editingField === "newPassword") {
      this.setState({ newPassword: value });
    } else if (editingField === "confirmPassword") {
      this.setState({ confirmPassword: value });
    } else {
      console.log(value);
      this.setState({ [editingField]: value });
    }
  };

  handleSaveChanges = () => {
    this.editUserData();
    this.setState({ editingField: null });
  };

  validatePassword = () => {
    const PASSWORD_REGEX = new RegExp(
      "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$"
    );
    this.setState({
      passSubmitted: true,
      confirmed: "",
    });

    if (!PASSWORD_REGEX.test(this.state.newPassword)) {
      this.setState({
        passSubmitted: false,
        error:
          "Password isn't strong enough (One upper, one lower, one special, one number, at least 8 characters long)",
      });
      return;
    } else if (this.state.newPassword !== this.state.confirmPassword) {
      this.setState({
        passSubmitted: false,

        error: "Passwords do not match",
      });
      return;
    } else {
      this.setState({
        error: "",
        confirmed: "Password Changed Successfully",
        password: this.state.newPassword,
        newPassword: "",
        confirmPassword: "",
        isEditingPassword: false,
        passSubmitted: false,
      });

      this.handleSaveChanges();
    }
  };

  onPhotoTaken = () => {
    this.setState({showCamera: false});
    this.getUserPhoto();
  };


  render() {
    if (this.state.isLoading) {
      return (
        <View>
          <ActivityIndicator size="large" color="ff00ff00" />
        </View>
      );
    } else {
      return (
        <View>
          <View style={styles.header}>
            <Text style={styles.headerText}>Profile</Text>
          </View>
          <ScrollView>
            <View style={styles.container}>
              <View style={styles.infoContainer}>
                <View style={styles.avatarContainer}>
                  <View style={styles.avatarImage}>
                    {this.state.photo ? (
                      <Image style={styles.avatar} source={this.state.photo} />
                    ) : (
                      <Image style={styles.avatar} source={placeholderImage} />
                    )}
                    
                  </View>
                  <TouchableOpacity
                      style={styles.editButtonAvatar}
                      onPress={()=> this.setState({showCamera: true})}
                    >
                      <Icon name="pencil" size={16} color="#333" />
                    </TouchableOpacity>
                  {this.state.showCamera && <CameraProfile onPhotoTaken={()=> this.onPhotoTaken()} />}
                </View>
                <View style={styles.userInfo}>
                  <View style={styles.nameEmailContainer}>
                    <View style={styles.nameEmail}>
                      <Text style={styles.nameEmailHolder}>First Name: </Text>
                      {this.state.editingField === "first_name" ? (
                        <TextInput
                          style={styles.nameEmailText}
                          value={this.state.first_name}
                          onChangeText={this.handleFieldChange}
                        />
                      ) : (
                        <Text style={styles.nameEmailText}>
                          {this.state.first_name}
                        </Text>
                      )}
                      {this.state.first_name === "" &&
                        this.state.editingField === "first_name" && (
                          <Text style={styles.error}>*Cannot be empty</Text>
                        )}
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "flex-end",
                      }}
                    >
                      {this.state.editingField === "first_name" && (
                        <TouchableOpacity
                          style={styles.buttonNameEmail}
                          onPress={this.handleSaveChanges}
                          disabled={!this.state.first_name}
                        >
                          <Icon name="save" size={16} color="#333" />
                        </TouchableOpacity>
                      )}

                      <TouchableOpacity
                        style={styles.buttonNameEmail}
                        onPress={() =>
                          this.setState({ 
                            editingField: "first_name",
                            error: "",
                            newPassword: "",
                            confirmPassword: "",
                            isEditingPassword: false,
                            passSubmitted: false, })
                        }
                      >
                        <Icon name="pencil" size={16} color="#333" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.nameEmailContainer}>
                    <View style={styles.nameEmail}>
                      <Text style={styles.nameEmailHolder}>Last Name: </Text>
                      {this.state.editingField === "last_name" ? (
                        <TextInput
                          style={styles.nameEmailText}
                          value={this.state.last_name}
                          onChangeText={this.handleFieldChange}
                        />
                      ) : (
                        <Text style={styles.nameEmailText}>
                          {this.state.last_name}
                        </Text>
                      )}
                      {this.state.last_name === "" &&
                        this.state.editingField === "last_name" && (
                          <Text style={styles.error}>*Cannot be empty</Text>
                        )}
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "flex-end",
                      }}
                    >
                      {this.state.editingField === "last_name" && (
                        <TouchableOpacity
                          style={styles.buttonNameEmail}
                          onPress={this.handleSaveChanges}
                          disabled={!this.state.last_name}
                        >
                          <Icon name="save" size={16} color="#333" />
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        style={styles.buttonNameEmail}
                        onPress={() =>
                          this.setState({ 
                            editingField: "last_name",
                            error: "",
                            newPassword: "",
                            confirmPassword: "",
                            isEditingPassword: false,
                            passSubmitted: false, })
                        }
                      >
                        <Icon name="pencil" size={16} color="#333" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.nameEmailContainer}>
                    <View style={styles.nameEmail}>
                      <Text style={styles.nameEmailHolder}>Email: </Text>
                      {this.state.editingField === "email" ? (
                        <TextInput
                          style={styles.nameEmailText}
                          value={this.state.email}
                          onChangeText={this.handleFieldChange}
                        />
                      ) : (
                        <Text style={styles.nameEmailText}>
                          {this.state.email}
                        </Text>
                      )}
                      {(this.state.email === "" ||
                        !EmailValidator.validate(this.state.email)) &&
                        this.state.editingField === "email" && (
                          <Text style={styles.error}>
                            {this.state.email === ""
                              ? "*Cannot be empty"
                              : "*Must enter valid email"}
                          </Text>
                        )}
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "flex-end",
                      }}
                    >
                      {this.state.editingField === "email" && (
                        <TouchableOpacity
                          style={[
                            styles.buttonNameEmail,
                            {
                              opacity:
                                this.state.email &&
                                EmailValidator.validate(this.state.email)
                                  ? 1
                                  : 0.5,
                            },
                          ]}
                          onPress={this.handleSaveChanges}
                          disabled={
                            !this.state.email ||
                            !EmailValidator.validate(this.state.email)
                          }
                        >
                          <Icon name="save" size={16} color="#333" />
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        style={styles.buttonNameEmail}
                        onPress={() =>
                          this.setState({
                            editingField: "email",
                            error: "",
                            newPassword: "",
                            confirmPassword: "",
                            isEditingPassword: false,
                            passSubmitted: false,
                          })
                        }
                      >
                        <Icon name="pencil" size={16} color="#333" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.nameEmailContainer}>
                    <View style={styles.nameEmail}>
                      <Text style={styles.nameEmailHolder}>Password: </Text>
                      {this.state.isEditingPassword ? (
                        <View>
                          <View style={styles.nameEmailContainer}>
                            <View style={styles.nameEmail}>
                              <Text style={styles.nameEmailText}>
                                {this.state.password.replace(/./g, "*")}
                              </Text>
                              <Text style={styles.nameEmailHolder}>
                                New Password:
                              </Text>
                              <TextInput
                                style={styles.nameEmailText}
                                placeholder="enter new password"
                                placeholderTextColor={"#ccc"}
                                onChangeText={(newPassword) =>
                                  this.setState({ newPassword })
                                }
                                value={this.state.newPassword}
                                secureTextEntry={true}
                              />
                            </View>
                          </View>
                          <View
                            style={{
                              marginTop: 20,
                            }}
                          >
                            <View style={styles.nameEmailContainer}>
                              <View style={styles.nameEmail}>
                                <Text style={styles.nameEmailHolder}>
                                  Confirm Password:
                                </Text>

                                <View
                                  style={{
                                    flexDirection: "row",
                                  }}
                                >
                                  <TextInput
                                    style={styles.nameEmailText}
                                    placeholder="confirm password"
                                    placeholderTextColor={"#ccc"}
                                    onChangeText={(confirmPassword) =>
                                      this.setState({ confirmPassword })
                                    }
                                    value={this.state.confirmPassword}
                                    secureTextEntry={true}
                                  />
                                  {this.state.editingField === "password" && (
                                    <View
                                      style={{
                                        flexDirection: "row",
                                        justifyContent: "flex-end",
                                      }}
                                    >
                                      <TouchableOpacity
                                        style={[
                                          styles.buttonNameEmail,
                                          { marginLeft: 5 },
                                        ]}
                                        onPress={() => this.validatePassword()}
                                        disabled={
                                          !this.state.newPassword ||
                                          !this.state.confirmPassword
                                        }
                                      >
                                        <Icon
                                          name="save"
                                          size={16}
                                          color="#333"
                                        />
                                      </TouchableOpacity>
                                      <TouchableOpacity
                                        style={[styles.buttonNameEmail]}
                                        onPress={() =>
                                          this.setState({
                                            error: "",
                                            newPassword: "",
                                            confirmPassword: "",
                                            isEditingPassword: false,
                                            passSubmitted: false,
                                          })
                                        }
                                      >
                                        <Icon
                                          name="close"
                                          size={16}
                                          color="#333"
                                        />
                                      </TouchableOpacity>
                                    </View>
                                  )}
                                </View>
                              </View>
                            </View>
                          </View>
                        </View>
                      ) : (
                        <Text style={styles.nameEmailText}>
                          {this.state.password.replace(/./g, "*")}
                        </Text>
                      )}
                      <>
                        {this.state.error && (
                          <Text style={styles.error}>{this.state.error}</Text>
                        )}
                      </>
                      <>
                        {this.state.confirmed && (
                          <Text style={styles.confirmed}>
                            {this.state.confirmed}
                          </Text>
                        )}
                      </>
                    </View>
                    <TouchableOpacity
                      style={styles.buttonNameEmail}
                      onPress={() =>
                        this.setState({
                          editingField: "password",
                          isEditingPassword: true,
                        })
                      }
                    >
                      <Icon name="pencil" size={16} color="#333" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
          <Modal
          
          visible={this.state.showCamera}
          onRequestClose={() => this.setState({ showCamera: false })}
        >
          <CameraProfile onPhotoTaken={() => this.onPhotoTaken()} />
        </Modal>
        </View>
      );
    }
  }
}
const styles = StyleSheet.create({
  container: {
    
    flexGrow: 1,
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-start",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#4B0082",
    paddingBottom: 14.5,
    paddingLeft: 14.5,
    paddingRight: 14.5
  },
  headerText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },

  nameEmailContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    alignItems: "center",
  },
  saveButtonText: {
    paddingLeft: 10,
  },

  infoContainer: {
    width: "100%",
    alignItems: "center",

    
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    backgroundColor: "#fff",
  },
  avatarContainer: {
    margin: 30
  },
  avatarImage: {
    width: 128,
    height: 128,
    borderRadius: 64,
    overflow: "hidden",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  editButtonAvatar: {
    zIndex: 999,
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "#fff",
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 4,
  },

  userInfo: {
    marginTop: 30,
    width: "60%",
    height: 600,
  },
  nameEmail: {
    flex: 1,
    paddingRight: 10,
    width: "100%",
    height: 40,
  },
  nameEmailHolder: {
    color: "#557",
    fontSize: 16,
    fontWeight: "bold",
  },
  nameEmailText: {
    height: 30,
    fontSize: 18,
  },
  buttonNameEmail: {
    zIndex: 999,
    backgroundColor: "#fff",
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 4,

    marginRight: 5,
  },

  error: {
    alignItems: "center",
    justifyContent: "center",
    color: "red",
    fontWeight: "900",
  },
  confirmed: {
    alignItems: "center",
    justifyContent: "center",
    color: "green",
    fontWeight: "900",
  },
});
