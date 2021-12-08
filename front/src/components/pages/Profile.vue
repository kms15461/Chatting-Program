<template>
  <div class="profile">
    <el-row justify="center" align="middle">
      <el-col :span="6">
        <el-card class="box-card">
          <div class="card-header">
            <span>Profile</span>
          </div>
          <br />
          <el-form ref="form" :model="form" label-width="120px" :rules="rules">
            <el-form-item label="상태메시지">
              <el-input v-model="form.statusmsg"></el-input>
            </el-form-item>
          </el-form>
            <el-row>
              <el-col :span="6">
                <el-button type="primary" @click="EditStatusMsg()">변경하기</el-button>
              </el-col>
            </el-row>
            <div id='app'>
            <p v-html="aLinkToMedium"></p>
            </div>
            <el-row :data="userinfo" v-if="userinfo.queryResult">
            <el-col>위도:{{ `${userinfo.queryResult[0].lat} `}} </el-col>
            <el-col>경도:{{ `${userinfo.queryResult[0].lon} `}} </el-col>
            <el-col>건물:{{ `${userinfo.queryResult[0].building} `}} </el-col>
            <el-col>층수:{{ `${userinfo.queryResult[0].floor} `}} </el-col>
            <el-col>SSID:{{ `${userinfo.queryResult[0].SSID} `}} </el-col>
            <el-col>IP:{{ `${userinfo.queryResult[0].IP} `}} </el-col>
            </el-row>
            <button @click="importTextFile">불러오기</button>
            <el-row>
              <el-col :span="6">
                <el-button type="primary" @click="submit(), this.$router.go()">업데이트 하기</el-button>
              </el-col>
            </el-row>
            <el-row>
              로그아웃
              <el-button type="primary" @click="signOut()">확인</el-button>
            </el-row>
            <el-row>
              회원탈퇴
              <el-button type="primary" @click="Withdrawal()">확인</el-button>
            </el-row>
          
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import http from '../../services/http';
import { mapState } from "vuex";
import { mapMutations } from "vuex";
import { ElNotification } from 'element-plus';

export default {
  name: "EditStatusMsg",
  computed: {
    ...mapState('user', ['name', 'id', 'connected']),
  },
  data() {
    return {
      userinfo:[],
      form: {
        csvcontents:"", 
        statusmsg: "",
      },
    };
  },
  async created() {
    const queryResult=(await http.get('/users/SetProfile')).data;
    this.userinfo=queryResult;
  },
  methods: {
    ...mapMutations("user", ["updateUser"]),

    async EditStatusMsg() {
      const { success } = (
        await http.post("/users/EditStatusMsg", this.form)
      ).data;
      if (success){
        ElNotification({
          title: "회원정보수정",
          message: "회원정보수정 완료",
          type: "success",
        });
      }
    },
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
    async Withdrawal() {
      const { success } = (
        await http.get("/users/withdrawal")
      ).data;
      if (success){
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
          title: "회원탈퇴",
          message: "회원탈퇴 완료",
          type: "success",
        });
      }
    },
    async submit(){
      
      const { success } = (await http.post("/users/uploadFile", this.form)).data;
      console.log(success);   
    },
    async importTextFile() {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'text/plain'; // 확장자가 xxx, yyy 일때, ".xxx, .yyy"
      // this 접근을 위해 선언 필요
      const self = this;
      input.onchange = function () {
        const file = new FileReader();
        file.onload = () => {
          self.$data.form.csvcontents=file.result;
        };
        file.readAsText(this.files[0]);
      };
      input.click();

    },
  }

};
</script>


