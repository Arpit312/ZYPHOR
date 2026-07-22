import React,{useState,useEffect,useCallback} from "react";
import {View,Text,StyleSheet,FlatList,TouchableOpacity,Alert,ActivityIndicator} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import T from "../../styles/theme";
import {ListingCard,Empty,Btn} from "../../components/UI";
import {listingsAPI} from "../../api/api";
import {useAuth} from "../../context/AuthContext";

export default function MyListingsScreen({navigation}){
  const {user}=useAuth();
  const [listings,setListings]=useState([]);
  const [loading,setLoading]=useState(true);

  const load=useCallback(async()=>{
    try{const r=await listingsAPI.getAll({seller:user?.id});setListings(r.data.listings||[]);}
    catch{setListings([]);}finally{setLoading(false);}
  },[user]);

  useEffect(()=>{load();},[load]);

  const deleteListing=async(id)=>{
    Alert.alert("Delete Listing","Are you sure? This cannot be undone.",[
      {text:"Cancel",style:"cancel"},
      {text:"Delete",style:"destructive",onPress:async()=>{
        try{await listingsAPI.delete(id);setListings(p=>p.filter(l=>l._id!==id));}
        catch(e){Alert.alert("Error",e.response?.data?.error||"Delete failed");}
      }},
    ]);
  };

  if(loading) return <View style={{flex:1,justifyContent:"center",backgroundColor:T.bg.primary}}><ActivityIndicator color={T.primary} size="large"/></View>;

  return(
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>My Listings ({listings.length})</Text>
        <TouchableOpacity onPress={()=>navigation.navigate("Sell")} style={styles.addBtn}>
          <Ionicons name="add" size={22} color="#fff"/>
        </TouchableOpacity>
      </View>
      {listings.length===0?(
        <View style={{flex:1,justifyContent:"center"}}>
          <Empty icon="list-outline" title="No listings yet" sub="Create your first listing and start selling!" action={()=>navigation.navigate("Sell")} actionLabel="Create Listing"/>
        </View>
      ):(
        <FlatList data={listings} keyExtractor={i=>i._id} contentContainerStyle={{padding:16}}
          renderItem={({item})=>(
            <View style={styles.itemWrap}>
              <ListingCard item={item} onPress={()=>navigation.navigate("ListingDetail",{id:item._id})} wide/>
              <View style={styles.itemActions}>
                <View style={[styles.statusBadge,{backgroundColor:item.status==="active"?T.green+"20":item.status==="sold"?T.amber+"20":T.red+"20"}]}>
                  <Text style={[styles.statusText,{color:item.status==="active"?T.green:item.status==="sold"?T.amber:T.red}]}>{item.status?.toUpperCase()}</Text>
                </View>
                <TouchableOpacity onPress={()=>deleteListing(item._id)} style={styles.deleteBtn}>
                  <Ionicons name="trash-outline" size={16} color={T.red}/>
                  <Text style={styles.deleteTxt}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles=StyleSheet.create({
  root:{flex:1,backgroundColor:T.bg.primary},
  header:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",padding:16,paddingTop:20,backgroundColor:T.bg.secondary,borderBottomWidth:1,borderBottomColor:T.border.color},
  title:{fontSize:20,fontWeight:"800",color:T.text.primary},
  addBtn:{width:40,height:40,borderRadius:20,backgroundColor:T.primary,justifyContent:"center",alignItems:"center"},
  itemWrap:{marginBottom:12},
  itemActions:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",paddingHorizontal:4,marginTop:-4},
  statusBadge:{paddingHorizontal:10,paddingVertical:4,borderRadius:T.radius.full},
  statusText:{fontSize:10,fontWeight:"800"},
  deleteBtn:{flexDirection:"row",alignItems:"center",gap:4,paddingVertical:6,paddingHorizontal:10},
  deleteTxt:{fontSize:12,color:T.red,fontWeight:"600"},
});
