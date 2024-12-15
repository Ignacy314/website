;(() => {
  const ips = ["192.168.2.104"]
  const n = ips.length
  const status_table = document.getElementById('status')
  const data_table = document.getElementById('data')
  var map = {}
  for (var i = 0; i < n; i++) {
    let ip = ips[i]
    console.log(ip)
    let status_tr = status_table.insertRow(-1)
    let data_tr = data_table.insertRow(-1)
    map[ip] = {
      data: data_tr,
      status: status_tr
    }
    status_tr.innerHTML = `
      <th>${ip}</th>
      <th>${new Date().toLocaleTimeString()}</th>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
    `
    data_tr.innerHTML = `
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
  }

  function dial() {
    const conn = new WebSocket(`ws://${location.host}/subscribe`)

    conn.addEventListener('close', ev => {
      appendLog(`WebSocket Disconnected code: ${ev.code}, reason: ${ev.reason}`, true)
      if (ev.code !== 1001) {
        appendLog('Reconnecting in 1s', true)
        setTimeout(dial, 1000)
      }
    })
    conn.addEventListener('open', ev => {
      console.info('websocket connected')
    })

    // This is where we handle messages received.
    conn.addEventListener('message', ev => {
      if (typeof ev.data !== 'string') {
        console.error('unexpected message type', typeof ev.data)
        return
      }
      const s = ev.data.split(" ")
      const ip = s[0]
      const data_json = JSON.parse(s[1])
      const statuses = data_json.statuses
      const data = data_json.data
      const trs = map[ip]
      const status_tr = trs.status
      const data_tr = trs.data
      status_tr.innerHTML = `
      <th>${ip}</th>
      <th>${new Date().toLocaleTimeString()}</th>
      <th>${statuses.gps}</th>
      <th>${statuses.imu}</th>
      <th>${statuses.aht}</th>
      <th>${statuses.wind}</th>
      <th>${statuses.bmp}</th>
      <th>${statuses.ina}</th>
    `
    data_tr.innerHTML = `
      <th scope="col">${ip}</th>
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
