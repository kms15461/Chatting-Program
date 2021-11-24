<template>
  <div class="profile">
    <el-row justify="center" align="middle">
      <el-col :span="6">
        <el-card class="box-card">
          <div class="card-header">
            <span>Profile</span>
          </div>
          <br />
          <el-form ref="adForm" :model="adForm" label-width="120px" :rules="rules">
            <el-form-item label="상태메시지">
              <el-input v-model="adForm.status"></el-input>
            </el-form-item>
            <el-form-item label="지역" prop="user_location">
              <el-select v-model="adForm.user_type">
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
//import http from '../../services/http';
import { mapState } from "vuex";
//import { mapMutations } from "vuex";
//import { ElNotification } from 'element-plus';
console.log("friend.vue 하나 만드는 것도 좆같이 어렵네 진짜");

export default {
  name: "Profile",
    computed: {
      ...mapState('user', ['name', 'id', 'connected']),
    },
  data() {
    const statusValidator = (rule, value, callback) => {
      const regex = /^[가-힣 ]{,20}$/; // 20자 이하의 한글 또는 공백

      if (!regex.test(value)) {
        callback(new Error("20자 이하의 한글 또는 공백을 입력해주세요"));
      } else {
        callback();
      }
    };


    return {
      adForm:{
        status: "",
        loc: "",
      },
      rules: {
        status: [{ validator: statusValidator, trigger: "blur" }],
      }
    };
  },
  methods: {
    editProfile() {
      
    }
  }

};
</script>


