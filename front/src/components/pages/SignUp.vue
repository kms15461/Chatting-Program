<template>
  <div class="sign_up">
    <el-row justify="center" align="middle">
      <el-col :span="8">
        <el-card class="box-card">
          <div class="card-header">
            <span>Sign up</span>
          </div>
          <br />
          <el-form ref="ruleForm" :model="ruleForm" label-width="100px" :rules="rules">
            <el-form-item label="ID" prop="id">
              <el-input v-model="ruleForm.id"></el-input>
              <el-button type="primary" @click="idDuplicateCheck()" >중복확인</el-button>
            </el-form-item>
            <el-form-item label="PASSWORD" prop="password">
              <el-input v-model="ruleForm.password"></el-input>
            </el-form-item>
            <el-form-item label="PASSWORD CHECK" prop="password_check">
              <el-input v-model="ruleForm.password_check"></el-input>
            </el-form-item>
            <el-form-item label="NAME" prop="name">
              <el-input v-model="ruleForm.name"></el-input>
            </el-form-item>
            <el-form-item label="USER TYPE" prop="user_type">
              <el-select v-model="ruleForm.user_type">
                <el-option label="일반" value="general" v-model="ruleForm.user_type">일반</el-option>
                <el-option label="학생" value="student" v-model="ruleForm.user_type">학생</el-option>
                <el-option label="강사" value="teacher" v-model="ruleForm.user_type">강사</el-option>
                <el-option label="기업" value="company" v-model="ruleForm.user_type">기업</el-option>
              </el-select>
            </el-form-item>
            <el-row>
              <el-col :span="16"> </el-col>
              <el-col :span="8">
                <el-button type="primary" @click="signUp()">Sign up</el-button>
              </el-col>
            </el-row>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import http from "../../services/http";
import { ElNotification } from 'element-plus';
export default {
  name: "SignUp",
  data() {
    const idValidator = (rule, value, callback) => {
      const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{4,20}$/; // 4~20자 사이의 숫자 1개 이상, 영문 1개 이상
      if (value === "") {
        callback(new Error("id를 입력해주세요"));
      } else if (!regex.test(value)) {
        callback(
          new Error("4~20자 사이의 하나 이상의 영문와 하나 이상의 숫자를 입력해주세요")
        );
      } else if(!this.id_duplicated){
        callback(new Error("id 중복체크를 해주세요"))
      } else {
        callback();
      }
    };
    const passwordValidator = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("password를 입력해주세요"));
      } else {
        callback();
      }
    };
    const passwordCheck = (rule, value, callback) => {
      if (value === this.ruleForm.password) {
        callback();
      } else {
        callback(new Error("비밀번호가 일치하지 않습니다"));
      }
    };
    const nameValidator = (rule, value, callback) => {
      const regex = /^[가-힣a-zA-z]{3,20}$/; // 3~20자 사이의 한글 또는 영문
      if (value === "") {
        callback(new Error("name를 입력해주세요"));
      } else if (!regex.test(value)) {
        callback(new Error("3~20자 한글 또는 영문을 입력해주세요"));
      } else {
        callback();
      }
    };
    return {
      ruleForm: {
        id: "",
        password: "",
        password_check: "",
        name: "",
        user_type: "",
      },
      rules: {
        id: [{ validator: idValidator, trigger: "blur" }],
        password: [{ validator: passwordValidator, trigger: "blur" }],
        password_check: [{ validator: passwordCheck, trigger: "blur" }],
        name: [{ validator: nameValidator, trigger: "blur" }],
        user_type: [],
      },
      id_duplicated:false,
    };
  },
  methods: {
    signUp() {
      this.$refs["ruleForm"].validate(async (valid) => {
        if (valid) {
          const { success, errorMessage } = (
            await http.post("/users/signUp", this.ruleForm)
          ).data;
          if (success) {
            this.$router.push({
              name: "SignIn",
            });
            ElNotification({
              title: "회원가입",
              message: "회원가입에 성공하였습니다",
              type: "success",
            });
          } else {
            ElNotification({
              title: "회원가입",
              message: errorMessage,
              type: "error",
            });
          }
        } else {
          return false;
        }
      });
    },
    async idDuplicateCheck() {
      const { success, errorMessage } = (
        await http.post("/users/idDuplicateCheck", this.ruleForm)
      ).data;
      if (success) {
        this.id_duplicated=true;
        ElNotification({
          title: "중복체크",
          message: "사용가능한 ID입니다.",
          type: "success",
        });
      } else {
        ElNotification({
          title: "중복체크",
          message: errorMessage,
          type: "error",
        });
      }
    }
  },
};
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.sign_up {
  height: 100%;
}
.el-input {
  width: 90%;
}
.el-select {
  width: 90%;
}
.el-row {
  height: 100%;
}
</style>