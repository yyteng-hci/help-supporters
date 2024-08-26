/*
 * To use in the real world, run the following command in separate terminal AFTER running "$ node server.js":
 * $ ngrok http 3000
 */

// imports
const EventEmitter = require("events");
const express = require("express");
const app = express();
// create new http server
const http = require("http");
const httpServer = http.createServer(app);
// create new websocket server
const { Server } = require("socket.io");
const websocketServer = new Server(httpServer);

// serve HTML files if we get a GET request
app.get("/dashboard", function (request, response) {
  response.sendFile(__dirname + "/dashboard.html");
});

app.get("/display", function (request, response) {
  response.sendFile(__dirname + "/display.html");
});

// websocket stuff
const urls = [
  "https://i.ibb.co/Ky3fFLZ/00.png",
  "https://i.ibb.co/RzVpXVc/01.png",
  "https://i.ibb.co/SXcFVMX/02.png",
  "https://i.ibb.co/PmMZZFd/03.png",
  "https://i.ibb.co/FYrLFCy/04.png",
  "https://i.ibb.co/FgfJzX9/05.png",
  "https://i.ibb.co/ynbFtY3/06.png",
  "https://i.ibb.co/LJrMDkT/07.png",
  "https://i.ibb.co/nRxKkVJ/08.png",
  "https://i.ibb.co/WDnPy3V/09.png",
  "https://i.ibb.co/mXMVbdZ/10.png",
  "https://i.ibb.co/PDnzCHG/11.png",
  "https://i.ibb.co/JkL6kJw/12.png",
  "https://i.ibb.co/CHLdjQs/13.png",
  "https://i.ibb.co/GMjFCpt/14.png",
  "https://i.ibb.co/VQ18GdZ/15.png",
  "https://i.ibb.co/M7gf8Lq/16.png",
  "https://i.ibb.co/0mV83cM/17.png",
  "https://i.ibb.co/Gxccpbv/18.png",
  "https://i.ibb.co/M1S7V5d/19.png",

  "https://i.ibb.co/jGwYGBj/20.png",
  "https://i.ibb.co/FWpxcM7/21.png",
  "https://i.ibb.co/BgRMyCH/22.png",
  "https://i.ibb.co/yh5bhXK/23.png",
  "https://i.ibb.co/SJYs1sh/24.png",
  "https://i.ibb.co/fkXqHyt/25.png",
  "https://i.ibb.co/CKK9r9d/26.png",
  "https://i.ibb.co/TWrZ9md/27.png",
  "https://i.ibb.co/QpPLyz0/28.png",
  "https://i.ibb.co/mHzNdB8/29.png",
  "https://i.ibb.co/0JS7J8h/30.png",
  "https://i.ibb.co/cLMHXJ1/31.png",
  "https://i.ibb.co/4sqb6xW/32.png",
  "https://i.ibb.co/nBrf3Yt/33.png",
  "https://i.ibb.co/jfdF2KF/34.png",
  "https://i.ibb.co/m5S3pqb/35.png",
  "https://i.ibb.co/LhFK8H2/36.png",
  "https://i.ibb.co/wWV50mx/37.png",
  "https://i.ibb.co/vZfgg4L/38.png",
  "https://i.ibb.co/C2Fw6hf/39.png",

  "https://i.ibb.co/qmNhSVv/40.png",
  "https://i.ibb.co/xfcPF4Z/41.png",
  "https://i.ibb.co/VLXtmMV/42.png",
  "https://i.ibb.co/Gt6DVxy/43.png",
  "https://i.ibb.co/ng8W40Q/44.png",
  "https://i.ibb.co/r0wfYbn/45.png",
  "https://i.ibb.co/R3LbjgV/46.png",
  "https://i.ibb.co/8sL7Fc8/47.png",
  "https://i.ibb.co/7pCrfL9/48.png",
  "https://i.ibb.co/HPJCjq7/49.png",
  "https://i.ibb.co/1ncqrTn/50.png",
  "https://i.ibb.co/dQG91z8/51.png",
  "https://i.ibb.co/MPv98mM/52.png",
  "https://i.ibb.co/0y7CN0c/53.png",
  "https://i.ibb.co/2j8c0WS/54.png",
  "https://i.ibb.co/XV0p8GY/55.png",
  "https://i.ibb.co/LZxWfvg/56.png",
  "https://i.ibb.co/0XFYBFw/57.png",
  "https://i.ibb.co/d0PbKwX/58.png",
  "https://i.ibb.co/hsWk0gs/59.png",

  "https://i.postimg.cc/ncrGVM7S/60.png",
  "https://i.postimg.cc/Fs6gYmVr/61.png",
  "https://i.postimg.cc/Z5yP3gwr/62.png",
  "https://i.postimg.cc/SRsCKtXY/63.png",
  "https://i.postimg.cc/85wLNVCV/64.png",
  "https://i.postimg.cc/85TL2CNH/65.png",
  "https://i.postimg.cc/KjHL3rLq/66.png",
  "https://i.postimg.cc/d028NCP3/67.png",
  "https://i.postimg.cc/rpX19JH7/68.png",
  "https://i.postimg.cc/4xttnc3P/69.png",
  "https://i.postimg.cc/658CJgJD/70.png",
  "https://i.postimg.cc/7hfJ4Gcg/71.png",
  "https://i.postimg.cc/yd6Sfryp/72.png",
  "https://i.postimg.cc/HsFXpzTj/73.png",
  "https://i.postimg.cc/jjbffjwb/74.png",
  "https://i.postimg.cc/g0HZHP86/75.png",
  "https://i.postimg.cc/NMN2Z7Ns/76.png",
  "https://i.postimg.cc/hPQQ3mVn/77.png",
  "https://i.postimg.cc/x8hJ1jDB/78.png",
  "https://i.postimg.cc/tRMV5kZD/79.png",

  "https://i.ibb.co/WNXWmWQ/80.png",
  "https://i.ibb.co/Q9vhkMP/81.png",
  "https://i.ibb.co/BVyBVt3/82.png",
  "https://i.ibb.co/JpmZ82D/83.png",
  "https://i.ibb.co/K7wr4C1/84.png",
  "https://i.ibb.co/k0R60rK/85.png",
  "https://i.ibb.co/JKm30q9/86.png",
  "https://i.ibb.co/nRFzzrj/87.png",
  "https://i.ibb.co/JC3gybV/88.png",
  "https://i.ibb.co/JvVQFcT/89.png",
  "https://i.ibb.co/Zf3J1qf/90.png",
  "https://i.ibb.co/yQq9HQ9/91.png",
  "https://i.ibb.co/rk7GbYt/92.png",
  "https://i.ibb.co/3hYCxnK/93.png",
  "https://i.ibb.co/XS6HFzn/94.png",
  "https://i.ibb.co/BGmPtzs/95.png",
  "https://i.ibb.co/BwxFfqY/96.png",
  "https://i.ibb.co/3yF2XqV/97.png",
  "https://i.ibb.co/bRBbC1Z/98.png",
  "https://i.ibb.co/Q6FRK0T/99.png",

  "https://i.ibb.co/smTSxqF/100.png",
  "https://i.ibb.co/Sw03L0m/101.png",
  "https://i.ibb.co/7SZ3tjt/102.png",
  "https://i.ibb.co/myGcBbQ/103.png",
  "https://i.ibb.co/2PpRtHG/104.png",
  "https://i.ibb.co/pPGym1r/105.png",
  "https://i.ibb.co/ZMVMC5z/106.png",
  "https://i.ibb.co/d5RJ3Q2/107.png",
  "https://i.ibb.co/r6Nr8pJ/108.png",
  "https://i.ibb.co/LCM8SsN/109.png",
  "https://i.ibb.co/9tk7Xnr/110.png",
  "https://i.ibb.co/741Ls50/111.png",
  "https://i.ibb.co/6vyCp3K/112.png",
  "https://i.ibb.co/dBCnY9B/113.png",
  "https://i.ibb.co/w41Fmcp/114.png",
  "https://i.ibb.co/4s0PGJv/115.png",
  "https://i.ibb.co/FKCgk8Q/116.png",
  "https://i.ibb.co/S3GgKft/117.png",
  "https://i.ibb.co/MPMrMVX/118.png",
  "https://i.ibb.co/WPmcGyH/119.png",
];

const ee = new EventEmitter();
websocketServer.on("connection", function (socket) {
  socket.on("dashboard connected", function () {
    console.log("dashboard connected");
  });

  socket.on("display connected", function () {
    console.log("display connected");

    // send the display socket to the dashboard socket code below
    ee.emit("display connected event", socket);
  });

  ee.on("display connected event", function (display_socket) {
    let dashboard_socket = socket;
    dashboard_socket.on("dashboard button click", function (index) {
      console.log("Button " + index + " has been clicked!");

      display_socket.emit("display image url", urls[index]);
    });
  });
});

// begin listening on localhost at port 3000
httpServer.listen(3000, function () {
  console.log("listening on *:3000");
});
