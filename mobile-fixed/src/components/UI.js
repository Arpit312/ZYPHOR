import React from "react";
import { View,Text,TouchableOpacity,StyleSheet,ActivityIndicator,TextInput,Image,Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import T from "../styles/theme";

const W = Dimensions.get("window").width;

export const Btn = ({ title, onPress, loading, icon, variant="primary", style, disabled, small }) => {
  const colors = variant==="secondary" ? [T.bg.card,T.bg.surface] : variant==="danger" ? ["#E5484D","#CC2222"] : variant==="green" ? ["#1FAE6B","#158A52"] : [T.primary,T.primaryDark];
  const textColor = (variant==="secondary") ? T.text.secondary : "#fff";
  return (
    <LinearGradient colors={colors} style={[styles.btnGrad, style]} start={{x:0,y:0}} end={{x:1,y:0}}>
      <TouchableOpacity style={[styles.btnInner, small&&{paddingVertical:10}, (loading||disabled)&&{opacity:0.6}]} onPress={onPress} disabled={loading||disabled} activeOpacity={0.8}>
        {loading ? <ActivityIndicator color={textColor} size="small"/> : <>
          {icon && <Ionicons name={icon} size={small?15:18} color={textColor}/>}
          <Text style={[styles.btnText,{color:textColor},small&&{fontSize:13}]}>{title}</Text>
        </>}
      </TouchableOpacity>
    </LinearGradient>
  );
};

export const Input = ({ label, icon, error, right, ...props }) => {
  const [focus,setFocus] = React.useState(false);
  return (
    <View style={{marginBottom:12}}>
      {label&&<Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputBox, focus&&styles.inputFocus, error&&styles.inputError]}>
        {icon&&<Ionicons name={icon} size={18} color={focus?T.primary:T.text.muted} style={{marginRight:8}}/>}
        <TextInput style={styles.inputText} placeholderTextColor={T.text.muted} onFocus={()=>setFocus(true)} onBlur={()=>setFocus(false)} {...props}/>
        {right}
      </View>
      {error&&<Text style={styles.errText}>{error}</Text>}
    </View>
  );
};

export const Card = ({ children, style, onPress }) => {
  const content = <View style={[styles.card,style]}>{children}</View>;
  return onPress ? <TouchableOpacity onPress={onPress} activeOpacity={0.85}>{content}</TouchableOpacity> : content;
};

export const Badge = ({ label, color=T.primary, icon }) => (
  <View style={[styles.badge,{backgroundColor:color+"22"}]}>
    {icon&&<Ionicons name={icon} size={11} color={color}/>}
    <Text style={[styles.badgeText,{color}]}>{label}</Text>
  </View>
);

