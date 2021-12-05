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
              <el-input v-model="form.status"></el-input>
            </el-form-item>

            <el-row>
              <el-col :span="6">
                <el-button type="primary" @click="EditStatusMsg()">변경하기</el-button>
              </el-col>
            </el-row>
            <el-form-item label="현재위치" prop="user_location">
              <el-select v-model="form.location">
                <el-option label="공학관" value=0></el-option>
                <el-option label="백양관" value=1></el-option>
                <el-option label="학생회관" value=2></el-option>
                <el-option label="신촌역" value=3></el-option>
              </el-select>
            </el-form-item>
            <el-row>
              <el-col :span="6">
                <el-button type="primary" @click="UpdatemyPlace()">업데이트 하기</el-button>
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
          </el-form>
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
      form: {
        status: "",
      },
    };
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
    async UpdatemyPlace(){
      const { lat, lon, building, floor, SSID, IP } = (
        await http.get("/users/UpdatemyPlace")
      ).data;
      console.log(lat);
      console.log(lon);
      console.log(building);
      console.log(floor);
      console.log(SSID);
      console.log(IP);
    }
   
  }

};
</script>


