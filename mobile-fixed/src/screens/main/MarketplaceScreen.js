import React,{useState,useEffect,useCallback,useRef} from "react";
import {View,Text,StyleSheet,FlatList,TouchableOpacity,TextInput,ScrollView,ActivityIndicator} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import T from "../../styles/theme";
import {ListingCard,Empty,Badge} from "../../components/UI";
import {listingsAPI} from "../../api/api";

const BRANDS=["All","Apple","Samsung","OnePlus","Xiaomi","Realme","Vivo","Oppo"];
const SORTS=[{k:"newest",l:"Newest"},{k:"price_low",l:"Price ↑"},{k:"price_high",l:"Price ↓"},{k:"trust",l:"Trust Score"}];

export default function MarketplaceScreen({navigation,route}){
  const [q,setQ]=useState("");
  const [brand,setBrand]=useState("All");
  const [sort,setSort]=useState("newest");
  const [listings,setListings]=useState([]);
  const [loading,setLoading]=useState(true);
  const searchRef=useRef(null);

  useEffect(()=>{
    if(route?.params?.focus){
      const t=setTimeout(()=>searchRef.current?.focus(),350);
      return()=>clearTimeout(t);
    }
  },[route?.params?.focus]);

  const load=useCallback(async()=>{
    setLoading(true);
    try{
      const params={sort,type:"device"};
      if(q) params.q=q;
      if(brand!=="All") params.brand=brand;
      const r=await listingsAPI.getAll(params);
      setListings(r.data.listings||[]);
    }catch{setListings([]);}
    finally{setLoading(false);}
  },[q,brand,sort]);

  useEffect(()=>{const t=setTimeout(load,300);return()=>clearTimeout(t);},[load]);

  return(
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>Marketplace</Text>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={T.text.muted}/>
          <TextInput ref={searchRef} style={styles.searchInput} placeholder="Search phones, brands…" placeholderTextColor={T.text.muted} value={q} onChangeText={setQ}/>
          {q?<TouchableOpacity onPress={()=>setQ("")}><Ionicons name="close-circle" size={18} color={T.text.muted}/></TouchableOpacity>:null}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginTop:12}}>
          {BRANDS.map(b=>(
            <TouchableOpacity key={b} onPress={()=>setBrand(b)} style={[styles.chip,brand===b&&styles.chipActive]}>
              <Text style={[styles.chipText,brand===b&&styles.chipTextActive]}>{b}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginTop:8}}>
          {SORTS.map(s=>(
            <TouchableOpacity key={s.k} onPress={()=>setSort(s.k)} style={[styles.sortChip,sort===s.k&&styles.sortChipActive]}>
              <Text style={[styles.sortText,sort===s.k&&styles.sortTextActive]}>{s.l}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading?(
        <View style={{flex:1,justifyContent:"center"}}><ActivityIndicator color={T.primary} size="large"/></View>
      ):listings.length===0?(
        <Empty icon="search-outline" title="No devices found" sub="Try different filters or search terms"/>
      ):(
        <FlatList
          data={listings} keyExtractor={i=>i._id} numColumns={2}
          contentContainerStyle={{padding:16,gap:4}}
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
  title:{fontSize:24,fontWeight:"800",color:T.text.primary,marginBottom:12},
  searchBar:{flexDirection:"row",alignItems:"center",gap:8,backgroundColor:T.bg.input,borderRadius:T.radius.md,paddingHorizontal:14,paddingVertical:11,borderWidth:1,borderColor:T.border.color},
  searchInput:{flex:1,fontSize:14,color:T.text.primary},
  chip:{paddingHorizontal:14,paddingVertical:7,borderRadius:T.radius.full,backgroundColor:T.bg.card,marginRight:8,borderWidth:1,borderColor:T.border.color},
  chipActive:{backgroundColor:T.primary,borderColor:T.primary},
  chipText:{fontSize:12,color:T.text.secondary,fontWeight:"600"},
  chipTextActive:{color:"#fff"},
  sortChip:{paddingHorizontal:12,paddingVertical:5,borderRadius:T.radius.full,marginRight:6},
  sortChipActive:{backgroundColor:T.green+"20"},
  sortText:{fontSize:11,color:T.text.muted,fontWeight:"600"},
  sortTextActive:{color:T.green},
});
