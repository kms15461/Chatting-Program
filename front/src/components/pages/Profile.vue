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
            <el-form-item label="지역" prop="user_location">
              <el-select v-model="form.location">
                <el-option label="공학관" value=0></el-option>
                <el-option label="백양관" value=1></el-option>
                <el-option label="학생회관" value=2></el-option>
                <el-option label="신촌역" value=3></el-option>
              </el-select>
            </el-form-item>
            <el-row>
              <el-col :span="18"> </el-col>
              <el-col :span="6">
                <el-button type="primary" @click="editProfile()">변경하기</el-button>
              </el-col>
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
  name: "editProfile",
  computed: {
    ...mapState('user', ['name', 'id', 'connected']),
  },
  data() {
    return {
      form: {
        status: "",
        location: "",
      },
    };
  },
  methods: {
    ...mapMutations("user", ["updateUser"]),

    async editProfile() {
      const { success } = (
        await http.post("/users/editProfile", this.form)
      ).data;
      if (success){
        ElNotification({
          title: "회원정보수정",
          message: "회원정보수정",
          type: "success",
        });
      }
    }
  }

};
</script>


