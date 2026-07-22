import React,{useState} from "react";
import {View,Text,StyleSheet,ScrollView,TouchableOpacity,Alert,KeyboardAvoidingView,Platform,Image,ActivityIndicator} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import T from "../../styles/theme";
import {Btn,Input} from "../../components/UI";
import {listingsAPI, aiAPI, uploadAPI} from "../../api/api";
import {useAuth} from "../../context/AuthContext";

const CONDITIONS=["Superb","Good","Fair"];
const TYPES=[{v:"device",l:"📱 Device"},{v:"part",l:"🔧 Part"}];
const STORAGE=["32GB","64GB","128GB","256GB","512GB","1TB"];
const RAM=["2GB","3GB","4GB","6GB","8GB","12GB","16GB"];
// Must match the category chips on PartsScreen so listings actually show up
// when a buyer filters by category there.
const PART_CATEGORIES=["Screen","Battery","Charger","Camera","Speaker","Back Glass","Motherboard"];

export default function SellScreen({navigation}){
  const {user}=useAuth();
  const [type,setType]=useState("device");
  const [partCategory,setPartCategory]=useState(PART_CATEGORIES[0]);
  const [form,setForm]=useState({brand:"",model:"",price:"",storage:"128GB",ram:"8GB",conditionGrade:"Good",city:user?.city||"",description:"",imei:""});
  const [images,setImages]=useState([]);
  const [loading,setLoading]=useState(false);
  const [aiLoadingPrice,setAiLoadingPrice]=useState(false);
  const [aiLoadingImei,setAiLoadingImei]=useState(false);
  const [aiPriceHint,setAiPriceHint]=useState(null);
  const [imeiVerification,setImeiVerification]=useState(null);
  const [uploadingImages,setUploadingImages]=useState(false);
  const set=k=>v=>setForm(f=>({...f,[k]:v}));

  const pickImage=async()=>{
    const {status}=await ImagePicker.requestMediaLibraryPermissionsAsync();
    if(status!=="granted"){Alert.alert("Permission needed","Allow access to photos");return;}
    const result=await ImagePicker.launchImageLibraryAsync({mediaTypes:ImagePicker.MediaTypeOptions.Images,allowsMultipleSelection:true,quality:0.8,selectionLimit:5-images.length,aspect:[4,3]});
    if(result.canceled||!result.assets?.length) return;

    setUploadingImages(true);
    try{
      const uploaded=[];
      for(const asset of result.assets.slice(0,5-images.length)){
        const formData=new FormData();
        const uriParts=asset.uri.split(".");
        const ext=uriParts[uriParts.length-1] || "jpg";
        formData.append("file",{ uri:asset.uri, name:`photo_${Date.now()}.${ext}`, type:`image/${ext==="jpg"?"jpeg":ext}` });
        const res=await uploadAPI.uploadImage(formData);
        if(res.data?.url) uploaded.push(res.data.url);
      }
      if(uploaded.length) setImages(prev=>[...prev,...uploaded].slice(0,5));
      if(uploaded.length<result.assets.length) Alert.alert("Partial upload","Some images could not be uploaded. Please try again.");
    }catch(e){
      Alert.alert("Upload failed",e.response?.data?.error||"Could not upload images. Check your connection and try again.");
    }finally{
      setUploadingImages(false);
    }
  };

  const handleSubmit=async()=>{
    if(!form.brand||!form.model||!form.price){Alert.alert("Missing info","Fill brand, model and price");return;}
    if(isNaN(Number(form.price))||Number(form.price)<100){Alert.alert("Invalid price","Enter a valid price");return;}
    setLoading(true);
    try{
      await listingsAPI.create({...form,listingType:type,price:Number(form.price),images,city:form.city||user?.city,tags:type==="part"?[partCategory]:[]});
      Alert.alert("🎉 Listed!","Your listing is live.",[{text:"OK",onPress:()=>navigation.navigate("MyListings")}]);
    }catch(e){
      const msg=e.response?.data?.error||"Failed to create listing";
      if(e.response?.data?.needsSubscription) navigation.navigate("Subscription");
      else Alert.alert("Error",msg);
    }finally{setLoading(false);}
  };

  const getAiPrice = async () => {
    if(!form.brand||!form.model){Alert.alert("Missing info","Enter brand and model first");return;}
    setAiLoadingPrice(true);
    try {
      const res = await aiAPI.pricing({brand:form.brand,model:form.model,storage:form.storage,ram:form.ram,condition:form.conditionGrade,city:form.city});
      setAiPriceHint(res.data);
    } catch (e) {
      Alert.alert("Error","Could not fetch AI price suggestion");
    } finally {
      setAiLoadingPrice(false);
    }
  };

  const verifyImei = async () => {
    if(!form.imei||form.imei.length<15){Alert.alert("Invalid","Enter a 15 digit IMEI");return;}
    setAiLoadingImei(true);
    try {
      const res = await aiAPI.verifyImei({imei:form.imei});
      setImeiVerification(res.data);
    } catch (e) {
      Alert.alert("Error","Could not verify IMEI");
    } finally {
      setAiLoadingImei(false);
    }
  };

  return(
    <KeyboardAvoidingView behavior={Platform.OS==="ios"?"padding":"height"} style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Listing</Text>
          <Text style={styles.sub}>List your device or part for sale</Text>
        </View>

        <View style={styles.body}>
          {/* Type toggle */}
          <View style={styles.typeRow}>
            {TYPES.map(t=>(
              <TouchableOpacity key={t.v} onPress={()=>setType(t.v)} style={[styles.typeBtn,type===t.v&&styles.typeBtnActive]}>
                <Text style={[styles.typeBtnText,type===t.v&&styles.typeBtnTextActive]}>{t.l}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Images */}
          <View style={styles.imgSection}>
            <Text style={styles.sectionLabel}>Photos (max 5)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {images.map((img,i)=>(
                <View key={i} style={styles.imgThumb}>
                  <Image source={{uri:img}} style={styles.imgThumbImg}/>
                  <TouchableOpacity style={styles.imgRemove} onPress={()=>setImages(prev=>prev.filter((_,j)=>j!==i))}>
                    <Ionicons name="close-circle" size={18} color={T.red}/>
                  </TouchableOpacity>
                </View>
              ))}
              {images.length<5&&(
                <TouchableOpacity style={styles.addImg} onPress={pickImage} disabled={uploadingImages}>
                  {uploadingImages?(
                    <ActivityIndicator size="small" color={T.primary}/>
                  ):(
                    <Ionicons name="camera-outline" size={28} color={T.text.muted}/>
                  )}
                  <Text style={styles.addImgText}>{uploadingImages?"Uploading…":"Add Photo"}</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>

          {/* Fields */}
          <Input label="Brand *" placeholder="Apple / Samsung / OnePlus" value={form.brand} onChangeText={set("brand")} icon="business-outline"/>
          <Input label="Model *" placeholder="iPhone 14 / Galaxy S23" value={form.model} onChangeText={set("model")} icon="phone-portrait-outline"/>
          
          <View style={{flexDirection:"row",alignItems:"flex-end",gap:10}}>
            <View style={{flex:1}}>
              <Input label="Price (₹) *" placeholder="25000" value={form.price} onChangeText={set("price")} keyboardType="numeric" icon="pricetag-outline"/>
            </View>
            <TouchableOpacity onPress={getAiPrice} style={[styles.aiBtn, {marginBottom: 16}]} disabled={aiLoadingPrice}>
              <Ionicons name="sparkles" size={16} color={T.primary} />
              <Text style={styles.aiBtnText}>{aiLoadingPrice?"Wait..":"AI Price"}</Text>
            </TouchableOpacity>
          </View>
          {aiPriceHint && (
            <View style={styles.aiHintBox}>
              <Text style={styles.aiHintText}><Text style={{fontWeight:"bold"}}>AI Suggests:</Text> ₹{aiPriceHint.recommendedPrice.toLocaleString()}</Text>
              <Text style={styles.aiHintSub}>Min: ₹{aiPriceHint.minPrice.toLocaleString()} - Max: ₹{aiPriceHint.maxPrice.toLocaleString()}</Text>
              <TouchableOpacity onPress={()=>set("price")(String(aiPriceHint.recommendedPrice))} style={{marginTop:4}}><Text style={{color:T.primary,fontSize:12,fontWeight:"bold"}}>Use this price</Text></TouchableOpacity>
            </View>
          )}

          {type==="device"&&(
            <>
              <Text style={styles.sectionLabel}>Storage</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom:12}}>
                {STORAGE.map(s=>(
                  <TouchableOpacity key={s} onPress={()=>set("storage")(s)} style={[styles.chip,form.storage===s&&styles.chipActive]}>
                    <Text style={[styles.chipText,form.storage===s&&styles.chipTextActive]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.sectionLabel}>RAM</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom:12}}>
                {RAM.map(r=>(
                  <TouchableOpacity key={r} onPress={()=>set("ram")(r)} style={[styles.chip,form.ram===r&&styles.chipActive]}>
                    <Text style={[styles.chipText,form.ram===r&&styles.chipTextActive]}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={{flexDirection:"row",alignItems:"flex-end",gap:10}}>
                <View style={{flex:1}}>
                  <Input label="IMEI (optional)" placeholder="15-digit IMEI number" value={form.imei} onChangeText={v=>set("imei")(v.replace(/\D/g,"").slice(0,15))} keyboardType="numeric" icon="scan-outline"/>
                </View>
                <TouchableOpacity onPress={verifyImei} style={[styles.aiBtn, {marginBottom: 16}]} disabled={aiLoadingImei||form.imei.length<15}>
                  <Ionicons name="shield-checkmark" size={16} color={T.green} />
                  <Text style={[styles.aiBtnText,{color:T.green}]}>{aiLoadingImei?"Wait..":"AI Verify"}</Text>
                </TouchableOpacity>
              </View>
              {imeiVerification && (
                <View style={[styles.aiHintBox, {backgroundColor: imeiVerification.valid ? T.green+"10" : T.red+"10", borderColor: imeiVerification.valid ? T.green+"30" : T.red+"30"}]}>
                  <Text style={[styles.aiHintText, {color: imeiVerification.valid ? T.green : T.red}]}>{imeiVerification.message}</Text>
                  {imeiVerification.ceirStatus && <Text style={styles.aiHintSub}>CEIR: {imeiVerification.ceirStatus}</Text>}
                </View>
              )}
            </>
          )}

          {type==="part"&&(
            <>
              <Text style={styles.sectionLabel}>Part Category *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom:16}}>
                {PART_CATEGORIES.map(c=>(
                  <TouchableOpacity key={c} onPress={()=>setPartCategory(c)} style={[styles.chip,partCategory===c&&styles.chipActive]}>
                    <Text style={[styles.chipText,partCategory===c&&styles.chipTextActive]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}

          <Text style={styles.sectionLabel}>Condition</Text>
          <View style={styles.condRow}>
            {CONDITIONS.map(c=>(
              <TouchableOpacity key={c} onPress={()=>set("conditionGrade")(c)} style={[styles.condBtn,form.conditionGrade===c&&styles.condBtnActive]}>
                <Text style={[styles.condBtnText,form.conditionGrade===c&&styles.condBtnTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input label="City" placeholder="Mumbai" value={form.city} onChangeText={set("city")} icon="location-outline"/>
          <Input label="Description" placeholder="Describe condition, accessories included…" value={form.description} onChangeText={set("description")} multiline numberOfLines={3}/>

          {/* Fee preview */}
          {form.price&&!isNaN(Number(form.price))&&Number(form.price)>0&&(
            <View style={styles.feeCard}>
              <Text style={styles.feeTitle}>💰 You will receive</Text>
              {(()=>{const p=Number(form.price);const f=Math.round(p*0.03);const g=Math.round(f*0.18);return(<>
                <View style={styles.feeRow}><Text style={styles.feeKey}>Listing Price</Text><Text style={styles.feeVal}>₹{p.toLocaleString()}</Text></View>
                <View style={styles.feeRow}><Text style={styles.feeKey}>Platform Fee (3%)</Text><Text style={[styles.feeVal,{color:T.text.muted}]}>-₹{f.toLocaleString()}</Text></View>
                <View style={styles.feeRow}><Text style={styles.feeKey}>GST on Fee (18%)</Text><Text style={[styles.feeVal,{color:T.text.muted}]}>-₹{g.toLocaleString()}</Text></View>
                <View style={[styles.feeRow,{borderTopWidth:1,borderTopColor:T.border.color,marginTop:8,paddingTop:8}]}><Text style={[styles.feeKey,{fontWeight:"700",color:T.text.primary}]}>You Receive</Text><Text style={[styles.feeVal,{color:T.green,fontWeight:"800",fontSize:16}]}>₹{(p-f-g).toLocaleString()}</Text></View>
              </>)})()} 
            </View>
          )}

          <Btn title={loading?"Creating listing…":"List for Sale"} onPress={handleSubmit} loading={loading} disabled={uploadingImages} icon="arrow-up-circle" style={{marginTop:8,marginBottom:32}}/>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles=StyleSheet.create({
  root:{flex:1,backgroundColor:T.bg.primary},
  header:{padding:20,paddingTop:24,backgroundColor:T.bg.secondary,borderBottomWidth:1,borderBottomColor:T.border.color},
  title:{fontSize:24,fontWeight:"800",color:T.text.primary},
  sub:{fontSize:13,color:T.text.muted,marginTop:4},
  body:{padding:16},
  typeRow:{flexDirection:"row",gap:10,marginBottom:20},
  typeBtn:{flex:1,paddingVertical:12,borderRadius:T.radius.md,backgroundColor:T.bg.card,alignItems:"center",borderWidth:1,borderColor:T.border.color},
  typeBtnActive:{backgroundColor:T.primary+"20",borderColor:T.primary},
  typeBtnText:{fontSize:14,fontWeight:"700",color:T.text.secondary},
  typeBtnTextActive:{color:T.primary},
  imgSection:{marginBottom:16},
  sectionLabel:{fontSize:13,fontWeight:"600",color:T.text.secondary,marginBottom:8},
  imgThumb:{width:88,height:88,borderRadius:T.radius.md,marginRight:10,position:"relative"},
  imgThumbImg:{width:"100%",height:"100%",borderRadius:T.radius.md},
  imgRemove:{position:"absolute",top:-6,right:-6},
  addImg:{width:88,height:88,borderRadius:T.radius.md,backgroundColor:T.bg.card,borderWidth:1,borderColor:T.border.color,borderStyle:"dashed",justifyContent:"center",alignItems:"center"},
  addImgText:{fontSize:10,color:T.text.muted,marginTop:4},
  chip:{paddingHorizontal:14,paddingVertical:8,borderRadius:T.radius.full,backgroundColor:T.bg.card,marginRight:8,borderWidth:1,borderColor:T.border.color},
  chipActive:{backgroundColor:T.primary,borderColor:T.primary},
  chipText:{fontSize:12,color:T.text.secondary,fontWeight:"600"},
  chipTextActive:{color:"#fff"},
  condRow:{flexDirection:"row",gap:10,marginBottom:16},
  condBtn:{flex:1,paddingVertical:12,borderRadius:T.radius.md,backgroundColor:T.bg.card,alignItems:"center",borderWidth:1,borderColor:T.border.color},
  condBtnActive:{backgroundColor:T.green+"20",borderColor:T.green},
  condBtnText:{fontSize:13,fontWeight:"700",color:T.text.muted},
  condBtnTextActive:{color:T.green},
  feeCard:{backgroundColor:T.bg.card,borderRadius:T.radius.lg,padding:16,marginVertical:12,borderWidth:1,borderColor:T.border.color},
  feeTitle:{fontSize:13,fontWeight:"700",color:T.text.primary,marginBottom:10},
  feeRow:{flexDirection:"row",justifyContent:"space-between",paddingVertical:5},
  feeKey:{fontSize:12,color:T.text.muted},
  feeVal:{fontSize:13,fontWeight:"600",color:T.text.primary},
  aiBtn:{flexDirection:"row",alignItems:"center",gap:4,backgroundColor:T.primary+"10",paddingHorizontal:12,paddingVertical:12,borderRadius:T.radius.md,borderWidth:1,borderColor:T.primary+"30"},
  aiBtnText:{fontSize:13,fontWeight:"600",color:T.primary},
  aiHintBox:{backgroundColor:T.primary+"10",padding:10,borderRadius:T.radius.md,borderWidth:1,borderColor:T.primary+"30",marginBottom:16,marginTop:-8},
  aiHintText:{fontSize:13,color:T.text.primary},
  aiHintSub:{fontSize:11,color:T.text.muted,marginTop:2},
});
