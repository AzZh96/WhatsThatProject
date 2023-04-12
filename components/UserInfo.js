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
} from "react-native";
import { Button, Header } from "react-native-elements";
import * as EmailValidator from "email-validator";
import DocumentPicker from "react-native-document-picker";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import placeholderImage from "../assets/placeholder.png";
import Icon from "react-native-vector-icons/FontAwesome";

const Tab = createBottomTabNavigator();

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
      image: "",
      error: "",
    };
  }

  async componentDidMount() {
    this.unsubscribe = this.props.navigation.addListener("focus", () => {
      this.checkedLoggedIn();
      this.getUserData();
   
    });
    await this.checkedLoggedIn();
    this.setState({
      isLoading: false,
    });
    this.getUserData();
    
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
    return fetch("http://10.0.2.2:3333/api/1.0.0/user/" + id, {
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
    return fetch("http://10.0.2.2:3333/api/1.0.0/user/" + id, {
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

    return fetch("http://10.0.2.2:3333/api/1.0.0/user/" + id + "/photo", {
      method: "GET",
      headers: {
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
          image: responseJson,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  addUserPhoto = async () => {
    const token = await AsyncStorage.getItem("whatsthat_user_token");
    const id = await AsyncStorage.getItem("whatsthat_user_id");
    const formData = new FormData();
    formData.append("photo", {
      uri: "file://path/to/photo", // replace with the actual file path
      name: "photo.jpg", // replace with the actual file name
      type: "image/jpeg", // replace with the actual file type
    });

    return fetch("http://10.0.2.2:3333/api/1.0.0/user/" + id + "/photo", {
      method: "POST",
      headers: {
        "X-Authorization": token,
        "Content-Type": "multipart/form-data",
      },
      body: formData,
    })
      .then((response) => {
        if (response.status === 200) {
          return response.json();
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
        // handle response data
      })
      .catch((error) => {
        console.log(error);
      });
  };

  handleFieldChange = (value) => {
    const { editingField } = this.state;
    if (editingField === "newPassword") {
      this.setState({ newPassword: value });
    } else if (editingField === "confirmPassword") {
      this.setState({ confirmPassword: value });
    } else {
      this.setState({ [editingField]: value });
    }
  };

  handleSaveChanges = () => {
    this.editUserData();
    this.setState({ editingField: null });
  };

  handlePhotoUpload = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.images],
      });
      // create FormData object and append selected file to it
      const formData = new FormData();
      formData.append("photo", {
        uri: result.uri,
        name: result.name,
        type: result.type,
      });
      // call the addUserPhoto function with the FormData object
      await this.addUserPhoto(formData);
    } catch (error) {
      console.log("Error selecting file:", error);
    }
  };

  validatePassword = () => {
    const PASSWORD_REGEX = new RegExp(
      "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$"
    );
    if (!PASSWORD_REGEX.test(this.state.newPassword)) {
      this.setState({
        error:
          "Password isn't strong enough (One upper, one lower, one special, one number, at least 8 characters long)",
      });
      return;
    } else if (this.state.newPassword !== this.state.confirmPassword) {
      this.setState({
        error: "Passwords do not match",
      });
      return;
    } else {
      this.setState({
        error: "",
      });
      this.state.password = this.state.newPassword;
      this.state.isEditingPassword = false;
      this.handleSaveChanges();
    }
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
        <ScrollView>
          <View style={styles.container}>
            <View style={styles.infoContainer}>
              <View>
                <View style={styles.avatarContainer}>
                  {this.state.image ? (
                    <Image
                      style={styles.avatar}
                      source={this.state.image.uri}
                    />
                  ) : (
                    <Image style={styles.avatar} source={placeholderImage} />
                  )}
                  <TouchableOpacity
                    style={styles.editButtonAvatar}
                    onPress={this.handlePhotoUpload}
                  >
                    <Icon name="pencil" size={16} color="#333" />
                  </TouchableOpacity>
                </View>
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
                  <View style={{
                              flexDirection: "row",
                              justifyContent: "flex-end",
                            }}>
                  {this.state.editingField === "first_name" && (
                    <TouchableOpacity
                      style={{
                        opacity: this.state.first_name ? 1 : 0.5,
                      }}
                      onPress={this.handleSaveChanges}
                      disabled={!this.state.first_name}
                    >
                      <Text style={styles.saveButtonText}>Save</Text>
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity
                    style={styles.editButtonNameEmail}
                    onPress={() =>
                      this.setState({ editingField: "first_name" })
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
                  <View style={{
                              flexDirection: "row",
                              justifyContent: "flex-end",
                            }}>
                  {this.state.editingField === "last_name" && (
                    
                    <TouchableOpacity
                      style={{
                        opacity: this.state.last_name ? 1 : 0.5,
                      }}
                      onPress={this.handleSaveChanges}
                      disabled={!this.state.last_name}
                    >
                      <Text style={styles.saveButtonText}>Save</Text>
                    </TouchableOpacity>
                    
                  )}
                  <TouchableOpacity
                    style={styles.editButtonNameEmail}
                    onPress={() => this.setState({ editingField: "last_name" })}
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
                  <View style={{
                              flexDirection: "row",
                              justifyContent: "flex-end",
                            }}>
                  {this.state.editingField === "email" && (
                    
                    <TouchableOpacity
                      style={[
                        styles.saveButtonNameEmail,
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
                      <Text style={styles.saveButtonText}>Save</Text>
                    </TouchableOpacity>
                    
                  )}
                  <TouchableOpacity
                    style={styles.editButtonNameEmail}
                    onPress={() => this.setState({ editingField: "email" })}
                  >
                    <Icon name="pencil" size={16} color="#333" />
                  </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.nameEmailContainer}>
                  <View style={styles.nameEmail}>
                    <Text style={styles.nameEmailHolder}>Password: </Text>
                    {this.state.isEditingPassword ? (
                      <>
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
                        <>
                          {this.state.passSubmitted &&
                            !this.state.newPassword && (
                              <Text style={styles.error}>
                                *Password is required
                              </Text>
                            )}
                        </>

                        <Text style={styles.nameEmailHolder}>
                          Confirm Password:
                        </Text>
                        <TextInput
                          style={styles.nameEmailText}
                          placeholder="confirm new password"
                          placeholderTextColor={"#ccc"}
                          onChangeText={(confirmPassword) =>
                            this.setState({ confirmPassword })
                          }
                          value={this.state.confirmPassword}
                          secureTextEntry={true}
                        />
                        <>
                          {this.state.passSubmitted &&
                            !this.state.confirmPassword && (
                              <Text style={styles.error}>
                                *Confirm Password is required
                              </Text>
                            )}
                          {this.state.passSubmitted &&
                            this.state.confirmPassword &&
                            this.state.confirmPassword !==
                              this.state.newPassword && (
                              <Text style={styles.error}>
                                *Passwords don't match
                              </Text>
                            )}
                        </>
                        {this.state.editingField === "password" && (
                          <View
                            style={{
                              flexDirection: "row",
                              justifyContent: "flex-end",
                            }}
                          >
                            <TouchableOpacity
                              style={{
                                opacity:
                                  this.state.newPassword ||
                                  this.state.confirmPassword
                                    ? 1
                                    : 0.5,
                              }}
                              onPress={() => this.validatePassword()}
                              disabled={
                                !this.state.newPassword ||
                                !this.state.confirmPassword
                              }
                            >
                              <Text style={styles.saveButtonText}>Save</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() =>
                                this.setState({ isEditingPassword: false })
                              }
                            >
                              <Text style={styles.saveButtonText}>Close</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </>
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
                  </View>
                  <TouchableOpacity
                    style={styles.editButtonNameEmail}
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
              <View style={styles.error}></View>
            </View>

            
          </View>
        </ScrollView>
      );
    }
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-start",
  },

  nameEmailContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    alignItems: "center",

  },
  saveButtonText: {
    alignItemsL: "right",
    paddingLeft: 10,
  },

  infoContainer: {
    height: "100%",
    width: "90%",
    alignItems: "center",
    padding: 16,
    marginTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    backgroundColor: "#fff",
  },
  avatarContainer: {
    width: 128,
    height: 128,
    borderRadius: 32,
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  editButtonAvatar: {
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
    marginTop: -100,
    justifyContent: "center",
    height: 600,
  },
  nameEmail: {
    paddingRight: 30,
    height: 50,
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
  editButtonNameEmail: {
    backgroundColor: "#fff",
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 4,
    marginLeft: "auto",
  },

  error: {
    alignItems: "center",
    justifyContent: "center",
    color: "red",
    fontWeight: "900",
  },
});
