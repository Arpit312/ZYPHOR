import React,{useState,useEffect,useCallback} from "react";
import {View,Text,StyleSheet,ScrollView,TouchableOpacity,RefreshControl,Dimensions,FlatList} from "react-native";
import {LinearGradient} from "expo-linear-gradient";
import {Ionicons} from "@expo/vector-icons";
import T from "../../styles/theme";
import {ListingCard,SecHeader,Empty,StatCard} from "../../components/UI";
import {listingsAPI} from "../../api/api";
import {useAuth} from "../../context/AuthContext";

const W=Dimensions.get("window").width;
const QUICK=[
  {icon:"phone-portrait-outline",label:"Browse",color:T.primary,tab:"Browse",screen:"Marketplace"},
  {icon:"construct-outline",label:"Parts",color:T.amber,tab:"Browse",screen:"Parts"},
  {icon:"sparkles-outline",label:"AI Advisor",color:T.green,tab:"AI Tools",screen:"Advisor"},
  {icon:"pricetag-outline",label:"Price Check",color:"#8B5CF6",tab:"AI Tools",screen:"PricingAgent"},
  {icon:"scan-outline",label:"IMEI Check",color:"#06B6D4",tab:null,screen:"IMEICheck"},
  {icon:"add-circle-outline",label:"Sell",color:T.primary,tab:"Sell",screen:"SellMain"},
];

export default function HomeScreen({navigation}){
  const {user}=useAuth();
  const [listings,setListings]=useState([]);
  const [refreshing,setRefreshing]=useState(false);

  const load=useCallback(async()=>{
    try{const r=await listingsAPI.getAll({sort:"trust",limit:8});setListings(r.data.listings||[]);}
    catch{}
  },[]);

  useEffect(()=>{load();},[load]);
  const refresh=async()=>{setRefreshing(true);await load();setRefreshing(false);};

  return(
    <ScrollView style={styles.root} showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={T.primary}/>}>

      {/* HERO */}
      <LinearGradient colors={["#0B1220","#16233D"]} style={styles.hero}>
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.heroGreet}>Hello, {user?.name?.split(" ")[0]||"there"} 👋</Text>
            <Text style={styles.heroTitle}>ZYPHOR</Text>
            <Text style={styles.heroSub}>AI-Verified Phones & Parts</Text>
          </View>
          <TouchableOpacity onPress={()=>navigation.navigate("IMEICheck")} style={styles.scanBtn}>
            <Ionicons name="scan-outline" size={22} color={T.green}/>
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <TouchableOpacity style={styles.searchBar} onPress={()=>navigation.navigate("Browse",{screen:"Marketplace",params:{focus:true}})}>
          <Ionicons name="search-outline" size={18} color={T.text.muted}/>
          <Text style={styles.searchText}>Search phones, brands, parts…</Text>
        </TouchableOpacity>

        {/* Trust metrics */}
        <View style={styles.metricsRow}>
          {[{n:"6K+",l:"Listings"},{n:"91%",l:"Avg Trust"},{n:"₹0",l:"IMEI Check"},{n:"48h",l:"Verification"}].map(m=>(
            <View key={m.l} style={styles.metric}>
              <Text style={styles.metricN}>{m.n}</Text>
              <Text style={styles.metricL}>{m.l}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      {/* QUICK ACTIONS */}
      <View style={styles.section}>
        <SecHeader title="Quick Actions"/>
        <View style={styles.quickGrid}>
          {QUICK.map(q=>(
            <TouchableOpacity key={q.label} style={styles.quickCard} onPress={()=>q.tab?navigation.navigate(q.tab,{screen:q.screen}):navigation.navigate(q.screen)}>
              <View style={[styles.quickIcon,{backgroundColor:q.color+"15"}]}>
                <Ionicons name={q.icon} size={24} color={q.color}/>
              </View>
              <Text style={styles.quickLabel}>{q.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* FEATURED DEALS */}
      <View style={styles.section}>
        <SecHeader title="Top Verified Deals" sub="AI-checked & trust-scored" action={()=>navigation.navigate("Browse")} actionLabel="See all"/>
        {listings.length===0
          ? <Empty icon="phone-portrait-outline" title="No listings yet" sub="Check back soon!"/>
          : <View style={styles.listGrid}>
              {listings.map(l=><ListingCard key={l._id} item={l} onPress={()=>navigation.navigate("ListingDetail",{id:l._id})}/>)}
            </View>
        }
      </View>

      {/* Subscription banner for sellers */}
      {user&&["retailer","wholesaler","technician"].includes(user.role)&&user.subscription?.status!=="active"&&(
        <TouchableOpacity style={styles.subBanner} onPress={()=>navigation.navigate("Account",{screen:"Subscription"})}>
          <Ionicons name="star" size={18} color={T.amber}/>
          <Text style={styles.subBannerText}>Activate subscription to start listing your products</Text>
          <Ionicons name="chevron-forward" size={16} color={T.amber}/>
        </TouchableOpacity>
      )}

      <View style={{height:24}}/>
    </ScrollView>
  );
}

const styles=StyleSheet.create({
  root:{flex:1,backgroundColor:T.bg.primary},
  hero:{paddingTop:56,paddingHorizontal:20,paddingBottom:24},
  heroTop:{flexDirection:"row",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20},
  heroGreet:{fontSize:T.fonts.sm,color:"rgba(255,255,255,0.5)",marginBottom:2},
  heroTitle:{fontSize:32,fontWeight:"900",color:"#fff",letterSpacing:1},
  heroSub:{fontSize:12,color:"rgba(255,255,255,0.4)",marginTop:2},
  scanBtn:{width:44,height:44,borderRadius:22,backgroundColor:"rgba(31,174,107,0.15)",justifyContent:"center",alignItems:"center",borderWidth:1,borderColor:"rgba(31,174,107,0.3)"},
  searchBar:{flexDirection:"row",alignItems:"center",gap:10,backgroundColor:"rgba(255,255,255,0.07)",borderRadius:T.radius.lg,paddingHorizontal:16,paddingVertical:13,marginBottom:20,borderWidth:1,borderColor:T.border.color},
  searchText:{fontSize:14,color:T.text.muted,flex:1},
  metricsRow:{flexDirection:"row",gap:4},
  metric:{flex:1,backgroundColor:"rgba(255,255,255,0.05)",borderRadius:T.radius.md,padding:10,alignItems:"center"},
  metricN:{fontSize:T.fonts.lg,fontWeight:"700",color:"#fff"},
  metricL:{fontSize:10,color:"rgba(255,255,255,0.4)",marginTop:2},
  section:{paddingHorizontal:20,paddingTop:24},
  quickGrid:{flexDirection:"row",flexWrap:"wrap",gap:10},
  quickCard:{width:(W-60)/3,backgroundColor:T.bg.card,borderRadius:T.radius.lg,padding:14,alignItems:"center",gap:8,borderWidth:1,borderColor:T.border.color},
  quickIcon:{width:48,height:48,borderRadius:14,justifyContent:"center",alignItems:"center"},
  quickLabel:{fontSize:11,fontWeight:"600",color:T.text.secondary,textAlign:"center"},
  listGrid:{flexDirection:"row",flexWrap:"wrap",gap:10},
  subBanner:{flexDirection:"row",alignItems:"center",gap:10,backgroundColor:T.amber+"15",borderRadius:T.radius.lg,marginHorizontal:20,marginTop:16,padding:16,borderWidth:1,borderColor:T.amber+"30"},
  subBannerText:{flex:1,fontSize:13,color:T.amber,fontWeight:"500"},
});
