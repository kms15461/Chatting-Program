<template>
  <div class="nearme">
    <el-row justify="center" align="middle" style="height: 100%">
      <el-col :span="12" style="height: 100%">
        <el-card style="height: 100%" body-style="height: 100%;">
          <h3 style="text-align: center">내 근처에서 접속중인 사용자</h3>
          <el-table :data="queryResult3" style="width: 100%" max-Height="700px">
            <el-table-column type="index" width="50" />
            <el-table-column prop="user_name" label="이름" />
            <el-table-column prop="user_type" label="유저 타입" />
            <el-table-column prop="user_status" label="상태 메세지" />
            <el-table-column label="친구" align="center">
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
            <el-table-column label="채팅" align="center">
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
          <h3 style="text-align: center">내 근처에서 미접속중인 사용자</h3>
          <el-table :data="queryResult4" style="width: 100%" max-Height="700px">
            <el-table-column type="index" width="50" />
            <el-table-column prop="user_name" label="이름" />
            <el-table-column prop="user_type" label="유저 타입" />
            <el-table-column prop="user_status" label="상태 메세지" />
            <el-table-column label="친구" align="center">
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
            <el-table-column label="채팅" align="center">
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
  name: "Nearme",
  async created() {
    var link = document.location.href;
    var para = document.location.href.split("/");
    console.log("--------------------------");
    console.log(link);
    console.log(para[4]);
    console.log(para[5]);
    console.log(para[6]);
    console.log("--------------------------");
    console.log("ENTER ONLINE VUE");
    const { queryResult3 } = (await http.get('/users/nearme1')).data;
    const { queryResult4 } = (await http.get('/users/nearme2')).data;
    console.log(queryResult3);
    console.log("-----------------------------------------");
    
    queryResult3.forEach(QR => {
      if (QR.user_type==1){
          QR.user_type='일반';
      }
      else if (QR.user_type==2){
          QR.user_type='학생';
      }
      else if (QR.user_type==3){
          QR.user_type='강사';
      }
      else if (QR.user_type==4){
          QR.user_type='기업';
      }

      this.queryResult3.push({
        ...QR
      });
    });
    queryResult4.forEach(QR => {
      if (QR.user_type==1){
          QR.user_type='일반';
      }
      else if (QR.user_type==2){
          QR.user_type='학생';
      }
      else if (QR.user_type==3){
          QR.user_type='강사';
      }
      else if (QR.user_type==4){
          QR.user_type='기업';
      }

      this.queryResult4.push({
        ...QR
      });
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
      queryResult3: [],
      queryResult4: [],
    };
  }, 
};
</script>

<style scoped>
.online {
  height: 100%;
}
</style>
