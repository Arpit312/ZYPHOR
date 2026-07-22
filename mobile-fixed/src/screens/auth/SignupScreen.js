import React,{useState} from "react";
import {View,Text,TouchableOpacity,StyleSheet,ScrollView,KeyboardAvoidingView,Platform} from "react-native";
import {LinearGradient} from "expo-linear-gradient";
import {Ionicons} from "@expo/vector-icons";
import T from "../../styles/theme";
import {Btn,Input} from "../../components/UI";
import {useAuth} from "../../context/AuthContext";

const ROLES=[
  {value:"customer",label:"Customer",icon:"person-outline",desc:"Buy & sell freely",color:T.green,free:true},
  {value:"retailer",label:"Retailer",icon:"storefront-outline",desc:"List multiple devices",color:T.primary,free:false},
  {value:"wholesaler",label:"Wholesaler",icon:"cube-outline",desc:"Bulk listings",color:T.amber,free:false},
  {value:"technician",label:"Technician",icon:"construct-outline",desc:"Parts & repair services",color:"#8B5CF6",free:false},
];

export default function SignupScreen({navigation}){
  const [step,setStep]=useState(0);
  const [role,setRole]=useState("customer");
  const [form,setForm]=useState({name:"",email:"",password:"",city:"",businessName:"",gstNumber:""});
  const [showPwd,setShowPwd]=useState(false);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const {signup}=useAuth();
  const set=(k)=>(v)=>setForm(f=>({...f,[k]:v}));

  const handleSignup=async()=>{
    if(!form.name||!form.email||!form.password){setError("Fill all required fields");return;}
    if(form.password.length<8){setError("Password must be 8+ characters");return;}
    setLoading(true);setError("");
    const r=await signup({...form,role});
    setLoading(false);
    if(!r.success){setError(r.message);return;}
    // No manual navigation here — once signup() sets the user, RootNavigator
    // swaps AuthStack → TabNavigator, and if this account needs a subscription
    // it auto-redirects to the Subscription screen (see App.js).
  };

  return(
    <KeyboardAvoidingView behavior={Platform.OS==="ios"?"padding":"height"} style={styles.root}>
      <ScrollView contentContainerStyle={{flexGrow:1}} bounces={false}>
        <LinearGradient colors={["#0B1220","#16233D"]} style={styles.hero}>
          <TouchableOpacity onPress={()=>navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#fff"/>
          </TouchableOpacity>
          <Text style={styles.logo}>Create Account</Text>
          <Text style={styles.tagline}>Join ZYPHOR — India's verified phone marketplace</Text>
          <View style={styles.steps}>
            {["Role","Details"].map((s,i)=>(
              <View key={s} style={styles.step}>
                <View style={[styles.stepDot,step>=i&&{backgroundColor:T.primary}]}>
                  <Text style={[styles.stepNum,step>=i&&{color:"#fff"}]}>{i+1}</Text>
                </View>
                <Text style={[styles.stepLabel,step>=i&&{color:T.text.primary}]}>{s}</Text>
              </View>
            ))}
            <View style={styles.stepLine}/>
          </View>
        </LinearGradient>

        <View style={styles.form}>
          {step===0?(
            <>
              <Text style={styles.heading}>Choose your role</Text>
              <Text style={styles.sub}>Customers browse free. Sellers need a subscription.</Text>
              <View style={styles.roleGrid}>
                {ROLES.map(r=>(
                  <TouchableOpacity key={r.value} style={[styles.roleCard,role===r.value&&{borderColor:r.color,borderWidth:2,backgroundColor:r.color+"10"}]} onPress={()=>setRole(r.value)}>
                    <View style={[styles.roleIcon,{backgroundColor:r.color+"15"}]}><Ionicons name={r.icon} size={22} color={r.color}/></View>
                    <Text style={[styles.roleLabel,role===r.value&&{color:r.color}]}>{r.label}</Text>
                    <Text style={styles.roleDesc}>{r.desc}</Text>
                    <View style={[styles.freeTag,{backgroundColor:r.free?T.green+"20":T.amber+"20"}]}>
                      <Text style={[styles.freeTagText,{color:r.free?T.green:T.amber}]}>{r.free?"FREE":"PAID PLAN"}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
              <Btn title="Continue" onPress={()=>setStep(1)} icon="arrow-forward" style={{marginTop:8}}/>
            </>
          ):(
            <>
              <Text style={styles.heading}>Your details</Text>
              {error?<View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View>:null}
              <Input label="Full Name *" placeholder="Rahul Sharma" value={form.name} onChangeText={set("name")} icon="person-outline"/>
              <Input label="Email *" placeholder="you@example.com" value={form.email} onChangeText={set("email")} icon="mail-outline" keyboardType="email-address" autoCapitalize="none"/>
              <Input label="Password *" placeholder="Min. 8 characters" value={form.password} onChangeText={set("password")} icon="lock-closed-outline" secureTextEntry={!showPwd}
                right={<TouchableOpacity onPress={()=>setShowPwd(v=>!v)}><Ionicons name={showPwd?"eye-off-outline":"eye-outline"} size={18} color={T.text.muted}/></TouchableOpacity>}/>
              <Input label="City" placeholder="Mumbai" value={form.city} onChangeText={set("city")} icon="location-outline"/>
              {role!=="customer"&&<Input label="Business Name" placeholder="Your shop name" value={form.businessName} onChangeText={set("businessName")} icon="storefront-outline"/>}
              {(role==="retailer"||role==="wholesaler")&&<Input label="GST Number (optional)" placeholder="22AAAAA0000A1Z5" value={form.gstNumber} onChangeText={set("gstNumber")} icon="document-text-outline"/>}

              <Btn title="Create Account" onPress={handleSignup} loading={loading} icon="checkmark" style={{marginTop:8}}/>
              <TouchableOpacity style={{alignItems:"center",marginTop:12}} onPress={()=>setStep(0)}>
                <Text style={{fontSize:13,color:T.text.muted}}>← Change role</Text>
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity style={{alignItems:"center",paddingTop:16}} onPress={()=>navigation.navigate("Login")}>
            <Text style={styles.loginText}>Already have account? <Text style={{color:T.primary,fontWeight:"700"}}>Sign in</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles=StyleSheet.create({
  root:{flex:1,backgroundColor:T.bg.primary},
  hero:{paddingTop:56,paddingBottom:32,paddingHorizontal:24},
  backBtn:{marginBottom:16,width:36,height:36,borderRadius:18,backgroundColor:"rgba(255,255,255,0.1)",justifyContent:"center",alignItems:"center"},
  logo:{fontSize:24,fontWeight:"900",color:"#fff",marginBottom:4},
  tagline:{fontSize:13,color:"rgba(255,255,255,0.5)",marginBottom:20},
  steps:{flexDirection:"row",alignItems:"center",gap:8,position:"relative"},
  step:{alignItems:"center",gap:4,flex:1},
  stepDot:{width:28,height:28,borderRadius:14,backgroundColor:T.border.color,justifyContent:"center",alignItems:"center",borderWidth:1,borderColor:T.border.color},
  stepNum:{fontSize:12,fontWeight:"700",color:T.text.muted},
  stepLabel:{fontSize:11,color:T.text.muted,fontWeight:"600"},
  stepLine:{position:"absolute",top:13,left:"25%",right:"25%",height:1,backgroundColor:T.border.color,zIndex:-1},
  form:{flex:1,backgroundColor:T.bg.primary,padding:24,paddingTop:28},
  heading:{fontSize:22,fontWeight:"700",color:T.text.primary,marginBottom:4},
  sub:{fontSize:13,color:T.text.muted,marginBottom:20},
  roleGrid:{flexDirection:"row",flexWrap:"wrap",gap:10,marginBottom:8},
  roleCard:{width:"47%",backgroundColor:T.bg.card,borderRadius:T.radius.lg,padding:14,borderWidth:1,borderColor:T.border.color},
  roleIcon:{width:40,height:40,borderRadius:10,justifyContent:"center",alignItems:"center",marginBottom:8},
  roleLabel:{fontSize:14,fontWeight:"700",color:T.text.primary,marginBottom:2},
  roleDesc:{fontSize:11,color:T.text.muted,marginBottom:6},
  freeTag:{paddingHorizontal:7,paddingVertical:2,borderRadius:T.radius.full,alignSelf:"flex-start"},
  freeTagText:{fontSize:9,fontWeight:"800"},
  errorBox:{backgroundColor:T.red+"15",borderRadius:10,padding:12,marginBottom:12,borderWidth:1,borderColor:T.red+"30"},
  errorText:{fontSize:13,color:T.red},
  loginText:{fontSize:13,color:T.text.secondary},
});
