<template>
  <div class="app_header">
    <el-row>
      <el-col :span="4">
        <div v-if="name == ''">
          <router-link to="/" class="button"> Sign In </router-link>
        </div>
        <div v-else>
          <span>{{ `${name} 님`}}</span>  
        </div>
      </el-col>
			<el-col :span="16">
        <div v-if="name !== ''">
          <el-link el-link :underline="false" @click="$router.replace({ name: 'Friend' })">Friend List</el-link>
          <el-link el-link :underline="false" @click="$router.replace({ name: 'ChatList' })">Chat List</el-link>
          <el-link el-link :underline="false" @click="$router.replace({ name: 'Surround' })">Place List</el-link>
        </div>
      </el-col>
			<el-col :span="4">
				<div v-if="name === ''">
					<router-link to="signup" class="button"> sign up </router-link>
          
        </div>
				<div v-else>
					<el-button @click="signOut()" size="small" style="margin-left: 10px;">sign out</el-button>
          <el-link el-link :underline="false" @click="$router.push({ name: 'Profile' })">Profile</el-link>
          
        </div>
			</el-col>
    </el-row>
  </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";
import { ElNotification } from 'element-plus';
import http from "../../services/http";

export default {
  name: "AppHeader",
	computed: {
		...mapState('user', ['name', 'id', 'connected']),
	},
  data() {
    return {
    };
  },
	methods: {
		...mapMutations('user', ['updateUser']),
		async signOut() {
			const { success, errorMessage } = (await http.get('/users/signOut')).data;
			if (success) {
        // 소켓 연결 끊기
        this.$socket.disconnect();

				this.updateUser({
					id: '',
					name: '',
          connected: 0
				});
				
				this.$router.push({
					name: 'SignIn'
				});

        ElNotification({
          title: 'Sign out',
          message: 'success',
          type: 'success'
        });
			} else {
				ElNotification({
          title: 'Sign out',
          message: errorMessage,
          type: 'error'
        });
			}
		},
	},
  async created() {
    window.onresize = () => {
      this.dialogWidth = Math.min(document.body.clientWidth - 50, 900);
    };
  },
};
</script>

<style scoped>
.app_header {
  height: 100%;
}
.button {
  color: black;
  cursor: pointer;
  display: inline-block;
  text-decoration: none;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  margin-right: 10px;
}
.el-link {
  margin: 0 20px 0 20px;
  font-size: 1.5em;
}
</style>
