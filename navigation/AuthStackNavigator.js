import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Login from "../components/Login";
import SignUp from "../components/SignUp";
import MainAppNav from "../components/UserInfo";
import TabNavigation from "./TabNavigation";
import DrawerNavigator from "./DrawerNavigator";


const AuthStack = createStackNavigator();

const AuthStackNavigator = () => {
  return (
    <AuthStack.Navigator>
      <AuthStack.Screen name="DrawerNav" component={DrawerNavigator} options={{ headerShown: false }}/>
      <AuthStack.Screen
        name="Login"
        component={Login}
        options={{ headerShown: false }}
      />
      <AuthStack.Screen
        name="SignUp"
        component={SignUp}
        options={{ headerShown: false }} // hide the header
      />
    </AuthStack.Navigator>
  );
};



export { AuthStackNavigator };
