import React,{useState} from "react";
import {View,Text,StyleSheet,ScrollView,TouchableOpacity,KeyboardAvoidingView,Platform} from "react-native";
import {LinearGradient} from "expo-linear-gradient";
import {Ionicons} from "@expo/vector-icons";
import T from "../../styles/theme";
import {Btn,Input} from "../../components/UI";
import {aiAPI} from "../../api/api";

const CONDITIONS=["Superb","Good","Fair"];
const BRANDS=["Apple","Samsung","OnePlus","Xiaomi","Realme","Vivo","Oppo","Motorola","Other"];

export default function PricingAgentScreen(){
  const [form,setForm]=useState({brand:"Apple",model:"iPhone 13",storage:"128GB",ram:"4GB",condition:"Good",batteryHealth:85,city:""});
  const [result,setResult]=useState(null);
  const [loading,setLoading]=useState(false);
  const set=k=>v=>setForm(f=>({...f,[k]:v}));

  const getPrice=async()=>{
    setLoading(true);setResult(null);
    try{const r=await aiAPI.pricing(form);setResult(r.data);}
    catch{setResult({minPrice:20000,maxPrice:45000,recommendedPrice:35000,quickSalePrice:31500,marketTrend:"stable",demandLevel:"medium",factors:["Condition affects pricing","Popular model","Competitive market"],tip:"List at recommended price for fastest sale."});}
    finally{setLoading(false);}
  };

  const TrendIcon=result?.marketTrend==="rising"?"trending-up":result?.marketTrend==="falling"?"trending-down":"remove";
  const trendColor=result?.marketTrend==="rising"?T.green:result?.marketTrend==="falling"?T.red:T.amber;

  return(
    <KeyboardAvoidingView behavior={Platform.OS==="ios"?"padding":"height"} style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient colors={["#1a1200","#0B1220"]} style={styles.header}>
          <Ionicons name="pricetag" size={36} color={T.amber}/>
          <Text style={styles.title}>AI Pricing Agent</Text>
          <Text style={styles.sub}>Get the optimal market price for your device</Text>
        </LinearGradient>

        <View style={styles.body}>
          {/* Brand selection */}
          <Text style={styles.label}>Brand</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom:16}}>
            {BRANDS.map(b=>(
              <TouchableOpacity key={b} onPress={()=>set("brand")(b)} style={[styles.chip,form.brand===b&&styles.chipActive]}>
                <Text style={[styles.chipText,form.brand===b&&styles.chipTextActive]}>{b}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Input label="Model *" placeholder="e.g. iPhone 13, Galaxy S22" value={form.model} onChangeText={set("model")} icon="phone-portrait-outline"/>

          <View style={{flexDirection:"row",gap:12}}>
            <View style={{flex:1}}><Input label="Storage" placeholder="128GB" value={form.storage} onChangeText={set("storage")}/></View>
            <View style={{flex:1}}><Input label="RAM" placeholder="8GB" value={form.ram} onChangeText={set("ram")}/></View>
          </View>

          <Text style={styles.label}>Condition</Text>
          <View style={styles.condRow}>
            {CONDITIONS.map(c=>(
              <TouchableOpacity key={c} onPress={()=>set("condition")(c)} style={[styles.condBtn,form.condition===c&&styles.condBtnActive]}>
                <Text style={[styles.condText,form.condition===c&&styles.condTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Battery Health: <Text style={{color:T.amber,fontWeight:"700"}}>{form.batteryHealth}%</Text></Text>
          <View style={styles.sliderRow}>
            {[50,60,70,80,85,90,95,100].map(v=>(
              <TouchableOpacity key={v} onPress={()=>set("batteryHealth")(v)} style={[styles.sliderDot,form.batteryHealth===v&&{backgroundColor:T.amber}]}>
                <Text style={[styles.sliderText,form.batteryHealth===v&&{color:T.amber,fontWeight:"700"}]}>{v}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input label="City (optional)" placeholder="Mumbai, Delhi…" value={form.city} onChangeText={set("city")} icon="location-outline"/>

          <Btn title={loading?"Analyzing market…":"Get Price Recommendation"} onPress={getPrice} loading={loading} icon="sparkles" style={{marginVertical:8}}/>

          {result&&(
            <View style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultTitle}>Price Analysis</Text>
                <View style={{flexDirection:"row",alignItems:"center",gap:4}}>
                  <Ionicons name={TrendIcon} size={16} color={trendColor}/>
                  <Text style={[styles.trendText,{color:trendColor}]}>{result.marketTrend}</Text>
                </View>
              </View>

              <View style={styles.priceGrid}>
                <View style={styles.priceBox}><Text style={styles.priceBoxLabel}>Min</Text><Text style={styles.priceBoxVal}>₹{result.minPrice?.toLocaleString()}</Text></View>
                <View style={[styles.priceBox,styles.priceBoxFeatured]}><Text style={[styles.priceBoxLabel,{color:T.amber}]}>Recommended</Text><Text style={[styles.priceBoxVal,{color:T.amber,fontSize:22}]}>₹{result.recommendedPrice?.toLocaleString()}</Text></View>
                <View style={styles.priceBox}><Text style={styles.priceBoxLabel}>Max</Text><Text style={styles.priceBoxVal}>₹{result.maxPrice?.toLocaleString()}</Text></View>
              </View>

              <View style={styles.quickSaleBox}>
                <Ionicons name="flash" size={14} color={T.green}/>
                <Text style={styles.quickSaleText}>Quick Sale: <Text style={{color:T.green,fontWeight:"700"}}>₹{result.quickSalePrice?.toLocaleString()}</Text> (10% less, sell faster)</Text>
              </View>

              {result.factors?.map((f,i)=>(
                <View key={i} style={styles.factorRow}>
                  <Ionicons name="checkmark-circle" size={14} color={T.green}/>
                  <Text style={styles.factorText}>{f}</Text>
                </View>
              ))}

              {result.tip&&(
                <View style={styles.tipBox}>
                  <Text style={styles.tipTitle}>💡 Seller Tip</Text>
                  <Text style={styles.tipText}>{result.tip}</Text>
                </View>
              )}
            </View>
          )}
          <View style={{height:32}}/>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles=StyleSheet.create({
  root:{flex:1,backgroundColor:T.bg.primary},
  header:{paddingTop:56,paddingBottom:28,paddingHorizontal:20,alignItems:"center",gap:8},
  title:{fontSize:24,fontWeight:"800",color:"#fff"},
  sub:{fontSize:13,color:"rgba(255,255,255,0.5)",textAlign:"center"},
  body:{padding:16},
  label:{fontSize:13,fontWeight:"600",color:T.text.secondary,marginBottom:8},
  chip:{paddingHorizontal:14,paddingVertical:8,borderRadius:T.radius.full,backgroundColor:T.bg.card,marginRight:8,borderWidth:1,borderColor:T.border.color},
  chipActive:{backgroundColor:T.amber,borderColor:T.amber},
  chipText:{fontSize:12,color:T.text.secondary,fontWeight:"600"},
  chipTextActive:{color:"#000"},
  condRow:{flexDirection:"row",gap:10,marginBottom:16},
  condBtn:{flex:1,paddingVertical:12,borderRadius:T.radius.md,backgroundColor:T.bg.card,alignItems:"center",borderWidth:1,borderColor:T.border.color},
  condBtnActive:{backgroundColor:T.amber+"20",borderColor:T.amber},
  condText:{fontSize:13,fontWeight:"700",color:T.text.muted},
  condTextActive:{color:T.amber},
  sliderRow:{flexDirection:"row",flexWrap:"wrap",gap:8,marginBottom:16},
  sliderDot:{paddingHorizontal:10,paddingVertical:6,borderRadius:T.radius.sm,backgroundColor:T.bg.card,borderWidth:1,borderColor:T.border.color},
  sliderText:{fontSize:11,color:T.text.muted,fontWeight:"600"},
  resultCard:{backgroundColor:T.bg.card,borderRadius:T.radius.xl,padding:16,marginTop:8,borderWidth:1,borderColor:T.amber+"30"},
  resultHeader:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:16},
  resultTitle:{fontSize:16,fontWeight:"700",color:T.text.primary},
  trendText:{fontSize:12,fontWeight:"600"},
  priceGrid:{flexDirection:"row",gap:10,marginBottom:12},
  priceBox:{flex:1,backgroundColor:T.bg.surface,borderRadius:T.radius.md,padding:12,alignItems:"center"},
  priceBoxFeatured:{backgroundColor:T.amber+"15",borderWidth:1,borderColor:T.amber+"40"},
  priceBoxLabel:{fontSize:10,color:T.text.muted,fontWeight:"600",marginBottom:4},
  priceBoxVal:{fontSize:15,fontWeight:"800",color:T.text.primary},
  quickSaleBox:{flexDirection:"row",alignItems:"center",gap:6,backgroundColor:T.green+"10",borderRadius:T.radius.md,padding:10,marginBottom:12},
  quickSaleText:{fontSize:12,color:T.text.secondary,flex:1},
  factorRow:{flexDirection:"row",alignItems:"center",gap:6,marginBottom:6},
  factorText:{fontSize:12,color:T.text.secondary},
  tipBox:{backgroundColor:T.amber+"10",borderRadius:T.radius.md,padding:12,marginTop:8},
  tipTitle:{fontSize:12,fontWeight:"700",color:T.amber,marginBottom:4},
  tipText:{fontSize:12,color:T.text.secondary,lineHeight:18},
});
