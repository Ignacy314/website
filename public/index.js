;(() => {
  const status_table = document.getElementById('status')
  const data_table = document.getElementById('data')

  var ips
  var n
  var modules = {
    //'85:ce': null,
    //'86:46': null,
    //'84:f3': null,
    //'86:7f': null,
    //'85:fe': null,
    //'85:e6': null,
    //'86:55': null,
    //'86:28': null,
    //'75:fa': null,
    //'86:67': null,
  }

  class Stopwatch {
    constructor(id, delay=1000) { //Delay in ms
      this.state = "paused";
      this.delay = delay;
      this.display = document.getElementById(id);
      this.value = 0;
      this.started = null;
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
        //this.value += this.delay;
        this.value = new Date() - this.started
      }
      //this.display.innerHTML = "<div>" + this.formatTime(this.value) + "</div>";
      if (this.value >= 7000) {
        this.display.innerHTML = "<div style='color: red'>" + this.formatTime(this.value) + "</div>";
        //this.display.style.color = "#FF0000"
      } else {
        this.display.innerHTML = "<div>" + this.formatTime(this.value) + "</div>";
      }
    }

    start() {
      if (this.state=="paused") {
        this.state="running";
        this.started = new Date();
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

  function reset() {
    status_table.innerHTML = `
      <tr>
        <th>Local IP</th>
        <th>MAC</th>
        <th>UPDATED</th>
        <th>SINCE</th>
        <th>FREE[GB]</th>
        <th>CPU[%]</th>
        <th>TEMP[C]</th>
        <th>GPS</th>
        <th>IMU</th>
        <th>AHT</th>
        <th>WIND</th>
        <th>BMP</th>
        <th>INA</th>
        <th>I2S</th>
        <th>UMC</th>
        <th>MAX I2S</th>
        <th>MAX UMC</th>
        <th>WRITE</th>
        <th>DRONE</th>
      </tr>
    `

    data_table.innerHTML = `
      <tr>
        <th colspan="1" rowspan="2" scope="colgroup">Local IP</th>
        <th colspan="1" rowspan="2" scope="colgroup">MAC</th>
        <th colspan="2" scope="colgroup">GPS</th>
        <th colspan="1" scope="colgroup">IMU</th>
        <th colspan="2" scope="colgroup">AHT</th>
        <th colspan="2" scope="colgroup">WIND</th>
        <th colspan="1" scope="colgroup">BMP</th>
        <th colspan="3" scope="colgroup">INA</th>
      </tr>
      <tr>
        <th scope="col">LONG</th>
        <th scope="col">LAT</th>
        <th scope="col">HEADING</th>
        <th scope="col">HUMID</th>
        <th scope="col">TEMP</th>
        <th scope="col">DIR</th>
        <th scope="col">SPEED</th>
        <th scope="col">hPa</th>
        <th scope="col">mV</th>
        <th scope="col">mA</th>
        <th scope="col">CHARGE</th>
      </tr>
    `
    modules = {
      '85:ce': null,
      '86:46': null,
      '84:f3': null,
      '86:7f': null,
      '85:fe': null,
      '85:e6': null,
      '86:55': null,
      '86:28': null,
      '75:fa': null,
      '85:c8': null,
      //'86:67': null,
    }

    Object.keys(modules).forEach(function(key, i) {
      var status_tr = status_table.insertRow(-1)
      var data_tr = data_table.insertRow(-1)
      const okIcon = icon((i+4).toString(), markerStyleGreen)
      const noDataIcon = icon((i+4).toString(), markerStyleBlue)
      modules[key] = {
        data: data_tr,
        status: status_tr,
        stopwatch: null,
        //marker: L.marker([52.40997, 16.93180 + (i / 10000)]).addTo(map).setIcon(noDataIcon).bindPopup(key),
        marker: null,
        okIcon: okIcon,
        noDataIcon: noDataIcon,
        droneIcon: null,
      }
      status_tr.innerHTML = `
        <th></th>
        <th>${key}</th>
        <th>${new Date().toLocaleTimeString()}</th>
        <th id="${key}">00:00:00</th>
        <th></th>
        <th></th>
        <th></th>
        <th></th>
        <th></th>
        <th></th>
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
        <th scope="col"></th>
      `

      modules[key].stopwatch = new Stopwatch(key)
      modules[key].stopwatch.start()
    })
  }

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
      reset()
      console.info('websocket connected')
    })

    reset()

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
        const s = ev.data.split(" ")
        const ip = s[0]
        const mac = s[1].slice(0, -1)
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

        var status_tr
        var data_tr
        if (mac in modules && modules[mac] != null) {
          const trs = modules[mac]
          status_tr = trs.status
          data_tr = trs.data
          trs.stopwatch = null
        } else {
          status_tr = status_table.insertRow(-1)
          data_tr = data_table.insertRow(-1)
          modules[mac] = {
            data: data_tr,
            status: status_tr,
            stopwatch: null
          }
        }

        var drone
        if (statuses.drone_detected) {
          console.log(statuses)
          var lat = Number((statuses.drone_coords.lat).toFixed(7))
          var lon = Number((statuses.drone_coords.lon).toFixed(7))
          drone = lon.toString() + ", " + lat.toString()
        } else {
          drone = "None"
        }

        status_tr.innerHTML = `
          <th>${ip}</th>
          <th>${mac}</th>
          <th>${new Date().toLocaleTimeString()}</th>
          <th id="${mac}">00:00:00</th>
          <th>${statuses.free}</th>
          <th>${statuses.cpu_usage}</th>
          <th>${statuses.temp}</th>
          <th>${statuses.gps}</th>
          <th>${statuses.imu}</th>
          <th>${statuses.aht}</th>
          <th>${statuses.wind}</th>
          <th>${statuses.bmp}</th>
          <th>${statuses.ina}</th>
          <th>${statuses.i2s}</th>
          <th>${statuses.umc}</th>
          <th>${statuses.max_i2s}</th>
          <th>${statuses.max_umc}</th>
          <th>${statuses.writing}</th>
          <th>${drone}</th>
        `
        var hasNewGps = true
        try {
          long = Number((data.gps.longitude).toFixed(7))
        } catch (error) {
          long = "undefined"
          hasNewGps = false
        }
        try {
          lat = Number((data.gps.latitude).toFixed(7))
        } catch (error) {
          lat = "undefined"
          hasNewGps = false
        }
        try {
          angle = Number((data.imu.angle).toFixed(7))
        } catch (error) {
          angle = "undefined"
        }
        try {
          hum = Number((data.aht.humidity).toFixed(7))
        } catch (error) {
          hum = "undefined"
        }
        try {
          temp = Number((data.aht.temperature).toFixed(7))
        } catch (error) {
          temp = "undefined"
        }
        try {
          press = Number((data.bmp.pressure).toFixed(7))
        } catch (error) {
          press = "undefined"
        }
        try {
          if (typeof data.ina.charge === 'string' || data.ina.charge instanceof String) {
            charge = data.ina.charge
          } else if ('Charging' in data.ina.charge) {
            charge = "Charging: " + data.ina.charge['Charging'] + "%"
          } else {
            charge = "Discharging: " + data.ina.charge['Discharging'] + "%"
          }
        } catch {
          charge = "undefined"
        }
        data_tr.innerHTML = `
          <th scope="col">${ip}</th>
          <th scope="col">${mac}</th>
          <th scope="col">${long}</th>
          <th scope="col">${lat}</th>
          <th scope="col">${angle}</th>
          <th scope="col">${hum}</th>
          <th scope="col">${temp}</th>
          <th scope="col">${data.wind.dir}</th>
          <th scope="col">${data.wind.speed}</th>
          <th scope="col">${press}</th>
          <th scope="col">${data.ina.bus_voltage}</th>
          <th scope="col">${data.ina.power}</th>
          <th scope="col">${charge}</th>
        `

        if (hasNewGps) {
          if (modules[mac].marker == null) {
            modules[mac].marker = L.marker([lat, long]).addTo(map).setIcon(modules[mac].okIcon).bindPopup(mac)
          } else {
            modules[mac].marker.setLatLng(L.latLng(lat, long))
            modules[mac].marker.setIcon(modules[mac].okIcon)
          }
        } else if (modules[mac].marker != null) {
          modules[mac].marker.setIcon(modules[mac].noDataIcon)
        }

        // TODO: if drone detected change marker icon

        modules[mac].stopwatch = new Stopwatch(mac)
        modules[mac].stopwatch.start()
      }
    })
  }

  const green = '#65d817'
  const markerStyleGreen = `
    background-color: ${green};
    width: 1.5rem;
    height: 1.5rem;
    display: block;
    left: -0.75rem;
    top: -0.75rem;
    position: relative;
    border-radius: 1.5rem 1.5rem 0;
    transform: rotate(45deg);
    border: 1px solid #FFFFFF
  `

  const blue = '#2f54ce'
  const markerStyleBlue = `
    background-color: ${blue};
    width: 1.5rem;
    height: 1.5rem;
    display: block;
    left: -0.75rem;
    top: -0.75rem;
    position: relative;
    border-radius: 1.5rem 1.5rem 0;
    transform: rotate(45deg);
    border: 1px solid #FFFFFF
  `

  const labelStyles=[
  `
    transform: rotate(-45deg);
    display: block;
    position: relative;
    left: 0.29rem;
    top: -0.40rem;
    font-size: 1rem
  `,
  `
    transform: rotate(-45deg);
    display: block;
    position: relative;
    left: 0.10rem;
    top: -0.15rem;
    font-size: 1rem
  `,
  ]

  function icon(label, markerStyle) {
    const index = label.length - 1
    return L.divIcon({
      className: `${label}Icon`,
      iconAnchor: [0, 24],
      labelAnchor: [0, 0],
      popupAnchor: [0, -36],
      html: `<span style="${markerStyle}" />  <div style="${labelStyles[index]}">${label}</div>`
    })
  }

  const map = L.map('map').setView([52.40826, 16.93358], 13);
  //map.gestureHandling.enable()

  const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxNativeZoom: 19,
    maxZoom: 25,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  function centerModules() {
    var arr = [];
    for (let m in modules) {
      if (modules[m].marker != null) {
        arr.push(modules[m].marker)
      }
    }
    var group = new L.featureGroup(arr);
    map.fitBounds(group.getBounds().pad(0.25));
  }

  document.getElementById("centerButton").onclick = centerModules

  dial()
})()
