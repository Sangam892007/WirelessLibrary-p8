import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform} from 'react-native';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { TextInput } from 'react-native-gesture-handler';
import db from "../Config";
import firebase from 'firebase';

export default class LogInScreen extends React.Component{
    constructor(){
        super()
        this.state = {
            emailID:"",
            password:"",
        }
    }
    logIn = async()=>{
        if (this.state.emailID && this.state.password){
            try{
            const entry = await firebase.auth().signInWithEmailAndPassword(this.state.emailID,this.state.password)
            if (entry ){
                this.props.navigation.navigate('Transaction')

            }
            }
        catch(error){
            console.log(error)

        }
    }
}
    render(){
        return(
            <View style = {{alignItems:"center",marginTop:30}}>
                <TextInput style = {{width:300,height:40,borderWidth:2,margin:10,fontSize:20,padding:10}} placeholder = {"Enter your email ID"} onChangeText = {Text=>{
              this.setState({
                emailID:Text,
              })
            }}>
            </TextInput>
            <TextInput style = {{width:300,height:40,borderWidth:2,margin:10,fontSize:20,padding:10}} secureTextEntry = {true} placeholder = {"Enter your password"} onChangeText = {Text=>{
              this.setState({
                password:Text,
              })
            }}>
            </TextInput>
            <TouchableOpacity style={{height:30,width:90,borderWidth:1,marginTop:20,paddingTop:5,borderRadius:7}} onPress = {()=>{
                this.logIn()
            }}>
                <Text>
                    Log IN
                </Text>

            </TouchableOpacity>
            </View>

        )
    }

}