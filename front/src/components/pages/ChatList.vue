<template>
  <div class="chatList">
    <el-row justify="center" align="middle" style="height: 100%">
      <el-col :span="10" style="height: 100%">
        <el-card style="height: 100%" body-style="height: 100%;">
          <h3 style="text-align: center">Online Chat List</h3>
          <el-table
            :data="chatList"
            style="width: 100%"
            max-Height="700px"
            cell-class-name="nowrap"
          >
            <el-table-column type="index" width="50" />
            <el-table-column prop="user_id" label="id" width="100" />
            <el-table-column prop="user_name" label="name" width="100" />
            <el-table-column label="message">
              <template #default="scope">
								<span style="white-space: nowrap;">
									{{ scope.row.content }}
								</span>
							</template>
            </el-table-column>
            <el-table-column label="chat" align="center">
              <template #default="scope">
                <el-button
                  size="mini"
                  type="primary"
                  @click="
                    $router.push({ name: 'Chat', params: { userId: scope.row.user_id } })
                  "
                  >chat</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-card>
        <el-card style="height: 100%" body-style="height: 100%;">
          <h3 style="text-align: center">Offline Chat List</h3>
          <el-table
            :data="chatList2"
            style="width: 100%"
            max-Height="700px"
            cell-class-name="nowrap"
          >
            <el-table-column type="index" width="50" />
            <el-table-column prop="user_id" label="id" width="100" />
            <el-table-column prop="user_name" label="name" width="100" />
            <el-table-column label="message">
              <template #default="scope">
								<span style="white-space: nowrap;">
									{{ scope.row.content }}
								</span>
							</template>
            </el-table-column>
            <el-table-column label="chat" align="center">
              <template #default="scope">
                <el-button
                  size="mini"
                  type="primary"
                  @click="
                    $router.push({ name: 'Chat', params: { userId: scope.row.user_id } })
                  "
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
import { ElNotification } from "element-plus";
import http from "../../services/http";
export default {
  name: "ChatList",
  async created() {
    const { success, chatList, chatList2, errorMessage } = (await http.get("/chats/list")).data;
    this.sockets.subscribe("CHAT_MESSAGE", (msg) => {
      const { from_id, from_name, message, created_at } = msg;
      const target = this.chatList.find((chat) => chat.user_id === from_id);
      if (target) {
        target.message = message;
        target.created_at = created_at;
      } else {
        this.chatList.push({
          id: from_id,
          name: from_name,
          message,
          created_at,
        });
      }
      const target2 = this.chatList2.find((chat) => chat.user_id === from_id);
      if (target2) {
        target2.message = message;
        target2.created_at = created_at;
      } else {
        this.chatList2.push({
          id: from_id,
          name: from_name,
          message,
          created_at,
        });
      }
      this.chatList.reverse((a, b) => new Date(b.created_at) - new Date(a.created_at));
      this.chatList2.reverse((a, b) => new Date(b.created_at) - new Date(a.created_at));
      console.log(this.chatList);
      console.log(this.chatList2);
    });
    if (success) {
      this.chatList = chatList.reverse(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      this.chatList2 = chatList2.reverse(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
    } else {
      ElNotification({
        title: "Get chatlist error",
        message: errorMessage,
        type: "error",
      });
    }
  },
  beforeUnmount() {
    this.sockets.unsubscribe("CHAT_MESSAGE");
  },
  data() {
    return {
      chatList: [],
      chatList2: [],
    };
  },
};
</script>

<style scoped>
.chatList {
  height: 100%;
}
</style>