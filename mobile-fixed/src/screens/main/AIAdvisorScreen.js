import React,{useState,useRef} from "react";
import {View,Text,StyleSheet,FlatList,TouchableOpacity,TextInput,KeyboardAvoidingView,Platform,ActivityIndicator} from "react-native";
import {LinearGradient} from "expo-linear-gradient";
import {Ionicons} from "@expo/vector-icons";
import T from "../../styles/theme";
import {aiAPI} from "../../api/api";

const SUGGESTIONS=["Best phone under ₹20,000?","iPhone vs Samsung which is better?","How to check if a phone is stolen?","What is a good trust score?","Sell my iPhone 12 at what price?"];

export default function AIAdvisorScreen(){
  const [messages,setMessages]=useState([{id:"0",role:"assistant",text:"Hi! I'm ZYPHOR's AI Advisor 👋\n\nI can help you find the best deals, check prices, understand trust scores, or answer any phone buying/selling questions!\n\nWhat would you like to know?"}]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const listRef=useRef(null);

  const send=async(text)=>{
    const msg=text||input.trim();
    if(!msg||loading) return;
    setInput("");
    const userMsg={id:Date.now().toString(),role:"user",text:msg};
    setMessages(prev=>[...prev,userMsg]);
    setLoading(true);
    try{
      const r=await aiAPI.advisor(msg);
      setMessages(prev=>[...prev,{id:(Date.now()+1).toString(),role:"assistant",text:r.data.reply}]);
    }catch{
      setMessages(prev=>[...prev,{id:(Date.now()+1).toString(),role:"assistant",text:"Sorry, I'm having trouble connecting. Please try again."}]);
    }finally{
      setLoading(false);
      setTimeout(()=>listRef.current?.scrollToEnd({animated:true}),100);
    }
  };

  return(
    <KeyboardAvoidingView behavior={Platform.OS==="ios"?"padding":"height"} style={styles.root}>
      {/* Header */}
      <LinearGradient colors={["#0B1220","#162030"]} style={styles.header}>
        <View style={styles.aiAvatar}><Ionicons name="sparkles" size={22} color="#fff"/></View>
        <View>
          <Text style={styles.headerTitle}>AI Advisor</Text>
          <Text style={styles.headerSub}>ZYPHOR Intelligence • Always online</Text>
        </View>
        <View style={styles.onlineDot}/>
      </LinearGradient>

      {/* Messages */}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={i=>i.id}
        contentContainerStyle={{padding:16,paddingBottom:8}}
        onContentSizeChange={()=>listRef.current?.scrollToEnd({animated:true})}
        renderItem={({item})=>(
          <View style={[styles.msgRow,item.role==="user"&&styles.msgRowUser]}>
            {item.role==="assistant"&&<View style={styles.botAvatar}><Ionicons name="sparkles" size={14} color="#fff"/></View>}
            <View style={[styles.bubble,item.role==="user"?styles.bubbleUser:styles.bubbleBot]}>
              <Text style={[styles.bubbleText,item.role==="user"&&{color:"#fff"}]}>{item.text}</Text>
            </View>
          </View>
        )}
        ListFooterComponent={loading?<View style={[styles.msgRow]}><View style={styles.botAvatar}><Ionicons name="sparkles" size={14} color="#fff"/></View><View style={styles.bubbleBot}><ActivityIndicator size="small" color={T.primary}/></View></View>:null}
      />

      {/* Suggestions */}
      {messages.length<=2&&(
        <View>
          <FlatList
            horizontal data={SUGGESTIONS} keyExtractor={i=>i} showsHorizontalScrollIndicator={false}
            contentContainerStyle={{paddingHorizontal:16,gap:8,paddingBottom:8}}
            renderItem={({item})=>(
              <TouchableOpacity onPress={()=>send(item)} style={styles.suggestion}>
                <Text style={styles.suggText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Input */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input} placeholder="Ask anything about phones…" placeholderTextColor={T.text.muted}
          value={input} onChangeText={setInput} multiline maxLength={300}
          onSubmitEditing={()=>send()}
        />
        <TouchableOpacity onPress={()=>send()} disabled={!input.trim()||loading} style={[styles.sendBtn,(!input.trim()||loading)&&{opacity:0.4}]}>
          <Ionicons name="send" size={18} color="#fff"/>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles=StyleSheet.create({
  root:{flex:1,backgroundColor:T.bg.primary},
  header:{flexDirection:"row",alignItems:"center",gap:12,paddingTop:52,paddingBottom:16,paddingHorizontal:20},
  aiAvatar:{width:42,height:42,borderRadius:21,backgroundColor:T.primary,justifyContent:"center",alignItems:"center"},
  headerTitle:{fontSize:17,fontWeight:"700",color:"#fff"},
  headerSub:{fontSize:12,color:"rgba(255,255,255,0.5)"},
  onlineDot:{width:8,height:8,borderRadius:4,backgroundColor:T.green,marginLeft:"auto"},
  msgRow:{flexDirection:"row",alignItems:"flex-end",gap:8,marginBottom:14},
  msgRowUser:{flexDirection:"row-reverse"},
  botAvatar:{width:28,height:28,borderRadius:14,backgroundColor:T.primary,justifyContent:"center",alignItems:"center"},
  bubble:{maxWidth:"78%",borderRadius:16,paddingHorizontal:14,paddingVertical:10},
  bubbleBot:{backgroundColor:T.bg.card,borderWidth:1,borderColor:T.border.color},
  bubbleUser:{backgroundColor:T.primary},
  bubbleText:{fontSize:14,color:T.text.primary,lineHeight:21},
  suggestion:{backgroundColor:T.bg.card,borderRadius:T.radius.full,paddingHorizontal:14,paddingVertical:8,borderWidth:1,borderColor:T.border.color},
  suggText:{fontSize:12,color:T.text.secondary},
  inputBar:{flexDirection:"row",alignItems:"flex-end",gap:10,padding:12,paddingBottom:Platform.OS==="ios"?28:12,backgroundColor:T.bg.card,borderTopWidth:1,borderTopColor:T.border.color},
  input:{flex:1,backgroundColor:T.bg.input,borderRadius:T.radius.full,paddingHorizontal:16,paddingVertical:10,fontSize:14,color:T.text.primary,maxHeight:100,borderWidth:1,borderColor:T.border.color},
  sendBtn:{width:42,height:42,borderRadius:21,backgroundColor:T.primary,justifyContent:"center",alignItems:"center"},
});
