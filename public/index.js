;(() => {
  //const ips = ["192.168.2.104"]
  //const n = ips.length
  const status_table = document.getElementById('status')
  const data_table = document.getElementById('data')

  var ips
  var n
  var map = {
    '85:ce': null,
    '86:04': null,
    '84:f3': null,
    '86:7f': null,
    '85:fe': null,
    '85:e6': null,
    '86:55': null,
    '86:28': null,
    '75:fa': null,
    '86:67': null,
  }

  class Stopwatch {
    constructor(id, delay=1000) { //Delay in ms
      this.state = "paused";
      this.delay = delay;
      this.display = document.getElementById(id);
      this.value = 0;
    }

    formatTime(ms) {
      var hours   = Math.floor(ms / 3600000);
      var minutes = Math.floor((ms - (hours * 3600000)) / 60000);
      var seconds = Math.floor((ms - (hours * 3600000) - (minutes * 60000)) / 1000);
      var ds = Math.floor((ms - (hours * 3600000) - (minutes * 60000) - (seconds * 1000))/100);
      if (hours   < 10) {hours   = "0"+hours;}
      if (minutes < 10) {minutes = "0"+minutes;}
      if (seconds < 10) {seconds = "0"+seconds;}
      //return hours+':'+minutes+':'+seconds+'.'+ds;
      return hours+':'+minutes+':'+seconds;
    }

    update() {
      if (this.state=="running") {
        this.value += this.delay;
      }
      this.display.innerHTML = this.formatTime(this.value);
      if (this.value > 5000) {
        this.display.style.color = "#FF0000"
      }
    }

    start() {
      if (this.state=="paused") {
        this.state="running";
        if (!this.interval) {
          var t=this;
          this.interval = setInterval(function(){t.update();}, this.delay);
        }
      }
    }

    stop() {
      if (this.state=="running") {
        this.state="paused";
        if (this.interval) {
          clearInterval(this.interval);
          this.interval = null;
        }
      }
    }

    reset() {
      this.stop();
      this.value=0;
      this.update();
    }
  }


  //function sortTable(table) {
  //  var table, rows, switching, i, x, y, shouldSwitch;
  //  table = document.getElementById(table);
  //  switching = true;
  //  /* Make a loop that will continue until
  //  no switching has been done: */
  //  while (switching) {
  //    // Start by saying: no switching is done:
  //    switching = false;
  //    rows = table.rows;
  //    /* Loop through all table rows (except the
  //    first, which contains table headers): */
  //    for (i = 1; i < (rows.length - 1); i++) {
  //      // Start by saying there should be no switching:
  //      shouldSwitch = false;
  //      /* Get the two elements you want to compare,
  //      one from current row and one from the next: */
  //      x = rows[i].getElementsByTagName("th")[0].innerHTML.split(".");
  //      x = parseInt([x.length - 1])
  //      y = rows[i + 1].getElementsByTagName("th")[0].innerHTML;
  //      y = parseInt([y.length - 1])
  //      // Check if the two rows should switch place:
  //      if (x > y) {
  //        // If so, mark as a switch and break the loop:
  //        shouldSwitch = true;
  //        break;
  //      }
  //    }
  //    if (shouldSwitch) {
  //      /* If a switch has been marked, make the switch
  //      and mark that a switch has been done: */
  //      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
  //      switching = true;
  //    }
  //  }
  //}

  function dial() {
    console.log(location.host)
    const conn = new WebSocket(`ws://${location.host}/andros/subscribe`)

    conn.addEventListener('close', ev => {
      console.log(`WebSocket Disconnected code: ${ev.code}, reason: ${ev.reason}`, true)
      if (ev.code !== 1001) {
        console.log('Reconnecting in 1s', true)
        setTimeout(dial, 1000)
      }
    })
    conn.addEventListener('open', ev => {
      console.info('websocket connected')
    })

    Object.keys(map).forEach(function(key) {
      var status_tr = status_table.insertRow(-1)
      var data_tr = data_table.insertRow(-1)
      map[key] = {
        data: data_tr,
        status: status_tr,
        stopwatch: null
      }
      status_tr.innerHTML = `
        <th></th>
        <th>${key}</th>
        <th>${new Date().toLocaleTimeString()}</th>
        <th id="${key}"></th>
        <th></th>
        <th></th>
        <th></th>
        <th></th>
        <th></th>
        <th></th>
        <th></th>
        <th></th>
        <th></th>
      `
      data_tr.innerHTML = `
        <th scope="col"></th>
        <th scope="col">${key}</th>
        <th scope="col"></th>
        <th scope="col"></th>
        <th scope="col"></th>
        <th scope="col"></th>
        <th scope="col"></th>
        <th scope="col"></th>
        <th scope="col"></th>
        <th scope="col"></th>
        <th scope="col"></th>
        <th scope="col"></th>
      `

      map[key].stopwatch = new Stopwatch(key)
      map[key].stopwatch.start()
    })

    //map = {}
    // This is where we handle messages received.
    conn.addEventListener('message', ev => {
      if (typeof ev.data !== 'string') {
        console.error('unexpected message type', typeof ev.data)
        return
      }
      if (ev.data.startsWith("ips")) {
        //console.log(ev.data)
        //ips = ev.data.split("\n")
        ////console.log(ips)
        //ips = ips.slice(1, -1)
        //n = ips.length
        //map = {}
        //status_table.innerHTML = `
        //  <tr>
        //    <th>Local IP</th>
        //    <th>MAC</th>
        //    <th>UPDATED</th>
        //    <th>GPS</th>
        //    <th>IMU</th>
        //    <th>AHT</th>
        //    <th>WIND</th>
        //    <th>BMP</th>
        //    <th>INA</th>
        //    <th>I2S</th>
        //    <th>UMC</th>
        //  </tr>
        //`
        //data_table.innerHTML = `
        //  <tr>
        //    <th colspan="1" rowspan="2" scope="colgroup">Local IP</th>
        //    <th colspan="1" rowspan="2" scope="colgroup">MAC</th>
        //    <th colspan="2" scope="colgroup">GPS</th>
        //    <th colspan="1" scope="colgroup">IMU</th>
        //    <th colspan="2" scope="colgroup">AHT</th>
        //    <th colspan="2" scope="colgroup">WIND</th>
        //    <th colspan="1" scope="colgroup">BMP</th>
        //    <th colspan="2" scope="colgroup">INA</th>
        //  </tr>
        //  <tr>
        //    <th scope="col">LONG</th>
        //    <th scope="col">LAT</th>
        //    <th scope="col">HEADING</th>
        //    <th scope="col">HUMID</th>
        //    <th scope="col">TEMP</th>
        //    <th scope="col">DIR</th>
        //    <th scope="col">SPEED</th>
        //    <th scope="col">PRESS</th>
        //    <th scope="col">VOLT</th>
        //    <th scope="col">POWER</th>
        //  </tr>
        //`
        //for (var i = 0; i < n; i++) {
        //  let ip = ips[i]
        //  console.log(ip)
        //  let status_tr = status_table.insertRow(-1)
        //  let data_tr = data_table.insertRow(-1)
        //  map[ip] = {
        //    data: data_tr,
        //    status: status_tr
        //  }
        //  status_tr.innerHTML = `
        //    <th>${ip}</th>
        //    <th></th>
        //    <th>${new Date().toLocaleTimeString()}</th>
        //    <th></th>
        //    <th></th>
        //    <th></th>
        //    <th></th>
        //    <th></th>
        //    <th></th>
        //    <th></th>
        //    <th></th>
        //  `
        //  data_tr.innerHTML = `
        //    <th scope="col">${ip}</th>
        //    <th scope="col"></th>
        //    <th scope="col"></th>
        //    <th scope="col"></th>
        //    <th scope="col"></th>
        //    <th scope="col"></th>
        //    <th scope="col"></th>
        //    <th scope="col"></th>
        //    <th scope="col"></th>
        //    <th scope="col"></th>
        //    <th scope="col"></th>
        //    <th scope="col"></th>
        //  `
        //}
      } else {
        //console.log(ev.data)
        //console.log(map)
        const s = ev.data.split(" ")
        const ip = s[0]
        const mac = s[1].slice(0, -1)
        //console.log(mac)
        const data_json = JSON.parse(s[2])
        const statuses = data_json.statuses
        const data = data_json.data

        Object.keys(statuses).forEach(function(key) {
          if(statuses[key] === null) {
            statuses[key] = 'None';
          }
        })
        Object.keys(data).forEach(function(key) {
          if(data[key] === null) {
            data[key] = 'None';
          }
        })

        //console.log(map)
        var status_tr
        var data_tr
        //console.log(mac)
        //console.log(typeof(mac))
        //console.log(map[mac])
        if (mac in map && map[mac] != null) {
          const trs = map[mac]
          status_tr = trs.status
          data_tr = trs.data
          trs.stopwatch = null
        } else {
          status_tr = status_table.insertRow(-1)
          data_tr = data_table.insertRow(-1)
          map[mac] = {
            data: data_tr,
            status: status_tr,
            stopwatch: null
          }
        }
        //const trs = map[ip]
        //const status_tr = trs.status
        //const data_tr = trs.data
        status_tr.innerHTML = `
          <th>${ip}</th>
          <th>${mac}</th>
          <th>${new Date().toLocaleTimeString()}</th>
          <th id="${mac}"></th>
          <th>${statuses.free}</th>
          <th>${statuses.gps}</th>
          <th>${statuses.imu}</th>
          <th>${statuses.aht}</th>
          <th>${statuses.wind}</th>
          <th>${statuses.bmp}</th>
          <th>${statuses.ina}</th>
          <th>${statuses.i2s}</th>
          <th>${statuses.umc}</th>
        `
        data_tr.innerHTML = `
          <th scope="col">${ip}</th>
          <th scope="col">${mac}</th>
          <th scope="col">${data.gps.longitude}</th>
          <th scope="col">${data.gps.latitude}</th>
          <th scope="col">${data.imu.angle}</th>
          <th scope="col">${data.aht.humidity}</th>
          <th scope="col">${data.aht.temperature}</th>
          <th scope="col">${data.wind.dir}</th>
          <th scope="col">${data.wind.speed}</th>
          <th scope="col">${data.bmp.pressure}</th>
          <th scope="col">${data.ina.bus_voltage}</th>
          <th scope="col">${data.ina.power}</th>
        `

        map[mac].stopwatch = new Stopwatch(mac)
        map[mac].stopwatch.start()
        //sortTable("status")
        //sortTable("data")
      }
    })
  }
  dial()

  //// appendLog appends the passed text to messageLog.
  //function appendLog(text, error) {
  //  const p = document.createElement('p')
  //  // Adding a timestamp to each message makes the log easier to read.
  //  p.innerText = `${new Date().toLocaleTimeString()}: ${text}`
  //  if (error) {
  //    p.style.color = 'red'
  //    p.style.fontStyle = 'bold'
  //  }
  //  messageLog.append(p)
  //  return p
  //}
  //appendLog('Submit a message to get started!')
  //
  //// onsubmit publishes the message from the user when the form is submitted.
  //publishForm.onsubmit = async ev => {
  //  ev.preventDefault()
  //
  //  const msg = messageInput.value
  //  if (msg === '') {
  //    return
  //  }
  //  messageInput.value = ''
  //
  //  expectingMessage = true
  //  try {
  //    const resp = await fetch('/publish', {
  //      method: 'POST',
  //      body: msg,
  //    })
  //    if (resp.status !== 202) {
  //      throw new Error(`Unexpected HTTP Status ${resp.status} ${resp.statusText}`)
  //    }
  //  } catch (err) {
  //    appendLog(`Publish failed: ${err.message}`, true)
  //  }
  //}
})()
