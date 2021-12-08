<template>
  <div class="friend">
    <el-row justify="center" align="middle" style="height: 100%">
      <el-col :span="8" style="height: 100%">
        <el-card style="height: 100%" body-style="height: 100%;">          
          <h3 style="text-align: center">Friend List</h3>
          <el-row>            
            <el-col :span="20"> </el-col>
            <el-col :span="4">
              <el-button type="primary"
              @click="$router.push({ name: 'FindFriend' })"
              >검색</el-button>
            </el-col>
          </el-row>
          <h3 style="text-align: center">Online Friend</h3>
          <el-table :data="on_friend" style="width: 100%" max-Height="700px">
            <el-table-column type="index" width="50" />
            <el-table-column prop="user_id" label="id" />
            <el-table-column prop="user_name" label="name" />
            <el-table-column prop="user_connected" label="online" align="center">
                <template #default="scope">
                    <span v-if="scope.row.user_connected === 1" class="online"> Online! </span>
                    <span v-else class="offline"> Offline? </span>
                </template>
            </el-table-column>
            <el-table-column label="friend" align="center">
              <template #default="scope">
                <el-button
                  v-if="!this.friends.find(friend => friend.user_id === scope.row.user_id)"
                  size="mini"
                  @click="addFriend(scope.row.user_id)"
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
          <h3 style="text-align: center">Offline Friend</h3>
          <el-table :data="off_friend" style="width: 100%" max-Height="700px">
            <el-table-column type="index" width="50" />
            <el-table-column prop="user_id" label="id" />
            <el-table-column prop="user_name" label="name" />
            <el-table-column prop="user_connected" label="online" align="center">
                <template #default="scope">
                    <span v-if="scope.row.user_connected === 1" class="online"> Online! </span>
                    <span v-else class="offline"> Offline? </span>
                </template>
            </el-table-column>
            <el-table-column label="friend" align="center">
              <template #default="scope">
                <el-button
                  v-if="!this.friends.find(friend => friend.user_id === scope.row.user_id)"
                  size="mini"
                  @click="addFriend(scope.row.user_id)"
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
console.log("enter friend.vue");
import { mapState, mapMutations } from "vuex";
import { ElNotification } from 'element-plus';
import http from '../../services/http';

export default {
  name: "Friend",
  computed: {
    ...mapState('user', ['id', 'friends']),
    ...mapState('online', ['users']),
  },
  methods: {
    ...mapMutations('user', ['updateFriends']),
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
          friends: this.friends.filter(friend => friend.user_id !== friend_id)
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
  async created() {
    const { on_friend } = (await http.get('/users/onlinefriend')).data;
    console.log(on_friend);
    console.log("-------------on----------------------------");
    on_friend.forEach(on => {
      this.on_friend.push({
        ...on
      });
    });
    const { off_friend } = (await http.get('/users/offlinefriend')).data;
    console.log(off_friend);
    console.log("--------------off---------------------------");
    off_friend.forEach(off => {
      this.off_friend.push({
        ...off
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
  data() {
    return {
      on_friend: [],
      off_friend: [],
    };
  }, 
};
</script>

<style scoped>
.friend {
    height: 100%;
}
.online {
  color: green;
}
.offline {
  color: red;
}
</style>
