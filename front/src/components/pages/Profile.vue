<template>
<h1>PROFILE</h1> 
<div>id : {{id}}</div>
<div>name : {{name}}</div>

</template>
<script>
import { mapState } from "vuex";

export default {
  name: "Profile",
	computed: {
		...mapState('user', ['name', 'id']),
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


