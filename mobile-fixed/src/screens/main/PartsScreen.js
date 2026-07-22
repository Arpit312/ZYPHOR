import React,{useState,useEffect,useCallback} from "react";
import {View,Text,StyleSheet,FlatList,TouchableOpacity,TextInput,ScrollView,ActivityIndicator} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import T from "../../styles/theme";
import {ListingCard,Empty} from "../../components/UI";
import {listingsAPI} from "../../api/api";

const CATS=["All","Screen","Battery","Charger","Camera","Speaker","Back Glass","Motherboard"];

export default function PartsScreen({navigation}){
  const [q,setQ]=useState("");
  const [cat,setCat]=useState("All");
  const [parts,setParts]=useState([]);
  const [loading,setLoading]=useState(true);

  const load=useCallback(async()=>{
    setLoading(true);
    try{
      const params={type:"part"};
      if(q) params.q=q;
      if(cat!=="All") params.tag=cat;
      const r=await listingsAPI.getAll(params);
      setParts(r.data.listings||[]);
    }catch{setParts([]);}
    finally{setLoading(false);}
  },[q,cat]);

  useEffect(()=>{const t=setTimeout(load,300);return()=>clearTimeout(t);},[load]);

  return(
    <View style={styles.root}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Parts Marketplace</Text>
          <View style={styles.badge}><Ionicons name="construct" size={12} color={T.amber}/><Text style={styles.badgeText}>Genuine</Text></View>
        </View>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={T.text.muted}/>
          <TextInput style={styles.searchInput} placeholder="Search parts, brands…" placeholderTextColor={T.text.muted} value={q} onChangeText={setQ}/>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginTop:12}}>
          {CATS.map(c=>(
            <TouchableOpacity key={c} onPress={()=>setCat(c)} style={[styles.chip,cat===c&&styles.chipActive]}>
              <Text style={[styles.chipText,cat===c&&styles.chipTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading?(
        <View style={{flex:1,justifyContent:"center"}}><ActivityIndicator color={T.primary} size="large"/></View>
      ):parts.length===0?(
        <Empty icon="construct-outline" title="No parts found" sub="Try different category or search"/>
      ):(
        <FlatList
          data={parts} keyExtractor={i=>i._id} numColumns={2}
          contentContainerStyle={{padding:16}}
          columnWrapperStyle={{justifyContent:"space-between"}}
          renderItem={({item})=><ListingCard item={item} onPress={()=>navigation.navigate("ListingDetail",{id:item._id})}/>}
        />
      )}
    </View>
  );
}

const styles=StyleSheet.create({
  root:{flex:1,backgroundColor:T.bg.primary},
  header:{padding:16,paddingTop:20,backgroundColor:T.bg.secondary,borderBottomWidth:1,borderBottomColor:T.border.color},
  titleRow:{flexDirection:"row",alignItems:"center",gap:10,marginBottom:12},
  title:{fontSize:24,fontWeight:"800",color:T.text.primary},
  badge:{flexDirection:"row",alignItems:"center",gap:4,backgroundColor:T.amber+"20",paddingHorizontal:8,paddingVertical:3,borderRadius:T.radius.full},
  badgeText:{fontSize:10,color:T.amber,fontWeight:"700"},
  searchBar:{flexDirection:"row",alignItems:"center",gap:8,backgroundColor:T.bg.input,borderRadius:T.radius.md,paddingHorizontal:14,paddingVertical:11,borderWidth:1,borderColor:T.border.color},
  searchInput:{flex:1,fontSize:14,color:T.text.primary},
  chip:{paddingHorizontal:14,paddingVertical:7,borderRadius:T.radius.full,backgroundColor:T.bg.card,marginRight:8,borderWidth:1,borderColor:T.border.color},
  chipActive:{backgroundColor:T.amber,borderColor:T.amber},
  chipText:{fontSize:12,color:T.text.secondary,fontWeight:"600"},
  chipTextActive:{color:"#000"},
});
