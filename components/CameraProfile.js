import { Camera, CameraType, onCameraReady, CameraPictureOptions } from 'expo-camera';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from "@expo/vector-icons";
export default function CameraProfile({onPhotoTaken}) {
    const [type, setType] = useState(CameraType.back);
    const [permission, requestPermission] = Camera.useCameraPermissions();
    const [camera, setCamera] = useState(null);
 

    
    function toggleCameraType(){
        setType(current => (current === CameraType.back ? CameraType.front : CameraType.back));
        console.log("Camera: ", type)
    }

    async function takePhoto(){
        if(camera){
            const options = {quality: 0.5, base64: true};
            const data = await camera.takePictureAsync(options)
            sendToServer(data)
            
            
        }
    }

    async function sendToServer(data){
      console.log("jhefdoasf")
        const token = await AsyncStorage.getItem("whatsthat_user_token");
        const id = await AsyncStorage.getItem("whatsthat_user_id");
        let res = await fetch(data.base64);
        let blob = await res.blob();
        
    
        return fetch("http://localhost:3333/api/1.0.0/user/" + id + "/photo", {
          method: "POST",
          headers: {
            "X-Authorization": token,
            "Content-Type": "image/png",
          },
          body: blob,
        })
          .then((response) => {
            if (response.status === 200) {
              return response.blob();
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
            console.log("Picture",responseJson);
            onPhotoTaken();
            // handle response data
          })
          .catch((error) => {
            console.log(error);
          });
    }
    return (
      <View style={styles.container}>
        <View style={styles.cameraContainer}>
          <Camera style={styles.camera} type={type} ref={ref => setCamera(ref)}>
          </Camera>
        </View>
        <View style={styles.buttonBar}>
        <TouchableOpacity style={styles.button} onPress={takePhoto}>
            <Ionicons name="camera-outline" size={35} color="#4B0082" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={toggleCameraType}>
            <Ionicons name="camera-reverse-outline" size={35} color="#4B0082" />
          </TouchableOpacity>
          
        </View>
      </View>
    );
}
    
    const styles = StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: 'black',
      },
      cameraContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderTopWidth: 40, 
        borderTopColor: '#4B0082',
      },
      
      camera: {
        width: '100%',
        height: '100%',
      },
      buttonBar: {
        
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#4B0082',
        height: 100,
      },
      button: {
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 20,
        backgroundColor: '#fff',
        borderRadius: 50,
      },
    });
    