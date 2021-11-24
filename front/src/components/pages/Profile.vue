<template>
<h1>PROFILE</h1> 
<div>id : {{id}}</div>
<div>name : {{name}}</div>
<div>connected : {{connected}}</div>

</template>
<script>
import { mapState } from "vuex";

export default {
  name: "Profile",
	computed: {
		...mapState('user', ['name', 'id', 'connected']),
	},
  data() {
    return {
    };
  },
  async created() {
    console.log("hi");
  },
};
</script>


