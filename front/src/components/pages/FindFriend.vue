<template>
  <div class="findfriend">
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
            @click="searchFriend()"
            >검색</el-button>
          </el-row>          
          <h3 style="text-align: center">Find Result</h3>
          <el-table :data="searchresult" style="width: 100%" max-Height="700px">
            <el-table-column type="index" width="50" />
            <el-table-column prop="user_id" label="id" />
            <el-table-column prop="user_name" label="name" />
            <el-table-column prop="user_status" label="status" align="center">
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
console.log("enter findfriend.vue");
// import { mapState, mapMutations } from "vuex";
import { ElNotification } from 'element-plus';
import http from '../../services/http';

export default {
  name: "FindFriend",
  computed: {
    // ...mapState('user', ['id', 'friends']),
    // ...mapState('online', ['users']),
  },
  methods: {
    async searchFriend() {
      const { success, searchresult } = (
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