export const ListingCard = ({ item, onPress, wide }) => {
  const trust = item?.verification?.trustScore||0;
  const tColor = trust>=80?T.green:trust>=50?T.amber:T.red;
  return (
    <TouchableOpacity style={[styles.listCard, wide&&{width:"100%"}]} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.listImg}>
        {item?.images?.[0]
          ? <Image source={{uri:item.images[0]}} style={StyleSheet.absoluteFill} resizeMode="cover"/>
          : <View style={[StyleSheet.absoluteFill,styles.listImgPlaceholder]}><Ionicons name="phone-portrait-outline" size={30} color={T.text.muted}/></View>}
        <View style={styles.listCondBadge}><Text style={styles.listCondText}>{item?.conditionGrade}</Text></View>
        {item?.verification?.status==="verified"&&(
          <View style={styles.verifiedBadge}><Ionicons name="shield-checkmark" size={11} color="#fff"/><Text style={styles.verifiedText}>AI</Text></View>
        )}
      </View>
      <View style={styles.listInfo}>
        <Text style={styles.listTitle} numberOfLines={1}>{item?.brand} {item?.model}</Text>
        <Text style={styles.listSpec} numberOfLines={1}>{[item?.storage,item?.ram].filter(Boolean).join(" · ")||item?.category}</Text>
        <View style={styles.listBottom}>
          <Text style={styles.listPrice}>₹{Number(item?.price||0).toLocaleString()}</Text>
          <View style={[styles.trustPill,{backgroundColor:tColor+"20"}]}>
            <Ionicons name="shield-checkmark" size={10} color={tColor}/>
            <Text style={[styles.trustText,{color:tColor}]}>{trust}%</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const SecHeader = ({ title, sub, action, actionLabel }) => (
  <View style={styles.secHead}>
    <View><Text style={styles.secTitle}>{title}</Text>{sub&&<Text style={styles.secSub}>{sub}</Text>}</View>
    {action&&<TouchableOpacity onPress={action} style={{flexDirection:"row",alignItems:"center",gap:4}}><Text style={styles.secAction}>{actionLabel||"See all"}</Text><Ionicons name="chevron-forward" size={13} color={T.primary}/></TouchableOpacity>}
  </View>
);

export const Empty = ({ icon="search-outline", title, sub, action, actionLabel }) => (
  <View style={styles.empty}>
    <View style={styles.emptyIcon}><Ionicons name={icon} size={36} color={T.text.muted}/></View>
    <Text style={styles.emptyTitle}>{title}</Text>
    {sub&&<Text style={styles.emptySub}>{sub}</Text>}
    {action&&<Btn title={actionLabel||"Retry"} onPress={action} style={{marginTop:16,borderRadius:T.radius.lg}} small/>}
  </View>
);

export const StatCard = ({ icon, value, label, color=T.primary }) => (
  <View style={[styles.statCard,{borderTopColor:color}]}>
    <Ionicons name={icon} size={20} color={color}/>
    <Text style={[styles.statVal,{color}]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  btnGrad:{borderRadius:T.radius.lg,overflow:"hidden"},
  btnInner:{flexDirection:"row",alignItems:"center",justifyContent:"center",gap:8,paddingVertical:14,paddingHorizontal:20},
  btnText:{fontSize:T.fonts.base,fontWeight:"700"},
  label:{fontSize:T.fonts.sm,color:T.text.secondary,marginBottom:6,fontWeight:"500"},
  inputBox:{flexDirection:"row",alignItems:"center",backgroundColor:T.bg.input,borderRadius:T.radius.md,borderWidth:1,borderColor:T.border.color,paddingHorizontal:T.spacing.md,minHeight:52},
  inputFocus:{borderColor:T.border.active},
  inputError:{borderColor:T.red},
  inputText:{flex:1,fontSize:T.fonts.base,color:T.text.primary,paddingVertical:8},
  errText:{fontSize:T.fonts.xs,color:T.red,marginTop:4,marginLeft:4},
  card:{backgroundColor:T.bg.card,borderRadius:T.radius.lg,borderWidth:1,borderColor:T.border.color,overflow:"hidden"},
  badge:{flexDirection:"row",alignItems:"center",gap:4,paddingHorizontal:8,paddingVertical:3,borderRadius:T.radius.full},
  badgeText:{fontSize:10,fontWeight:"700"},
  listCard:{backgroundColor:T.bg.card,borderRadius:T.radius.lg,borderWidth:1,borderColor:T.border.color,overflow:"hidden",width:(W-48)/2,marginBottom:12,...T.shadow.sm},
  listImg:{height:150,position:"relative",backgroundColor:T.bg.surface},
  listImgPlaceholder:{justifyContent:"center",alignItems:"center"},
  listCondBadge:{position:"absolute",top:8,right:8,backgroundColor:"rgba(0,0,0,0.7)",borderRadius:T.radius.full,paddingHorizontal:7,paddingVertical:2},
  listCondText:{fontSize:9,color:"#fff",fontWeight:"700"},
  verifiedBadge:{position:"absolute",top:8,left:8,flexDirection:"row",alignItems:"center",gap:3,backgroundColor:"#1FAE6B",borderRadius:T.radius.full,paddingHorizontal:6,paddingVertical:2},
  verifiedText:{fontSize:9,color:"#fff",fontWeight:"700"},
  listInfo:{padding:10},
  listTitle:{fontSize:T.fonts.sm,fontWeight:"700",color:T.text.primary,marginBottom:2},
  listSpec:{fontSize:11,color:T.text.muted,marginBottom:6},
  listBottom:{flexDirection:"row",justifyContent:"space-between",alignItems:"center"},
  listPrice:{fontSize:T.fonts.md,fontWeight:"700",color:T.primary},
  trustPill:{flexDirection:"row",alignItems:"center",gap:2,paddingHorizontal:5,paddingVertical:2,borderRadius:T.radius.full},
  trustText:{fontSize:9,fontWeight:"700"},
  secHead:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:T.spacing.md},
  secTitle:{fontSize:T.fonts.lg,fontWeight:"700",color:T.text.primary},
  secSub:{fontSize:T.fonts.xs,color:T.text.muted,marginTop:2},
  secAction:{fontSize:T.fonts.sm,color:T.primary,fontWeight:"600"},
  empty:{alignItems:"center",justifyContent:"center",padding:T.spacing.xxl},
  emptyIcon:{width:72,height:72,borderRadius:36,backgroundColor:T.bg.card,justifyContent:"center",alignItems:"center",marginBottom:T.spacing.lg},
  emptyTitle:{fontSize:T.fonts.lg,fontWeight:"700",color:T.text.secondary,textAlign:"center"},
  emptySub:{fontSize:T.fonts.sm,color:T.text.muted,textAlign:"center",marginTop:6,lineHeight:20},
  statCard:{flex:1,backgroundColor:T.bg.card,borderRadius:T.radius.lg,padding:T.spacing.md,alignItems:"center",gap:4,borderTopWidth:2,borderWidth:1,borderColor:T.border.color},
  statVal:{fontSize:T.fonts.xl,fontWeight:"700"},
  statLabel:{fontSize:10,color:T.text.muted,textAlign:"center",fontWeight:"500"},
});
