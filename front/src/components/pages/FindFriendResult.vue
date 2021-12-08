<template>
  <div class="findfriendresult">
    <el-row justify="center" align="middle" style="height: 100%">
      <el-col :span="8" style="height: 100%">
        <el-card style="height: 100%" body-style="height: 100%;">          
          <h3 style="text-align: center">Find Friend</h3>
          <el-row>            
            <el-col :span="20"> </el-col>
            <el-col :span="4">
            </el-col>
            <el-input v-model="form.findstring"></el-input>
            <el-button type="primary"
            @click="$router.replace({ name: 'FindFriendResult', params: { searchstring: this.form.findstring} })"
            >검색</el-button>
          </el-row>          
          <h3 style="text-align: center">Find Result</h3>
          <el-table :data="searchresult" style="width: 100%" max-Height="700px">
            <el-table-column type="index" width="50" />
            <el-table-column prop="user_id" label="id" />
            <el-table-column prop="user_name" label="name" />
            <el-table-column prop="user_status" label="status" align="center">
            </el-table-column>
            <el-table-column label="friend" align="center">
              <template #default="scope">
                <el-button
                  v-if="!this.friends.find(friend => friend.user_id === scope.row.user_id)"
                  size="mini"
                  @click="addFriend(scope.row.user_id), this.$router.go()"
                  type="success"
                  >
                <!-- <el-button
                  v-if="!this.friends.find(friend => friend.user_id === scope.row.user_id)"
                  size="mini"
                  @click="addFriend(scope.row.user_id)"
                  type="success"
                  > -->
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
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
console.log("enter findfriendresult.vue");
import { mapState, mapMutations } from "vuex";
import { ElNotification } from 'element-plus';
import http from '../../services/http';

export default {
  name: "FindFriendResult",
  async created() {
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
    var para = document.location.href.split("/");
    console.log("===para===");
    console.log(this.form.findstring);
    this.form.findstring=para[4];
    this.searchFriend();
    console.log(this.form.findstring);
  },
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
    async addFriend(friend_id) {
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
          friends: this.friends.filter(friend => friend.user_id !== friend_id)
        });
      } else {
        ElNotification({
          title: "Add friend",
          message: errorMessage,
          type: "error",
        });
      }
    },
    async searchFriend() {
      const { success, searchresult, newstring } = (
        await http.post("/users/searchfriend", this.form)
      ).data;
      console.log("removing");
      this.searchresult.splice(0,this.tablelength);
      console.log("====================");
      console.log(searchresult);
      searchresult.forEach(search => {
        this.searchresult.push({
          ...search
        });
      });
      this.tablelength=searchresult.length;
      console.log(searchresult.length);
      console.log("==========newstring==========");
      console.log(newstring);
      this.form.findstring=newstring;
          
      if (success) {
        ElNotification({
          title: "Search friend",
          message: "Success",
          type: "success",
        });
      } 
    },
  },
  data() {
    return {
      searchresult: [],
      tablelength: 0,
      form:{
        findstring: "",
        
      },
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
.el-input {
  width: 70%;
}
</style>
