<template>
  <h3>Stripchat Username</h3>
  <input v-model="username" placeholder="lunagirl13" />
  <h3>Lovense IP</h3>
  <input v-model="lovenseIp" placeholder="192.168.10.104" />
  <button v-if="this.username == '' || this.lovenseIp == ''" class="disabled">
    Start
  </button>
  <div class="buttons" v-else-if="this.watching == false">
    <button class="enabled" @click="this.start()">Start</button>
  </div>
  <div class="buttons" v-else>
    <button class="stop" @click="this.stop()">Stop</button>
  </div>
  <button
    v-if="this.lovenseIp !== ''"
    class="test"
    @click="this.testConnection()"
  >
    Test connection
  </button>
  <br />
  <button class="clear" @click="this.clear()">Clear</button>
  <br />
  <div class="dropdown" @click="this.helpView = !this.helpView">
    <h3 class="dropdown-header">Info</h3>
    <div class="dropdown-body" v-if="this.helpView">
      This app was developed with the Lovense Edge 2 so it might not work with
      other toys. <br />
      <br />
      I imagine it won't work fully with any of the male masturbator toys as
      they have other functions other than vibrating which aren't being taken
      advantage of here. Maybe I'll add that in the future.
      <br />
      <br />
      <h3>How to connect?</h3>
      As of right now, you need to have the Lovense remote app installed on a
      device with bluetooth and connected to your toy(s) of choice <br />
      <br />
      Once you are on the Lovense Remote app and connected go to Me ➡ Settings ➡
      Enable Game Mode <br />
      <br />
      Then you should see a Local IP which you will enter in the "Lovense IP"
      field above.<br />
      <br />
      Now you are ready to enjoy. If you experience any issues feel free to open
      a issue on github.
    </div>
  </div>
</template>

<script>
// const shell = require("electron").shell;
const axios = require("axios");
export default {
  name: "App",
  data() {
    return {
      username: "",
      lovenseIp: "",
      watching: false,
      helpView: false,
    };
  },
  created() {
    axios({
      method: "get",
      url: "http://localhost:7345/api/iswatching",
    }).then((res) => {
      this.watching = res.data;
    });
    if (localStorage.getItem("username")) {
      this.username = localStorage.getItem("username");
      this.lovenseIp = localStorage.getItem("lovenseIp");
    }
  },
  methods: {
    async start() {
      localStorage.setItem("username", this.username);
      localStorage.setItem("lovenseIp", this.lovenseIp);
      await axios({
        method: "post",
        url: "http://localhost:7345/api/watchstreamer",
        data: {
          username: this.username,
          lovenseIp: this.lovenseIp,
        },
      })
        .then(() => {
          this.watching = true;
        })
        .catch((err) => {
          console.log(err);
          window.alert(err);
        });
    },
    async stop() {
      await axios({
        method: "post",
        url: "http://localhost:7345/api/stop",
      })
        .then(() => {
          this.watching = false;
        })
        .catch((err) => {
          console.log(err);
          window.alert(err);
        });
    },
    async testConnection() {
      await axios({
        method: "post",
        url: "http://" + this.lovenseIp + ":20010/command",
        data: {
          command: "Function",
          action: "Vibrate:" + 1,
          timeSec: 3,
          apiVer: 1,
        },
      });
    },
    async clear() {
      localStorage.clear();
      this.username = "";
      this.lovenseIp = "";
    },
    async checkBattery() {},
  },
};
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@300&display=swap");

#app {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  /* min-height: 100vh; */
  padding: 50px 0;
}
body {
  background-color: #202124;
  margin: 0;
}

* {
  font-family: "Source Code Pro", monospace;
  font-size: 1em;
  color: #fff;
}

input {
  text-align: center;
  background-color: #37393e;
  color: #fff;
  border: none;
  border-radius: 3px;

  padding: 0.5em;
  margin: 0.5em;
}

button {
  background-color: #1ed760;
  color: #fff;
  border: none;
  border-radius: 3px;

  padding: 0.5em;
  margin: 0.5em;

  cursor: pointer;
  min-width: 100px;

  transition: 0.2s;
}

.enabled:hover,
.stop:hover,
.test:hover {
  transform: scale(1.1);
}

.enabled:active {
  background-color: #149842;
}

.stop:active {
  background-color: #a2252d;
}

.test:active {
  background-color: #b92674;
}

.disabled {
  background-color: #37393e;
  color: #fff;
  border: none;
  border-radius: 3px;

  padding: 0.5em;
  margin: 0.5em;

  cursor: not-allowed;
}

.stop {
  background-color: #c62a34;
  color: #fff;
  border: none;
  border-radius: 3px;

  padding: 0.5em;
  margin: 0.5em;
}

.test {
  background-color: #e73092;
  color: #fff;
  border: none;
  border-radius: 3px;

  padding: 0.5em;
  margin: 0.5em;
}

.clear {
  background-color: #37393e;
  color: #fff;
  border: none;
  border-radius: 3px;

  padding: 0.5em;
  margin: 0.5em;
}

h3 {
  margin: 0;
}

.buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* Dropdown menu */
.dropdown {
  width: 400px;
  padding: 5px;

  text-align: center;
  background-color: #37393e;
  border-radius: 5px;

  cursor: pointer;
}
</style>
