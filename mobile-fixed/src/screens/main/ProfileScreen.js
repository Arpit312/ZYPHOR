import React,{useState} from "react";
import {View,Text,StyleSheet,ScrollView,Alert,KeyboardAvoidingView,Platform} from "react-native";
import T from "../../styles/theme";
import {Btn,Input} from "../../components/UI";
import {authAPI} from "../../api/api";
import {useAuth} from "../../context/AuthContext";

export default function ProfileScreen({navigation}){
  const {user,updateUser}=useAuth();
  const [form,setForm]=useState({name:user?.name||"",city:user?.city||"",phone:user?.phone||"",businessName:user?.businessName||"",gstNumber:user?.gstNumber||""});
  const [loading,setLoading]=useState(false);
  const set=k=>v=>setForm(f=>({...f,[k]:v}));
  const isSeller=["retailer","wholesaler","technician"].includes(user?.role);

  const save=async()=>{
    if(!form.name.trim()){Alert.alert("Error","Name is required");return;}
    setLoading(true);
    try{
      const r=await authAPI.updateProfile(form);
      updateUser(r.data.user);
      Alert.alert("✅ Updated","Profile saved!",[{text:"OK",onPress:()=>navigation.goBack()}]);
    }catch(e){Alert.alert("Error",e.response?.data?.error||"Update failed");}
    finally{setLoading(false);}
  };

  return(
    <KeyboardAvoidingView behavior={Platform.OS==="ios"?"padding":"height"} style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase()||"U"}</Text></View>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.roleBadge}><Text style={styles.roleText}>{user?.role?.toUpperCase()}</Text></View>
        </View>

        <View style={styles.body}>
          <Input label="Full Name *" placeholder="Rahul Sharma" value={form.name} onChangeText={set("name")} icon="person-outline"/>
          <Input label="City" placeholder="Mumbai" value={form.city} onChangeText={set("city")} icon="location-outline"/>
          <Input label="Phone Number" placeholder="9876543210" value={form.phone} onChangeText={set("phone")} keyboardType="phone-pad" icon="call-outline"/>
          {isSeller&&<Input label="Business Name" placeholder="Your shop name" value={form.businessName} onChangeText={set("businessName")} icon="storefront-outline"/>}
          {(user?.role==="retailer"||user?.role==="wholesaler")&&<Input label="GST Number" placeholder="22AAAAA0000A1Z5" value={form.gstNumber} onChangeText={set("gstNumber")} icon="document-text-outline"/>}

          <Btn title={loading?"Saving…":"Save Changes"} onPress={save} loading={loading} icon="checkmark" style={{marginTop:8}}/>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles=StyleSheet.create({
  root:{flex:1,backgroundColor:T.bg.primary},
  header:{alignItems:"center",paddingTop:32,paddingBottom:24,backgroundColor:T.bg.secondary,borderBottomWidth:1,borderBottomColor:T.border.color,gap:8},
  avatar:{width:72,height:72,borderRadius:36,backgroundColor:T.primary,justifyContent:"center",alignItems:"center"},
  avatarText:{fontSize:30,fontWeight:"800",color:"#fff"},
  email:{fontSize:13,color:T.text.muted},
  roleBadge:{backgroundColor:T.primary+"20",paddingHorizontal:12,paddingVertical:4,borderRadius:T.radius.full},
  roleText:{fontSize:11,fontWeight:"800",color:T.primary},
  body:{padding:16},
});
