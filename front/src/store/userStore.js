export default {
  namespaced: true,
  state: {
    id: '',
    name: '',
    connected: 0,
    friends: []
  },
  mutations: {
    updateUser(state, { id, name ,connected}) {
      state.id = id;
      state.name = name;
      state.connected = connected;
    },
    updateFriends(state, { friends }) {
      state.friends = [...friends];
    },
  },
};
