<template>
  <div class="online">
    <el-row justify="center" align="middle" style="height: 100%">
      <el-col :span="12" style="height: 100%">
        <el-card style="height: 100%" body-style="height: 100%;">
          <h3 style="text-align: center">접속중인 사용자</h3>
          <el-table :data="queryResult" style="width: 100%" max-Height="700px">
            <el-table-column prop="building" label="building" />
            <el-table-column prop="floor" label="floor" />
            <el-table-column prop="SSID" label="wifi_ssid" />
            <el-table-column label="online" align="center">
              <template #default="scope">
                <el-button
                  size="mini"
                  type="primary"
                  @click="$router.push({ name: 'Online', params: { building: scope.row.building, floor: scope.row.floor, SSID: scope.row.SSID } })"
                  >online</el-button
                >
              </template>
            </el-table-column>     
          </el-table>
          <el-row>            
            <el-col :span="10"> </el-col>
            <el-col :span="4">
              <el-button
                  type="primary"
                  @click="$router.push({ name: 'Nearme' })"
                  >내 근처 500m</el-button
                >
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { mapState} from "vuex";
import http from '../../services/http';

export default {
  name: "Chat",
  async created() {
    console.log("ENTER surround VUE");
    const { queryResult } = (await http.get('/users/place')).data;
    console.log(queryResult);
    console.log("-----------------------------------------");
    queryResult.forEach(QR => {
      this.queryResult.push({
        ...QR
      });
    });
  },
  computed: {
    ...mapState('user', ['id', 'friends']),
    ...mapState('online', ['users']),
  },
  data() {
    return {
      queryResult: [],
    };
  }, 
};
</script>

<style scoped>
.online {
  height: 100%;
}
</style>
