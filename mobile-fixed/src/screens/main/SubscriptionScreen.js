import React,{useState} from "react";
import {View,Text,StyleSheet,ScrollView,TouchableOpacity,Alert,ActivityIndicator} from "react-native";
import {LinearGradient} from "expo-linear-gradient";
import {Ionicons} from "@expo/vector-icons";
import T from "../../styles/theme";
import {Btn} from "../../components/UI";
import {subAPI} from "../../api/api";

const PLANS={
  basic:{label:"Basic",monthly:299,yearly:2990,color:T.primary,icon:"flash",features:["10 active listings","50 AI calls/month","Basic analytics","Email support"]},
  pro:{label:"Pro",monthly:799,yearly:7990,color:"#8B5CF6",icon:"shield",features:["50 active listings","200 AI calls/month","Advanced analytics","Priority support","Featured badge"],popular:true},
  enterprise:{label:"Enterprise",monthly:1999,yearly:19990,color:T.amber,icon:"diamond",features:["Unlimited listings","Unlimited AI calls","Full analytics","Dedicated manager","API access"]},
};

export default function SubscriptionScreen({navigation}){
  const [cycle,setCycle]=useState("monthly");
  const [loading,setLoading]=useState(null);

  const subscribe=async(plan)=>{
    setLoading(plan);
    try{
      const r=await subAPI.subscribe({plan,billingCycle:cycle});
      Alert.alert("🎉 Subscribed!",r.data.message||"Plan activated!",[{text:"Go to Dashboard",onPress:()=>navigation.navigate("Account")}]);
    }catch(e){Alert.alert("Error",e.response?.data?.error||"Subscription failed");}
    finally{setLoading(null);}
  };

  return(
    <ScrollView style={styles.root} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={["#1a0a2e","#0B1220"]} style={styles.header}>
        <Ionicons name="star" size={40} color={T.amber}/>
        <Text style={styles.title}>Choose a Plan</Text>
        <Text style={styles.sub}>Retailers, wholesalers & technicians need a plan to list products</Text>
        <View style={styles.freeNote}><Ionicons name="checkmark-circle" size={14} color={T.green}/><Text style={styles.freeText}>Customers always browse FREE</Text></View>
      </LinearGradient>

      <View style={styles.body}>
        <View style={styles.cyclePicker}>
          {["monthly","yearly"].map(c=>(
            <TouchableOpacity key={c} onPress={()=>setCycle(c)} style={[styles.cycleBtn,cycle===c&&styles.cycleBtnActive]}>
              <Text style={[styles.cycleTxt,cycle===c&&styles.cycleTxtActive]}>{c==="monthly"?"Monthly":"Yearly"}</Text>
              {c==="yearly"&&<View style={styles.saveBadge}><Text style={styles.saveTxt}>Save 17%</Text></View>}
            </TouchableOpacity>
          ))}
        </View>

        {Object.entries(PLANS).map(([key,plan])=>(
          <View key={key} style={[styles.planCard,plan.popular&&styles.planCardPopular,{borderColor:plan.color+"40"}]}>
            {plan.popular&&<View style={[styles.popularBadge,{backgroundColor:plan.color}]}><Text style={styles.popularTxt}>MOST POPULAR</Text></View>}
            <View style={styles.planHeader}>
              <View style={[styles.planIcon,{backgroundColor:plan.color+"15"}]}><Ionicons name={plan.icon} size={22} color={plan.color}/></View>
              <View>
                <Text style={styles.planName}>{plan.label}</Text>
                <View style={{flexDirection:"row",alignItems:"baseline",gap:2}}>
                  <Text style={[styles.planPrice,{color:plan.color}]}>₹{plan[cycle].toLocaleString()}</Text>
                  <Text style={styles.planCycle}>/{cycle==="yearly"?"year":"month"}</Text>
                </View>
              </View>
            </View>
            {plan.features.map(f=>(
              <View key={f} style={styles.featureRow}><Ionicons name="checkmark-circle" size={14} color={plan.color}/><Text style={styles.featureTxt}>{f}</Text></View>
            ))}
            <Btn title={loading===key?"Processing…":`Get ${plan.label}`} onPress={()=>subscribe(key)} loading={loading===key} style={{marginTop:12,borderRadius:T.radius.lg}} variant={plan.popular?"primary":"secondary"}/>
          </View>
        ))}

        <View style={styles.feeInfo}>
          <Ionicons name="information-circle-outline" size={16} color={T.text.muted}/>
          <Text style={styles.feeInfoText}>When you sell, ZYPHOR charges 3% platform fee + 18% GST on the fee. A proper tax invoice is generated.</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles=StyleSheet.create({
  root:{flex:1,backgroundColor:T.bg.primary},
  header:{paddingTop:56,paddingBottom:28,paddingHorizontal:20,alignItems:"center",gap:8},
  title:{fontSize:26,fontWeight:"800",color:"#fff",textAlign:"center"},
  sub:{fontSize:13,color:"rgba(255,255,255,0.5)",textAlign:"center",lineHeight:20},
  freeNote:{flexDirection:"row",alignItems:"center",gap:6,backgroundColor:T.green+"15",paddingHorizontal:14,paddingVertical:7,borderRadius:T.radius.full,marginTop:4},
  freeText:{fontSize:12,color:T.green,fontWeight:"600"},
  body:{padding:16},
  cyclePicker:{flexDirection:"row",backgroundColor:T.bg.card,borderRadius:T.radius.lg,padding:4,marginBottom:16,gap:4},
  cycleBtn:{flex:1,paddingVertical:10,borderRadius:T.radius.md,alignItems:"center",flexDirection:"row",justifyContent:"center",gap:6},
  cycleBtnActive:{backgroundColor:T.primary},
  cycleTxt:{fontSize:13,fontWeight:"700",color:T.text.muted},
  cycleTxtActive:{color:"#fff"},
  saveBadge:{backgroundColor:T.green,borderRadius:T.radius.full,paddingHorizontal:6,paddingVertical:2},
  saveTxt:{fontSize:9,fontWeight:"800",color:"#fff"},
  planCard:{backgroundColor:T.bg.card,borderRadius:T.radius.xl,padding:16,marginBottom:16,borderWidth:1},
  planCardPopular:{borderWidth:2},
  popularBadge:{position:"absolute",top:-10,right:16,paddingHorizontal:12,paddingVertical:4,borderRadius:T.radius.full},
  popularTxt:{fontSize:9,fontWeight:"800",color:"#fff"},
  planHeader:{flexDirection:"row",alignItems:"center",gap:14,marginBottom:14},
  planIcon:{width:46,height:46,borderRadius:14,justifyContent:"center",alignItems:"center"},
  planName:{fontSize:16,fontWeight:"800",color:T.text.primary},
  planPrice:{fontSize:26,fontWeight:"900"},
  planCycle:{fontSize:12,color:T.text.muted},
  featureRow:{flexDirection:"row",alignItems:"center",gap:8,marginBottom:8},
  featureTxt:{fontSize:13,color:T.text.secondary},
  feeInfo:{flexDirection:"row",gap:10,backgroundColor:T.bg.card,borderRadius:T.radius.lg,padding:14,marginTop:4,marginBottom:24,borderWidth:1,borderColor:T.border.color},
  feeInfoText:{fontSize:12,color:T.text.muted,flex:1,lineHeight:18},
});
