import React,{useState,useEffect} from "react";
import {View,Text,StyleSheet,ScrollView,TouchableOpacity,Image,Dimensions,Alert,ActivityIndicator} from "react-native";
import {LinearGradient} from "expo-linear-gradient";
import {Ionicons} from "@expo/vector-icons";
import T from "../../styles/theme";
import {Btn,Badge} from "../../components/UI";
import {listingsAPI,ordersAPI} from "../../api/api";
import {useAuth} from "../../context/AuthContext";

const {width:W}=Dimensions.get("window");

export default function ListingDetailScreen({route,navigation}){
  const {id}=route.params||{};
  const {user}=useAuth();
  const [item,setItem]=useState(null);
  const [loading,setLoading]=useState(true);
  const [buying,setBuying]=useState(false);
  const [imgIdx,setImgIdx]=useState(0);

  useEffect(()=>{
    (async()=>{
      try{const r=await listingsAPI.getById(id);setItem(r.data.listing);}
      catch{Alert.alert("Error","Could not load listing");}
      finally{setLoading(false);}
    })();
  },[id]);

  const handleBuy=async()=>{
    if(!user){navigation.navigate("Login");return;}
    Alert.alert("Confirm Purchase",`Buy ${item.brand} ${item.model} for ₹${item.price?.toLocaleString()}?\n\nPlatform fee: 3% + 18% GST will apply.`,[
      {text:"Cancel",style:"cancel"},
      {text:"Confirm",style:"default",onPress:async()=>{
        setBuying(true);
        try{
          const r=await ordersAPI.create({listingId:item._id});
          Alert.alert("🎉 Order Placed!",`Bill No: ${r.data.bill?.billNumber}\nYou Pay: ₹${r.data.bill?.buyerPays?.toLocaleString()}`,[
            {text:"View Orders",onPress:()=>navigation.navigate("Account",{screen:"MyOrders"})}
          ]);
        }catch(e){Alert.alert("Error",e.response?.data?.error||"Purchase failed");}
        finally{setBuying(false);}
      }},
    ]);
  };

  if(loading) return <View style={styles.center}><ActivityIndicator color={T.primary} size="large"/></View>;
  if(!item) return <View style={styles.center}><Text style={{color:T.text.muted}}>Listing not found</Text></View>;

  const trust=item.verification?.trustScore||0;
  const tColor=trust>=80?T.green:trust>=50?T.amber:T.red;
  const fee=Math.round(item.price*0.03);
  const gst=Math.round(fee*0.18);

  const SPECS=[
    {k:"Brand",v:item.brand},{k:"Model",v:item.model},{k:"Storage",v:item.storage},
    {k:"RAM",v:item.ram},{k:"Condition",v:item.conditionGrade},
    {k:"City",v:item.city},{k:"Category",v:item.category},
  ].filter(s=>s.v);

  return(
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Images */}
        <View style={styles.imgContainer}>
          {item.images?.length>0?(
            <Image source={{uri:item.images[imgIdx]}} style={styles.mainImg} resizeMode="cover"/>
          ):(
            <View style={[styles.mainImg,styles.noImg]}>
              <Ionicons name="phone-portrait-outline" size={64} color={T.text.muted}/>
            </View>
          )}
          {item.images?.length>1&&(
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbRow}>
              {item.images.map((img,i)=>(
                <TouchableOpacity key={i} onPress={()=>setImgIdx(i)} style={[styles.thumb,imgIdx===i&&styles.thumbActive]}>
                  <Image source={{uri:img}} style={styles.thumbImg} resizeMode="cover"/>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
          <TouchableOpacity style={styles.backBtn} onPress={()=>navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color="#fff"/>
          </TouchableOpacity>
        </View>

        <View style={styles.body}>
          {/* Title + price */}
          <View style={styles.titleRow}>
            <View style={{flex:1}}>
              <Text style={styles.brand}>{item.brand}</Text>
              <Text style={styles.model}>{item.model}</Text>
            </View>
            <Text style={styles.price}>₹{item.price?.toLocaleString()}</Text>
          </View>

          {/* Badges */}
          <View style={styles.badgeRow}>
            <Badge label={item.conditionGrade} color={T.green} icon="checkmark-circle"/>
            <Badge label={`Trust ${trust}%`} color={tColor} icon="shield-checkmark"/>
            {item.emiEligible&&<Badge label="EMI Available" color={T.amber} icon="card"/>}
            {item.verification?.status==="verified"&&<Badge label="AI Verified" color={T.primary} icon="sparkles"/>}
          </View>

          {/* Specs */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Specifications</Text>
            {SPECS.map(s=>(
              <View key={s.k} style={styles.specRow}>
                <Text style={styles.specKey}>{s.k}</Text>
                <Text style={styles.specVal}>{s.v}</Text>
              </View>
            ))}
          </View>

          {/* Bill breakdown */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>💰 Fee Breakdown</Text>
            <View style={styles.specRow}><Text style={styles.specKey}>Listing Price</Text><Text style={styles.specVal}>₹{item.price?.toLocaleString()}</Text></View>
            <View style={styles.specRow}><Text style={styles.specKey}>Platform Fee (3%)</Text><Text style={[styles.specVal,{color:T.text.muted}]}>₹{fee.toLocaleString()}</Text></View>
            <View style={styles.specRow}><Text style={styles.specKey}>GST on Fee (18%)</Text><Text style={[styles.specVal,{color:T.text.muted}]}>₹{gst.toLocaleString()}</Text></View>
            <View style={[styles.specRow,{borderTopWidth:1,borderTopColor:T.border.color,marginTop:8,paddingTop:8}]}>
              <Text style={[styles.specKey,{fontWeight:"700",color:T.text.primary}]}>You Pay</Text>
              <Text style={[styles.specVal,{fontSize:16,fontWeight:"800",color:T.primary}]}>₹{item.price?.toLocaleString()}</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={[styles.specKey,{color:T.text.muted}]}>Seller Receives</Text>
              <Text style={[styles.specVal,{color:T.text.muted}]}>₹{(item.price-fee-gst)?.toLocaleString()}</Text>
            </View>
            <Text style={styles.gstNote}>*GST invoice generated on purchase</Text>
          </View>

          {/* Seller info */}
          {item.seller&&(
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Seller</Text>
              <View style={{flexDirection:"row",alignItems:"center",gap:12}}>
                <View style={styles.sellerAvatar}>
                  <Text style={styles.sellerInitial}>{item.seller.name?.[0]?.toUpperCase()||"S"}</Text>
                </View>
                <View>
                  <Text style={styles.sellerName}>{item.seller.businessName||item.seller.name}</Text>
                  <Text style={styles.sellerCity}>{item.seller.city}</Text>
                  {item.seller.verifiedSeller&&<Badge label="Verified Seller" color={T.green} icon="shield-checkmark"/>}
                </View>
              </View>
            </View>
          )}

          {item.description?<View style={styles.card}><Text style={styles.cardTitle}>Description</Text><Text style={styles.desc}>{item.description}</Text></View>:null}

          <View style={{height:100}}/>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomLabel}>Total Price</Text>
          <Text style={styles.bottomPrice}>₹{item.price?.toLocaleString()}</Text>
        </View>
        {item.status==="active"?(
          <Btn title={buying?"Processing…":"Buy Now"} onPress={handleBuy} loading={buying} icon="cart" style={{flex:1,marginLeft:16,borderRadius:T.radius.lg}}/>
        ):(
          <View style={styles.soldBadge}><Text style={styles.soldText}>SOLD OUT</Text></View>
        )}
      </View>
    </View>
  );
}

const styles=StyleSheet.create({
  root:{flex:1,backgroundColor:T.bg.primary},
  center:{flex:1,justifyContent:"center",alignItems:"center",backgroundColor:T.bg.primary},
  imgContainer:{position:"relative"},
  mainImg:{width:W,height:280,backgroundColor:T.bg.surface},
  noImg:{justifyContent:"center",alignItems:"center"},
  thumbRow:{position:"absolute",bottom:8,paddingHorizontal:12},
  thumb:{width:52,height:52,borderRadius:T.radius.sm,marginRight:8,overflow:"hidden",borderWidth:2,borderColor:"transparent"},
  thumbActive:{borderColor:T.primary},
  thumbImg:{width:"100%",height:"100%"},
  backBtn:{position:"absolute",top:48,left:16,width:38,height:38,borderRadius:19,backgroundColor:"rgba(0,0,0,0.6)",justifyContent:"center",alignItems:"center"},
  body:{padding:16},
  titleRow:{flexDirection:"row",alignItems:"flex-start",marginBottom:12},
  brand:{fontSize:13,color:T.text.muted,fontWeight:"600",textTransform:"uppercase"},
  model:{fontSize:24,fontWeight:"800",color:T.text.primary},
  price:{fontSize:26,fontWeight:"900",color:T.primary},
  badgeRow:{flexDirection:"row",flexWrap:"wrap",gap:8,marginBottom:16},
  card:{backgroundColor:T.bg.card,borderRadius:T.radius.lg,padding:16,marginBottom:12,borderWidth:1,borderColor:T.border.color},
  cardTitle:{fontSize:14,fontWeight:"700",color:T.text.primary,marginBottom:12},
  specRow:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",paddingVertical:7,borderBottomWidth:1,borderBottomColor:T.border.color},
  specKey:{fontSize:13,color:T.text.muted},
  specVal:{fontSize:13,fontWeight:"600",color:T.text.primary},
  gstNote:{fontSize:11,color:T.text.muted,marginTop:8},
  sellerAvatar:{width:44,height:44,borderRadius:22,backgroundColor:T.primary+"30",justifyContent:"center",alignItems:"center"},
  sellerInitial:{fontSize:18,fontWeight:"800",color:T.primary},
  sellerName:{fontSize:14,fontWeight:"700",color:T.text.primary},
  sellerCity:{fontSize:12,color:T.text.muted,marginBottom:4},
  desc:{fontSize:14,color:T.text.secondary,lineHeight:22},
  bottomBar:{position:"absolute",bottom:0,left:0,right:0,flexDirection:"row",alignItems:"center",backgroundColor:T.bg.card,padding:16,paddingBottom:30,borderTopWidth:1,borderTopColor:T.border.color},
  bottomLabel:{fontSize:11,color:T.text.muted},
  bottomPrice:{fontSize:20,fontWeight:"800",color:T.primary},
  soldBadge:{flex:1,marginLeft:16,backgroundColor:T.red+"20",borderRadius:T.radius.lg,padding:14,alignItems:"center",borderWidth:1,borderColor:T.red+"30"},
  soldText:{fontSize:16,fontWeight:"800",color:T.red},
});
