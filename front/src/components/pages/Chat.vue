<template>
  <div class="chat">
    <el-row
      justify="center"
      align="middle"
      style="height: 100%;">
      <el-col :span="6" style="height: 100%;">
        <el-card style="height: 100%;" :body-style="{ height: 'calc(100% - 58px)' }">
          <template #header >
            <div class="card-header">
              <span>{{ this.target_name }}</span>

              <el-button
                v-if="!this.friends.find(el => el.user_id === $route.params.userId)"
                size="mini"
                @click="addFriend($route.params.userId), this.$router.go()"
                type="success"
                >
                add
              </el-button>
              <el-button
                v-else
                size="mini"
                @click="removeFriend($route.params.userId), this.$router.go()"
                type="danger"
                >
                remove
              </el-button>
            </div>
          </template>
          <el-scrollbar class="chat_messages" ref="scrollbar" view-style="height: 100%;">
            <div ref="inner">
              <div v-for="(chatData, index) in chatDatas" :key="index" :class="`${chatData.type} chat_line`">
                
                <div v-if="(chatData.type ==='chat_left') && (chatData.expire_time) && (this.far)" >
                  <p :class="`${chatData.type}_inner chat_inner`">
                    ""공간밖의 메세지입니다""
                  </p>
                </div>
                <div v-else>
                  <p :class="`${chatData.type}_inner chat_inner`">
                  {{ chatData.message }}
                  </p>
                </div>
                
                <p v-if="chatData.type === 'chat_right'" :class="`${chatData.type}_time`">{{ new Date(chatData.created_at).toLocaleTimeString() }}</p>
                <p v-if="chatData.type === 'chat_right' && `${chatData.noticed}` === '1'">읽음</p>
                <p v-else-if="chatData.type === 'chat_right' && `${chatData.noticed}` === '0'">읽지 않음</p>
                <p v-if="chatData.type === 'chat_left' && `${chatData.noticed}` === '1'">읽음</p>
                <p v-else-if="chatData.type === 'chat_left' && `${chatData.noticed}` === '0'">읽지 않음</p>
                <p v-if="chatData.type === 'chat_left'" :class="`${chatData.type}_time`">{{ new Date(chatData.created_at).toLocaleTimeString() }}</p>
              </div>
            </div>
          </el-scrollbar>
          <el-row>
            <el-col
              :span="24">
              <el-input :autosize="true" v-model="chatMessage"></el-input>
            </el-col>
          </el-row>
          <el-row>
            <el-col
              :span="11">
              <el-button type="info" class="send_button" @click="sendMessage">send</el-button>
            </el-col>
            <el-col
              :span="2">
            </el-col>
            <el-col
              :span="11">
              <el-button type="info" class="send_button" @click="dialogVisible = true">rendezvous send</el-button>
              <el-dialog v-model="dialogVisible" width="30%">
                <el-row justify="center" align="middle" style="height: 50%;">
                  <div>
                    <el-radio-group v-model="radio">
                      <el-radio-button label="3분"></el-radio-button>
                      <el-radio-button label="30분"></el-radio-button>
                      <el-radio-button label="60분"></el-radio-button>
                      <el-radio-button label="지정시간"></el-radio-button>
                    </el-radio-group>
                  </div>
                  <el-input-number v-model="num" :step="1" :min="1" />
                </el-row>
                <el-row justify="center" align="middle" style="height: 50%;">
                  <el-col
                    :span="12">
                    <el-button type="info" class="send_button" @click="[rendezvoussendMessage(), dialogVisible = false]">rendezvous send</el-button>
                  </el-col>
                </el-row>
              </el-dialog>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import http from '../../services/http';
import { ElNotification } from 'element-plus';
import { defineComponent, ref } from 'vue'
import { mapMutations } from "vuex";

