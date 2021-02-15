import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform} from 'react-native';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { TextInput } from 'react-native-gesture-handler';
import db from "../Config";
import firebase from 'firebase';


export default class TransactionScreen extends React.Component {
    constructor(){
      super();
      this.state = {
        hasCameraPermissions: null,
        scanned: false,
        scannedBookID: '',
        scannedStudentID:'',
        buttonState: 'normal',
        transactionmessage: '' 
      }
    }

    getCameraPermissions = async (data) =>{
      const {status} = await Permissions.askAsync(Permissions.CAMERA);
      
      this.setState({
        hasCameraPermissions: status === "granted",
        buttonState: data,
        scanned: false
      });
    }

    handleBarCodeScanned = async({type, data})=>{
      const buttonState = this.state.buttonState
      if (buttonState === "BOOK ID"){
      this.setState({
        scanned: true,
        scannedBookID: data,
        buttonState: 'normal'
      });
      }
      if (buttonState === "STUDENT ID"){
        this.setState({
          scanned: true,
          scannedStudentID: data,
          buttonState: 'normal'
        });
        }
    }
    checkBookEligibility = async()=>{
      const bookRef = await db.collection("BOOKS").where("BookID","==",this.state.scannedBookID).get()
      var transactionType
      if (bookRef.docs.length == 0){
        transactionType = false;
      }
      else {
        bookRef.docs.map(doc => {
          var book = doc.data();
          if (book.Status === true){
            transactionType = "Issued";
          }
          else {
            transactionType = "Return";
          }
        })
      }
      return transactionType;
    }

    handleTransaction = async()=>{
      var transactionType = await this.checkBookEligibility();
      if (!transactionType){
        alert("The book is not available in the library");
        this.setState({
          scannedBookID:'',
          scannedStudentID:''
        })
      }
      else if (transactionType === "Issued"){
        var isStudentEligible = await this.checkStudentEligibiltyIssue();
        if (isStudentEligible){
          this.bookIssue();
          alert("The book is issued")
          this.setState({
            scannedBookID:'',
            scannedStudentID:''
          })
        }
      }
      else {
        var isStudentEligible = await this.checkStudentEligibiltyReturn();
        if(isStudentEligible){
          this.Return();
        alert("The book is returned");
        this.setState({
          scannedBookID:'',
          scannedStudentID:''
        })
      }
    }
      

    }
    bookIssue = async()=>{
      db.collection("BOOKS").doc(this.state.scannedBookID).update({
        Status: false
      })
      db.collection("STUDENTS").doc(this.state.scannedStudentID).update({
      Books_Taken: firebase.firestore.FieldValue.increment(1)
      })
      db.collection("TRANSACTION").add({
        StudentID:this.state.scannedStudentID,
        BookID: this.state.scannedBookID,
        Date: firebase.firestore.Timestamp.now().toDate(),
        TransactionType: "Issued"
      })
    }
    Return = async()=>{
      db.collection("BOOKS").doc(this.state.scannedBookID).update({
        Status: true
      })
      db.collection("STUDENTS").doc(this.state.scannedStudentID).update({
      Books_Taken: firebase.firestore.FieldValue.increment(-1)
      })
      db.collection("TRANSACTION").add({
        StudentID:this.state.scannedStudentID,
        BookID: this.state.scannedBookID,
        Date: firebase.firestore.Timestamp.now().toDate(),
        TransactionType: "Return"
      })
    }
    checkStudentEligibiltyIssue = async()=>{
      const studentRef = await db.collection("STUDENTS").where("StudentID","==",this.state.scannedStudentID).get()
      var isStudentEligible = "";
      if (studentRef.docs.length === 0){
        this.setState({
          scannedStudentID:"",
          scannedBookID:"",
        })
        isStudentEligible = false;
       alert("The student is not present in the database"); 
      }
      else{
        studentRef.docs.map(doc=>{
          var student = doc.data();
          if(student.Books_Taken < 1){
            isStudentEligible = true;
          }
          else{
            isStudentEligible = false;
            alert("The student has already taken a book");
            this.setState({
              scannedBookID:"",
              scannedStudentID:"",
            })
          }
        })
        return(isStudentEligible)
      }
    }
    checkStudentEligibiltyReturn = async()=>{
      const studentRef = await db.collection("TRANSACTION").where("BookID","==",this.state.scannedBookID).limit(1).get()
      var isStudentEligible = "";
      studentRef.docs.map(doc=>{
        var student = doc.data();
        if(student.StudentID === this.state.scannedStudentID){
          isStudentEligible = true;
        }
        else{
          isStudentEligible = false;
          alert("The student has to return the book");
          this.setState({
            scannedBookID:"",
            scannedStudentID:"",
          })
        }
      })
      return(isStudentEligible);
    }
     
    



    render() {
      const hasCameraPermissions = this.state.hasCameraPermissions;
      const scanned = this.state.scanned;
      const buttonState = this.state.buttonState;

      if (buttonState !== "normal" && hasCameraPermissions){
        return(
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
        );
      }

      else if (buttonState === "normal"){
        return(
          <KeyboardAvoidingView style = {styles.container} behavior = "padding" enabled keyboardVerticalOffset={Platform.select({ios: 0, android: -100})}>
            
          <View style={styles.inputView}>
            <TextInput styles = {styles.inputBox} placeholder = {"BOOK ID"} value = {this.state.scannedBookID} onChangeText = {Text => {
              this.setState({scannedBookID:Text})
            }}>

            </TextInput>
            <TouchableOpacity style = {styles.scanButton} onPress = {()=>{this.getCameraPermissions("BOOK ID")}}>
              <Text styles = {styles.buttonText}>
                SCAN
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.inputView}>
            <TextInput styles = {styles.inputBox} placeholder = {"STUDENT ID"} value = {this.state.scannedStudentID} onChangeText = {Text => {
              this.setState({scannedStudentID:Text})
            }}>

            </TextInput>
            <TouchableOpacity style = {styles.scanButton} onPress = {()=>{this.getCameraPermissions("STUDENT ID")}}>
              <Text styles = {styles.buttonText}>
                SCAN
              </Text>
            </TouchableOpacity>
          </View>
          <View>
            <TouchableOpacity onPress = {()=>
            this.handleTransaction()
            }>
              <Text>
                SUBMIT
              </Text>
            </TouchableOpacity>
          </View>
          </KeyboardAvoidingView>
        );
      }
    }
  }
  
  const styles = StyleSheet.create(
    { container: { flex: 1, justifyContent: 'center', alignItems: 'center' }, 
    displayText:{ fontSize: 15, textDecorationLine: 'underline' }, 
    scanButton:{ backgroundColor: '#2196F3', padding: 10, margin: 10 }, 
    buttonText:{ fontSize: 15, textAlign: 'center', marginTop: 10 }, 
    inputView:{ flexDirection: 'row', margin: 20 },
    inputBox:{ width: 200, height: 40, borderWidth: 1.5, borderRightWidth: 0, fontSize: 20, marginTop:20 }, 
    scanButton:{ backgroundColor: '#66BB6A', width: 50, borderWidth: 1.5, borderLeftWidth: 0 } });