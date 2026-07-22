import React,{useState,useEffect} from "react";
import {View,Text,StyleSheet,FlatList,TouchableOpacity,ActivityIndicator} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import T from "../../styles/theme";
import {Empty,Badge} from "../../components/UI";
import {ordersAPI} from "../../api/api";
import {useAuth} from "../../context/AuthContext";

const STATUS_COLOR={placed:T.amber,confirmed:T.primary,shipped:"#8B5CF6",delivered:T.green,cancelled:T.red,disputed:T.red};

export default function MyOrdersScreen(){
  const {user}=useAuth();
  const [orders,setOrders]=useState([]);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{(async()=>{try{const r=await ordersAPI.getAll();setOrders(r.data.orders||[]);}catch{}finally{setLoading(false);}})();},[]);

  if(loading) return <View style={{flex:1,justifyContent:"center",backgroundColor:T.bg.primary}}><ActivityIndicator color={T.primary} size="large"/></View>;

  return(
    <View style={styles.root}>
      <View style={styles.header}><Text style={styles.title}>My Orders ({orders.length})</Text></View>
      {orders.length===0?(
        <View style={{flex:1,justifyContent:"center"}}>
          <Empty icon="receipt-outline" title="No orders yet" sub="Your purchase and sale orders will appear here"/>
        </View>
      ):(
        <FlatList data={orders} keyExtractor={i=>i._id} contentContainerStyle={{padding:16}}
          renderItem={({item})=>{
            const isBuyer=item.buyer?._id===user?.id||item.buyer===user?.id;
            return(
              <View style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <View style={styles.orderTypeBadge}>
                    <Ionicons name={isBuyer?"cart-outline":"storefront-outline"} size={12} color={isBuyer?T.primary:T.green}/>
                    <Text style={[styles.orderTypeText,{color:isBuyer?T.primary:T.green}]}>{isBuyer?"PURCHASE":"SALE"}</Text>
                  </View>
                  <Badge label={item.orderStatus?.toUpperCase()} color={STATUS_COLOR[item.orderStatus]||T.text.muted}/>
                </View>
                <Text style={styles.deviceName}>{item.listing?.brand} {item.listing?.model}</Text>
                <View style={styles.orderMeta}>
                  <Text style={styles.metaText}>Bill: <Text style={styles.metaVal}>{item.bill?.billNumber||"—"}</Text></Text>
                  <Text style={styles.metaText}>Amount: <Text style={[styles.metaVal,{color:T.primary}]}>₹{item.amount?.toLocaleString()}</Text></Text>
                </View>
                {item.bill&&(
                  <View style={styles.billRow}>
                    <Text style={styles.billText}>Platform fee: ₹{item.bill.platformFee?.toLocaleString()} + GST ₹{item.bill.gstOnFee?.toLocaleString()}</Text>
                    <Text style={[styles.billText,{color:T.green}]}>{isBuyer?`You paid: ₹${item.bill.buyerPays?.toLocaleString()}`:`You receive: ₹${item.bill.sellerReceives?.toLocaleString()}`}</Text>
                  </View>
                )}
                <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</Text>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles=StyleSheet.create({
  root:{flex:1,backgroundColor:T.bg.primary},
  header:{padding:16,paddingTop:20,backgroundColor:T.bg.secondary,borderBottomWidth:1,borderBottomColor:T.border.color},
  title:{fontSize:20,fontWeight:"800",color:T.text.primary},
  orderCard:{backgroundColor:T.bg.card,borderRadius:T.radius.lg,padding:14,marginBottom:12,borderWidth:1,borderColor:T.border.color},
  orderHeader:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:8},
  orderTypeBadge:{flexDirection:"row",alignItems:"center",gap:4,backgroundColor:T.bg.surface,paddingHorizontal:8,paddingVertical:3,borderRadius:T.radius.full},
  orderTypeText:{fontSize:10,fontWeight:"700"},
  deviceName:{fontSize:15,fontWeight:"700",color:T.text.primary,marginBottom:8},
  orderMeta:{flexDirection:"row",justifyContent:"space-between",marginBottom:6},
  metaText:{fontSize:11,color:T.text.muted},
  metaVal:{fontWeight:"700",color:T.text.primary},
  billRow:{backgroundColor:T.bg.surface,borderRadius:T.radius.sm,padding:8,marginBottom:6,gap:3},
  billText:{fontSize:11,color:T.text.muted},
  dateText:{fontSize:11,color:T.text.muted},
});
