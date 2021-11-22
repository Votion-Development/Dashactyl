/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
async function userInfo (id) {
  if (!id) return { error: 'You have not provided a user ID.' } // temp err

  const req = await fetch(`/api/users/info/${id}`, {
    method: 'get'
  })

  return await req.json()
};

async function blacklistUser (id) {
  if (!id) return { error: 'You have not provided a user ID.' } // temp err

  const req = await fetch(`/api/users/blacklist/${id}`, {
    method: 'post'
  })

  return await req.json()
}

async function unblacklistUser (id) {
  if (!id) return { error: 'You have not provided a user ID.' } // temp err

  const req = await fetch(`/api/users/unblacklist/${id}`, {
    method: 'post'
  })

  return await req.json()
}

async function setCoins (id, coins, add_coins) {
  if (!id) return { error: 'You have not provided a user ID.' } // temp err

  const req = await fetch(`/api/users/${add_coins ? 'add' : 'set'}_coins/${id}`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({
      coins: coins
    })
  })

  return await req.json()
};

async function setPackage (id, pkg) {
  if (!id) return { error: 'You have not provided a user ID.' } // temp err

  const req = await fetch(`/api/resources/set_package/${id}`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({
      package: pkg
    })
  })

  return await req.json()
};

async function setResources (id, memory, disk, cpu, servers, add_resources) {
  if (!id) return { error: 'You have not provided a user ID.' }

  const req = await fetch(`/api/resources/${add_resources ? 'add' : 'set'}_resources/${id}`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({
      memory: memory,
      disk: disk,
      cpu: cpu,
      servers: servers
    })
  })

  return await req.json()
}

async function createCoupon (code, coins, memory, disk, cpu, servers) {
  const req = await fetch('/api/coupons/create_coupon', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({
      coupon: code,
      coins: coins,
      memory: memory,
      disk: disk,
      cpu: cpu,
      servers: servers
    })
  })

  return await req.json()
}

async function revokeCoupon (code) {
  if (!code) return { error: 'You have not provided a coupon code.' }

  const req = await fetch(`/api/coupons/revoke_coupon/${code}`, {
    method: 'delete',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    }
  })

  return await req.json()
}

async function createJ4R (j4r_id, server_id, days, memory, disk, cpu, servers) {
  const req = await fetch('/api/j4r/create', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({
      j4r_id: j4r_id,
      server_id: server_id,
      days: days,
      memory: memory,
      disk: disk,
      cpu: cpu,
      servers: servers
    })
  })

  return await req.json()
}

async function asyncAlert (func) { // temp func
  alert(JSON.stringify(await func))
};
