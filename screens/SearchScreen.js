import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet, FlatList, TextInput } from 'react-native';
import db from '../Config';
import {ScrollView} from 'react-native-gesture-handler';


export default class Searchscreen extends React.Component {
  constructor(props){
    super(props);
    this.state=({
      allTransactions:[],
      lastVisibleTransaction:null,
      search:"",
    })

  }
  fetchMoreTransaction = async()=>{
    var text = this.state.search.toUpperCase();
    var ID = text.split("");
    if (ID[0] === "B"){
    const query = await db.collection("TRANSACTION").where("BookID","==",text).startAfter(this.state.lastVisibleTransaction).limit(10).get()
    query.docs.map(doc=>{
      this.setState({
        allTransactions:[...this.state.allTransactions,doc.data()],
        lastVisibleTransaction:doc,
      })
    })
  }
  else if (ID[0] === "S"){
    const query = await db.collection("TRANSACTION").where("StudentID","==",text).startAfter(this.state.lastVisibleTransaction).limit(10).get()
    query.docs.map(doc=>{
      this.setState({
        allTransactions:[...this.state.allTransactions,doc.data()],
        lastVisibleTransaction:doc,
      })
    })

  }

  }
  componentDidMount= async()=>{
    const query = await db.collection("TRANSACTION").limit(10).get()
    query.docs.map(doc=>{
      this.setState({
        allTransactions:[],
        lastVisibleTransaction:doc,
      })
    })
    console.log(this.state.allTransactions)
  }
  searchTransaction = async(Text)=>{
    var ID = Text.split("");
    if (ID[0].toUpperCase() === "B"){
      const bookID = await db.collection("TRANSACTION").where("BookID","==",Text).get();
      bookID.docs.map(doc=>{
        this.setState({
          allTransactions:[...this.state.allTransactions,doc.data()],
          lastVisibleTransaction:doc,
        })
      });
    }
    else if(ID[0].toUpperCase() === "S"){
      const StudentID = await db.collection("TRANSACTION").where("StudentID","==",Text).get();
      StudentID.docs.map(doc=>{
        this.setState({
          allTransactions:[...this.state.allTransactions,doc.data()],
          lastVisibleTransaction:doc,
        })
      });
    }

  }
    render() {
      return (
        <View style = {Styles.container}>
          <View style = {Styles.searchBar}>
            <TextInput style = {Styles.bar} placeholder = {"Enter BookID or StudentID"} onChangeText = {Text=>{
              this.setState({
                search:Text,
              })
            }}>
            </TextInput>
            <TouchableOpacity style = {Styles.searchButton} onPress = {()=>{
              this.searchTransaction(this.state.search);
            }}>
              <Text>
                search
              </Text>
            </TouchableOpacity>
          </View>
          <FlatList data = {this.state.allTransactions} 
          renderItem = {({item})=>(
            <View style = {{borderBottomWidth:20}}>
              <Text>
                {"BookID:"+item.BookID}
              </Text>
              <Text>
                {"StudentID:"+item.StudentID}
              </Text>
              <Text>
                {"TransactionType:"+item.TransactionType}
              </Text>
            </View>
          )}
          keyExtractor = {(item,index)=>index.toString()}
          onEndReached={this.fetchMoreTransaction} onEndReachedThreshold={0.8} />
          </View>
      );
    }
  }
  const Styles = StyleSheet.create({
     container: { flex: 1, marginTop: 20 }, 
     searchBar:{ flexDirection:'row', height:40, width:'auto', 
     borderWidth:0.5, alignItems:'center', backgroundColor:'grey', }, 
     bar:{ borderWidth:2, height:30, width:300, paddingLeft:10, }, 
     searchButton:{ borderWidth:1, height:30, width:50, alignItems:'center', justifyContent:'center', backgroundColor:'green' } })