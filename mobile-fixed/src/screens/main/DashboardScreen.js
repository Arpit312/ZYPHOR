import React,{useState,useEffect,useCallback} from "react";
import {View,Text,StyleSheet,ScrollView,TouchableOpacity,RefreshControl,Alert} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {LinearGradient} from "expo-linear-gradient";
import T from "../../styles/theme";
import {StatCard,Badge} from "../../components/UI";
import {listingsAPI,ordersAPI,subAPI} from "../../api/api";
import {useAuth} from "../../context/AuthContext";

const MENU=[
  {icon:"list-outline",label:"My Listings",screen:"MyListings",color:T.primary},
  {icon:"receipt-outline",label:"My Orders",screen:"MyOrders",color:T.amber},
  {icon:"person-outline",label:"Edit Profile",screen:"Profile",color:T.green},
  {icon:"star-outline",label:"Subscription",screen:"Subscription",color:"#8B5CF6"},
  {icon:"scan-outline",label:"IMEI Check",screen:"IMEICheck",color:"#06B6D4"},
  {icon:"information-circle-outline",label:"About ZYPHOR",screen:"About",color:T.text.muted},
];

export default function DashboardScreen({navigation}){
  const {user,logout}=useAuth();
  const [stats,setStats]=useState({listings:0,orders:0,earnings:0});
  const [sub,setSub]=useState(null);
  const [refreshing,setRefreshing]=useState(false);

  const load=useCallback(async()=>{
    try{
      const [lRes,oRes,sRes]=await Promise.allSettled([
        listingsAPI.getAll({seller:user?.id,limit:1}),
        ordersAPI.getAll(),
        subAPI.get(),
      ]);
      if(lRes.status==="fulfilled") setStats(s=>({...s,listings:lRes.value.data.count||0}));
      if(oRes.status==="fulfilled"){
        const orders=oRes.value.data.orders||[];
        const sold=orders.filter(o=>(o.seller?._id||o.seller)===user?.id&&o.orderStatus==="delivered");
        const earnings=sold.reduce((sum,o)=>sum+(o.bill?.sellerReceives||0),0);
        setStats(s=>({...s,orders:orders.length,earnings}));
      }
      if(sRes.status==="fulfilled") setSub(sRes.value.data.subscription);
    }catch{}
  },[user]);

  useEffect(()=>{load();},[load]);
  const refresh=async()=>{setRefreshing(true);await load();setRefreshing(false);};

  const handleLogout=()=>{
    Alert.alert("Logout","Are you sure?",[
      {text:"Cancel",style:"cancel"},
      {text:"Logout",style:"destructive",onPress:logout},
    ]);
  };

  const ROLE_COLOR={customer:T.green,retailer:T.primary,wholesaler:T.amber,technician:"#8B5CF6",admin:T.red};
  const isSeller=["retailer","wholesaler","technician"].includes(user?.role);

  return(
    <ScrollView style={styles.root} showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={T.primary}/>}>
      <LinearGradient colors={["#0B1220","#16233D"]} style={styles.header}>
        <View style={styles.avatarRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase()||"U"}</Text>
          </View>
          <View style={{flex:1}}>
            <Text style={styles.name}>{user?.name}</Text>
            <Text style={styles.email}>{user?.email}</Text>
            <View style={{flexDirection:"row",gap:8,marginTop:6}}>
              <Badge label={user?.role?.toUpperCase()||"USER"} color={ROLE_COLOR[user?.role]||T.primary}/>
              {sub?.status==="active"&&<Badge label={`${sub.plan?.toUpperCase()} PLAN`} color="#8B5CF6" icon="star"/>}
            </View>
          </View>
          <TouchableOpacity onPress={()=>navigation.navigate("Profile")} style={styles.editBtn}>
            <Ionicons name="pencil" size={16} color={T.text.secondary}/>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.body}>
        {/* Stats */}
        {isSeller&&(
          <View style={styles.statsRow}>
            <StatCard icon="list" value={stats.listings} label="Listings" color={T.primary}/>
            <StatCard icon="receipt" value={stats.orders} label="Orders" color={T.amber}/>
            <StatCard icon="cash" value={`₹${stats.earnings>999?Math.round(stats.earnings/1000)+"K":stats.earnings}`} label="Earnings" color={T.green}/>
          </View>
        )}

        {/* Subscription banner */}
        {isSeller&&sub?.status!=="active"&&(
          <TouchableOpacity onPress={()=>navigation.navigate("Subscription")} style={styles.subBanner}>
            <View style={{flex:1}}>
              <Text style={styles.subBannerTitle}>Activate Subscription</Text>
              <Text style={styles.subBannerSub}>Start listing your products · Plans from ₹299/mo</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={T.amber}/>
          </TouchableOpacity>
        )}

        {/* Menu */}
        <View style={styles.menuCard}>
          {MENU.map((m,i)=>(
            <TouchableOpacity key={m.label} onPress={()=>navigation.navigate(m.screen)} style={[styles.menuItem,i<MENU.length-1&&styles.menuItemBorder]}>
              <View style={[styles.menuIcon,{backgroundColor:m.color+"15"}]}>
                <Ionicons name={m.icon} size={18} color={m.color}/>
              </View>
              <Text style={styles.menuLabel}>{m.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={T.text.muted}/>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={18} color={T.red}/>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>ZYPHOR v2.0 • Made in India 🇮🇳</Text>
      </View>
    </ScrollView>
  );
}

const styles=StyleSheet.create({
  root:{flex:1,backgroundColor:T.bg.primary},
  header:{paddingTop:56,paddingBottom:24,paddingHorizontal:20},
  avatarRow:{flexDirection:"row",alignItems:"flex-start",gap:14},
  avatar:{width:60,height:60,borderRadius:30,backgroundColor:T.primary,justifyContent:"center",alignItems:"center"},
  avatarText:{fontSize:26,fontWeight:"800",color:"#fff"},
  name:{fontSize:18,fontWeight:"800",color:"#fff"},
  email:{fontSize:12,color:"rgba(255,255,255,0.5)",marginTop:2},
  editBtn:{width:36,height:36,borderRadius:18,backgroundColor:"rgba(255,255,255,0.1)",justifyContent:"center",alignItems:"center"},
  body:{padding:16},
  statsRow:{flexDirection:"row",gap:10,marginBottom:16},
  subBanner:{flexDirection:"row",alignItems:"center",backgroundColor:T.amber+"15",borderRadius:T.radius.lg,padding:16,marginBottom:16,borderWidth:1,borderColor:T.amber+"30"},
  subBannerTitle:{fontSize:14,fontWeight:"700",color:T.amber},
  subBannerSub:{fontSize:12,color:T.text.muted,marginTop:2},
  menuCard:{backgroundColor:T.bg.card,borderRadius:T.radius.xl,overflow:"hidden",borderWidth:1,borderColor:T.border.color,marginBottom:16},
  menuItem:{flexDirection:"row",alignItems:"center",gap:12,padding:16},
  menuItemBorder:{borderBottomWidth:1,borderBottomColor:T.border.color},
  menuIcon:{width:36,height:36,borderRadius:T.radius.sm,justifyContent:"center",alignItems:"center"},
  menuLabel:{flex:1,fontSize:14,fontWeight:"600",color:T.text.primary},
  logoutBtn:{flexDirection:"row",alignItems:"center",justifyContent:"center",gap:8,backgroundColor:T.red+"10",borderRadius:T.radius.lg,padding:14,borderWidth:1,borderColor:T.red+"25",marginBottom:16},
  logoutText:{fontSize:14,fontWeight:"700",color:T.red},
  version:{textAlign:"center",fontSize:11,color:T.text.muted},
});
