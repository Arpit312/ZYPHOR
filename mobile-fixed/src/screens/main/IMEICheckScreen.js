import React,{useState} from "react";
import {View,Text,StyleSheet,ScrollView,ActivityIndicator} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import T from "../../styles/theme";
import {Btn,Input} from "../../components/UI";
import {imeiAPI} from "../../api/api";

export default function IMEICheckScreen(){
  const [imei,setImei]=useState("");
  const [result,setResult]=useState(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");

  const check=async()=>{
    const clean=imei.replace(/\D/g,"");
    if(clean.length!==15){setError("IMEI must be exactly 15 digits");return;}
    setLoading(true);setError("");setResult(null);
    try{const r=await imeiAPI.check(clean);setResult(r.data);}
    catch(e){setError(e.response?.data?.error||"Check failed. Try again.");}
    finally{setLoading(false);}
  };

  const trustColor=result?.isValid?(result.trustScore>=80?T.green:result.trustScore>=50?T.amber:T.red):T.red;

  return(
    <ScrollView style={styles.root} contentContainerStyle={{flexGrow:1}}>
      <View style={styles.header}>
        <View style={styles.iconBox}><Ionicons name="scan" size={36} color={T.green}/></View>
        <Text style={styles.title}>IMEI Verification</Text>
        <Text style={styles.sub}>Check if a device is genuine, not blacklisted, and safe to buy</Text>
      </View>

      <View style={styles.body}>
        <Input label="Enter IMEI Number" placeholder="15-digit IMEI (e.g. 353937093209023)" value={imei} onChangeText={v=>setImei(v.replace(/\D/g,""))} keyboardType="numeric" maxLength={15} icon="barcode-outline"
          right={<Text style={{fontSize:11,color:imei.replace(/\D/g,"").length===15?T.green:T.text.muted}}>{imei.replace(/\D/g,"").length}/15</Text>}/>

        <Text style={styles.tip}>💡 Dial *#06# on the phone to get IMEI</Text>

        {error?<View style={styles.errBox}><Ionicons name="alert-circle" size={16} color={T.red}/><Text style={styles.errText}>{error}</Text></View>:null}

        <Btn title={loading?"Verifying…":"Check IMEI"} onPress={check} loading={loading} icon="shield-checkmark" style={{marginTop:4,marginBottom:16}} variant="green"/>

        {result&&(
          <View style={[styles.resultCard,{borderColor:result.isValid?T.green+"40":T.red+"40"}]}>
            <View style={styles.resultHeader}>
              <Ionicons name={result.isValid?"shield-checkmark":"close-circle"} size={36} color={result.isValid?T.green:T.red}/>
              <View style={{flex:1}}>
                <Text style={[styles.resultStatus,{color:result.isValid?T.green:T.red}]}>
                  {result.isValid?"✅ IMEI Valid":"❌ Invalid IMEI"}
                </Text>
                <Text style={styles.resultMsg}>{result.message}</Text>
              </View>
            </View>

            {result.isValid&&(
              <>
                <View style={styles.trustSection}>
                  <Text style={styles.trustLabel}>Trust Score</Text>
                  <View style={styles.trustBar}>
                    <View style={[styles.trustFill,{width:`${result.trustScore}%`,backgroundColor:trustColor}]}/>
                  </View>
                  <Text style={[styles.trustNum,{color:trustColor}]}>{result.trustScore}%</Text>
                </View>

                <View style={styles.detailGrid}>
                  {[{k:"IMEI",v:result.imei},{k:"TAC Code",v:result.tac},{k:"Blacklist",v:result.blacklistStatus},{k:"Status",v:result.isValid?"Clean":"Flagged"}].map(d=>(
                    <View key={d.k} style={styles.detailBox}>
                      <Text style={styles.detailKey}>{d.k}</Text>
                      <Text style={[styles.detailVal,d.v==="Clean"&&{color:T.green}]}>{d.v}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>
        )}

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>How it works</Text>
          {["IMEI validated using industry-standard Luhn algorithm","Checked against known blacklisted devices","TAC code used to identify device model","Trust score considers multiple safety factors"].map(i=>(
            <View key={i} style={{flexDirection:"row",gap:8,marginBottom:8}}>
              <Ionicons name="checkmark-circle" size={14} color={T.green} style={{marginTop:2}}/>
              <Text style={styles.infoText}>{i}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles=StyleSheet.create({
  root:{flex:1,backgroundColor:T.bg.primary},
  header:{padding:24,paddingTop:56,alignItems:"center",gap:12,backgroundColor:T.bg.secondary,borderBottomWidth:1,borderBottomColor:T.border.color},
  iconBox:{width:72,height:72,borderRadius:36,backgroundColor:T.green+"15",justifyContent:"center",alignItems:"center"},
  title:{fontSize:24,fontWeight:"800",color:T.text.primary},
  sub:{fontSize:13,color:T.text.muted,textAlign:"center",lineHeight:20},
  body:{padding:16},
  tip:{fontSize:12,color:T.text.muted,marginBottom:16,fontStyle:"italic"},
  errBox:{flexDirection:"row",alignItems:"center",gap:8,backgroundColor:T.red+"15",borderRadius:10,padding:12,marginBottom:8,borderWidth:1,borderColor:T.red+"30"},
  errText:{fontSize:13,color:T.red,flex:1},
  resultCard:{backgroundColor:T.bg.card,borderRadius:T.radius.xl,padding:16,marginBottom:16,borderWidth:1},
  resultHeader:{flexDirection:"row",alignItems:"center",gap:12,marginBottom:16},
  resultStatus:{fontSize:16,fontWeight:"800"},
  resultMsg:{fontSize:12,color:T.text.muted,marginTop:2},
  trustSection:{marginBottom:16},
  trustLabel:{fontSize:12,color:T.text.muted,marginBottom:8,fontWeight:"600"},
  trustBar:{height:8,backgroundColor:T.bg.surface,borderRadius:4,marginBottom:6},
  trustFill:{height:"100%",borderRadius:4},
  trustNum:{fontSize:14,fontWeight:"700"},
  detailGrid:{flexDirection:"row",flexWrap:"wrap",gap:10},
  detailBox:{width:"47%",backgroundColor:T.bg.surface,borderRadius:T.radius.md,padding:12},
  detailKey:{fontSize:10,color:T.text.muted,fontWeight:"600",marginBottom:4},
  detailVal:{fontSize:13,fontWeight:"700",color:T.text.primary},
  infoBox:{backgroundColor:T.bg.card,borderRadius:T.radius.lg,padding:16,marginTop:8,borderWidth:1,borderColor:T.border.color},
  infoTitle:{fontSize:14,fontWeight:"700",color:T.text.primary,marginBottom:12},
  infoText:{fontSize:12,color:T.text.muted,flex:1,lineHeight:18},
});
