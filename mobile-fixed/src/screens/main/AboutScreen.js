import React from "react";
import {View,Text,StyleSheet,ScrollView,TouchableOpacity,Linking} from "react-native";
import {LinearGradient} from "expo-linear-gradient";
import {Ionicons} from "@expo/vector-icons";
import T from "../../styles/theme";

export default function AboutScreen(){
  return(
    <ScrollView style={styles.root}>
      <LinearGradient colors={["#0B1220","#16233D"]} style={styles.header}>
        <Ionicons name="scan" size={48} color={T.green}/>
        <Text style={styles.logo}>ZYPHOR</Text>
        <Text style={styles.tagline}>India's Most Trusted Phone Marketplace</Text>
        <Text style={styles.version}>Version 2.0</Text>
      </LinearGradient>
      <View style={styles.body}>
        {[
          {icon:"shield-checkmark",color:T.green,title:"AI Verified",text:"Every listing is AI-analyzed with trust scores so you buy with confidence."},
          {icon:"scan-outline",color:T.primary,title:"IMEI Protection",text:"Instant IMEI checks to prevent buying stolen or blacklisted devices."},
          {icon:"sparkles",color:T.amber,title:"Smart Pricing",text:"AI-powered pricing agent suggests optimal buy and sell prices."},
          {icon:"people",color:"#8B5CF6",title:"Trusted Community",text:"Verified sellers, buyer protection, and secure escrow payments."},
        ].map(f=>(
          <View key={f.title} style={styles.feature}>
            <View style={[styles.fIcon,{backgroundColor:f.color+"15"}]}><Ionicons name={f.icon} size={20} color={f.color}/></View>
            <View style={{flex:1}}><Text style={styles.fTitle}>{f.title}</Text><Text style={styles.fText}>{f.text}</Text></View>
          </View>
        ))}
        <TouchableOpacity onPress={()=>Linking.openURL("https://zyphor.in")} style={styles.link}>
          <Ionicons name="globe-outline" size={16} color={T.primary}/><Text style={styles.linkText}>Visit zyphor.in</Text>
        </TouchableOpacity>
        <Text style={styles.copy}>© 2026 ZYPHOR. Made with ❤️ in India.</Text>
      </View>
    </ScrollView>
  );
}

const styles=StyleSheet.create({
  root:{flex:1,backgroundColor:T.bg.primary},
  header:{paddingTop:60,paddingBottom:32,alignItems:"center",gap:8},
  logo:{fontSize:32,fontWeight:"900",color:"#fff",letterSpacing:2},
  tagline:{fontSize:13,color:"rgba(255,255,255,0.5)",textAlign:"center"},
  version:{fontSize:11,color:"rgba(255,255,255,0.3)",marginTop:4},
  body:{padding:16},
  feature:{flexDirection:"row",gap:14,marginBottom:20,backgroundColor:T.bg.card,borderRadius:T.radius.lg,padding:16,borderWidth:1,borderColor:T.border.color},
  fIcon:{width:44,height:44,borderRadius:12,justifyContent:"center",alignItems:"center"},
  fTitle:{fontSize:15,fontWeight:"700",color:T.text.primary,marginBottom:4},
  fText:{fontSize:13,color:T.text.muted,lineHeight:20},
  link:{flexDirection:"row",alignItems:"center",gap:8,justifyContent:"center",padding:16},
  linkText:{fontSize:14,color:T.primary,fontWeight:"600"},
  copy:{textAlign:"center",fontSize:12,color:T.text.muted,paddingBottom:32},
});
