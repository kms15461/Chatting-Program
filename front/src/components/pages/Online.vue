<template>
  <div class="online">
    <el-row justify="center" align="middle" style="height: 100%">
      <el-col :span="12" style="height: 100%">
        <el-card style="height: 100%" body-style="height: 100%;">
          <h3 style="text-align: center">{{ $route.params.building }} {{ $route.params.floor }} {{ $route.params.SSID }} 접속중인 사용자</h3>
          <el-table :data="queryResult" style="width: 100%" max-Height="700px">
            <el-table-column type="index" width="50" />
            <el-table-column prop="user_id" label="id" />
            <el-table-column prop="user_type" label="type" />
            <el-table-column prop="user_status" label="상메" />
            <el-table-column label="friend" align="center">
              <template #default="scope">
                <el-button
                  v-if="!this.friends.find(el => el.user_id === scope.row.user_id)"
                  size="mini"
                  @click="addFriend(scope.row.user_id, scope.row.user_name), this.$router.go()"
                  type="success"
                  >
                  add
                </el-button>
                <el-button
                  v-else
                  size="mini"
                  @click="removeFriend(scope.row.user_id), this.$router.go()"
                  type="danger"
                  >
                  remove
                </el-button>
              </template>
            </el-table-column>
            <el-table-column label="chat" align="center">
              <template #default="scope">
                <el-button
                  size="mini"
                  type="primary"
                  @click="$router.push({ name: 'Chat', params: { userId: scope.row.user_id } })"
                  >chat</el-button
                >
              </template>
            </el-table-column>
          </el-table>
          <h3 style="text-align: center">{{ $route.params.building }} {{ $route.params.floor }} {{ $route.params.SSID }} 미접속중인 사용자</h3>
          <el-table :data="queryResult2" style="width: 100%" max-Height="700px">
            <el-table-column type="index" width="50" />
            <el-table-column prop="user_id" label="id" />
            <el-table-column prop="user_name" label="name" />
            <el-table-column label="friend" align="center">
              <template #default="scope">
                <el-button
                  v-if="!this.friends.find(el => el.user_id === scope.row.user_id)"
                  size="mini"
                  @click="addFriend(scope.row.user_id, scope.row.user_name), this.$router.go()"
                  type="success"
                  >
                  add
                </el-button>
                <el-button
                  v-else
                  size="mini"
                  @click="removeFriend(scope.row.user_id), this.$router.go()"
                  type="danger"
                  >
                  remove
                </el-button>
              </template>
            </el-table-column>
            <el-table-column label="chat" align="center">
              <template #default="scope">
                <el-button
                  size="mini"
                  type="primary"
                  @click="$router.push({ name: 'Chat', params: { userId: scope.row.user_id } })"
                  >chat</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";
import { ElNotification } from 'element-plus';
import http from '../../services/http';

export default {
  name: "Chat",
  async created() {
    console.log("ENTER ONLINE CREATED");
    var link = document.location.href;
    var para = document.location.href.split("/");
    console.log("--------------------------");
    console.log(link);
    console.log(para[4]);
    console.log(para[5]);
    console.log(para[6]);
    console.log("--------------------------");
    console.log("ENTER ONLINE VUE");
    const { queryResult } = (await http.get('/users/onlineuser')).data;
    const { queryResult2 } = (await http.get('/users/onlineuser2')).data;
    console.log(queryResult);
    console.log(queryResult2);
    console.log("-----------------------------------------");
    queryResult.forEach(QR => {
      if(QR.building==para[4] && QR.floor==para[5] && QR.SSID==para[6]){
        if(QR.user_type==1){
          QR.user_type="일반"
        }
        else if(QR.user_type==2){
          QR.user_type="학생"
        }
        else if(QR.user_type==2){
          QR.user_type="강사"
        }
        else{
          QR.user_type="기업"
        }
        this.queryResult.push({
          ...QR
        });
      }
    });
    queryResult2.forEach(QR => {
      if(QR.building==para[4] && QR.floor==para[5] && QR.SSID==para[6]){
        if(QR.user_type==1){
          QR.user_type="일반"
        }
        else if(QR.user_type==2){
          QR.user_type="학생"
        }
        else if(QR.user_type==2){
          QR.user_type="강사"
        }
        else{
          QR.user_type="기업"
        }
        this.queryResult2.push({
          ...QR
        });
      }
    });
    const { success, errorMessage, friends } = (await http.get('/users/friends')).data;
    if (success) {
      this.updateFriends({
        friends
      });
    } else {
      ElNotification({
        title: "Add friend",
        message: errorMessage,
        type: "error",
      });
    }
  },
  computed: {
    ...mapState('user', ['id', 'friends']),
    ...mapState('online', ['users']),
  },
  methods: {
    ...mapMutations('user', ['updateFriends']),
    async addFriend(friend_id, friend_name) {
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
          friends: [...this.friends, { id: friend_id, name: friend_name }]
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
  data() {
    return {
      queryResult: [],
      queryResult2: [],
    };
  }, 
};
</script>

<style scoped>
.online {
  height: 100%;
}
</style>