export default defineComponent({
  name: "Chat",
  data() {
    return {
      target_name:'',
      far: '',
      chatDatas: [],
      chatMessage: '',
    }
  },
  computed: {
    ...mapState('user', ['id', 'friends']),
  },
  async created() {
    // 이전 대화 내용 가져오기
    const { success1, far, chatDatas, target_name, errorMessage1 } = (await http.get(`/chats/chatData/${this.$route.params.userId}`)).data;
    if (success1) {
      chatDatas.forEach(chatData => {
        this.chatDatas.push({
          
          ...chatData,
          type: chatData.from_id === this.id ? 'chat_right' : 'chat_left'
        });

        this.chatDatas.sort((a, b) => a.created_at - b.created_at);
        this.far=far;
        this.target_name=target_name;
        
      });
    } else {
      ElNotification({
        title: 'Get prev chat datas',
        message: errorMessage1,
        type: 'error'
      });
    }
    // socket 연결
    this.sockets.subscribe('CHAT_MESSAGE', msg => {
      this.chatDatas.push({
        ...msg,
        type: 'chat_left'
      });
      this.chatDatas.sort((a, b) => a.created_at - b.created_at);
    });
    const { success, errorMessage, friends } = (await http.get('/users/friends')).data;
    if (success) {
      this.updateFriends({
        friends
      });
    } else {
      ElNotification({
        title: "Add/Remove friend",
        message: errorMessage,
        type: "error",
      });
    }
  },
  beforeUnmount() {
    this.sockets.unsubscribe('CHAT_MESSAGE');
  },
  setup() {
    const dialogVisible = ref(false)
    const num = ref(1)

    return {
      dialogVisible,
      radio: ref('3분'),
      num,
    }
  },
  methods: {
    ...mapMutations('user', ['updateFriends']),
    rendezvoussendMessage() {
      if (this.chatMessage.trim() !== '') {
        const created_at = Date.now();
        const expire_time = new Date(created_at);
        const noticed = 0;
        let durtime;

        if (this.radio === '3분'){
          durtime = 3;
          expire_time.setMinutes(expire_time.getMinutes()+durtime);
        }
        else if(this.radio === '30분'){
          durtime = 30;
          expire_time.setMinutes(expire_time.getMinutes()+durtime);
        }
        else if(this.radio === '60분'){
          durtime = 60;
          expire_time.setMinutes(expire_time.getMinutes()+durtime);
        }
        else{
          durtime = this.num;
          expire_time.setMinutes(expire_time.getMinutes()+durtime);
        }

        this.chatDatas.push({
          message: this.chatMessage + expire_time.toLocaleTimeString() + "에 삭제됩니다.",
          type: 'chat_right',
          created_at,
          expire_time,
          noticed
        });

        // socket 채팅 전송
        this.$socket.emit('CHAT_MESSAGE', {
          message: this.chatMessage + expire_time.toLocaleTimeString() + "에 삭제됩니다.",
          targetId: this.$route.params.userId,
          created_at: new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
          expire_time: new Date(expire_time.setHours(expire_time.getHours()+9)).toISOString().slice(0, 19).replace('T', ' '),
          noticed: noticed,
          durtime: durtime
        })

        this.chatMessage = '';

        this.$nextTick(() => {
          this.$refs.scrollbar.setScrollTop(this.$refs.inner.clientHeight);
        });
      }
    },
    sendMessage() {
      if (this.chatMessage.trim() !== '') {
        const created_at = Date.now();
        const noticed = 0;

        this.chatDatas.push({
          message: this.chatMessage,
          type: 'chat_right',
          created_at,
          noticed
        });

        // socket 채팅 전송
        this.$socket.emit('CHAT_MESSAGE', {
          message: this.chatMessage,
          targetId: this.$route.params.userId,
          created_at: new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
          noticed: noticed,
        })

        this.chatMessage = '';

        this.$nextTick(() => {
          this.$refs.scrollbar.setScrollTop(this.$refs.inner.clientHeight);
        });
      }
    },
    async addFriend(friend_id) {
      const { success, errorMessage } = (await http.post('/users/addFriends', {
        friend_id
      })).data;

      if (success) {
        console.log("친구추가완료!");
        ElNotification({
          title: "Add friend",
          message: "Success",
          type: "success",
        });
        this.updateFriends({
          friends: [...this.friends, { id: friend_id }]
        });
      } else {
        ElNotification({
          title: "Add friend",
          message: errorMessage,
          type: "error",
        });
      }
      
    },
    async removeFriend(friend_id) {
      const { success, errorMessage } = (await http.post('/users/removeFriends', {
        friend_id
      })).data;

      if (success) {
        ElNotification({
          title: "Remove friend",
          message: "Success",
          type: "success",
        });
        this.updateFriends({
          friends: this.friends.filter(friend => friend.id !== friend_id)
        });
      } else {
        ElNotification({
          title: "Remove friend",
          message: errorMessage,
          type: "error",
        });
      }
      
    },
  },
});

</script>

<style scoped>
p {
  display: inline
}
.chat {
  height: 100%;
}
.chat_line {
  margin: 0 0 5px 0;
  padding: 0;
}
.chat_right {
  text-align: right;
}
.chat_left {
  text-align: left;
}
.chat_right_inner {
  background: #13CA93;
  color: white;
}
.chat_left_time {
  margin-left: 3px;
  font-size: 0.8em;
}
.chat_right_time {
  margin-right: 3px;
  font-size: 0.8em;
}
.chat_inner {
  margin: 0;
  padding: 2px 10px 2px 10px;
  border-radius: 10px;
  display: inline-block;
}
.chat_left_inner {
  background: #666666;
  color: white;
}
.chat_messages {
  margin-bottom: 10px;
  height: calc(100% - 80px);
}
.chat_input {
  margin-right: 5px;
}
.send_button {
  width: 100%;
  margin: 5px 0 5px 0;
}

</style>
