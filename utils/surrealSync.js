const { SURREAL_WS_URL, SURREAL_NS, SURREAL_DB } = require('../config')

async function createSurrealClient(token) {
  return new Promise((resolve, reject) => {
    try {
      // ========== 抖音小程序 WebSocket 连接 ==========
      const socketTask = tt.connectSocket({
        url: SURREAL_WS_URL,
        header: {
          'content-type': 'application/json'
        }
      })

      const messageQueue = []
      const callbacks = new Map()
      let isConnected = false

      // ========== 连接成功 ==========
      socketTask.onOpen((res) => {
        console.log('[surreal] WebSocket 连接成功')
        isConnected = true

        // 发送队列消息
        while (messageQueue.length > 0) {
          const msg = messageQueue.shift()
          socketTask.send({ data: JSON.stringify(msg) })
        }

        initConnection().then(resolve).catch(reject)
      })

      // ========== 接收消息 ==========
      socketTask.onMessage((res) => {
        try {
          const response = JSON.parse(res.data)
          const cb = callbacks.get(response.id)
          if (!cb) return

          // 清理超时
          clearTimeout(cb.timeout)
          callbacks.delete(response.id)

          if (response.error) {
            cb.reject(new Error(response.error.message || 'SurrealDB 错误'))
          } else {
            cb.resolve(response.result)
          }
        } catch (err) {
          console.error('[surreal] 消息解析失败', err)
        }
      })

      socketTask.onError((err) => {
        console.error('[surreal] WebSocket 错误', err)
        reject(err)
      })

      socketTask.onClose(() => {
        isConnected = false
      })

      // ========== 初始化 NS / DB / 认证 ==========
      async function initConnection() {
        // await sendRequest('use', [SURREAL_NS, SURREAL_DB])
        await sendRequest('use', ['uniauth', 'uniauth'])

        if (token) {
          await sendRequest('authenticate', [token])
        }

        return {
          socketTask,
          close: () => socketTask.close(),
          query: (sql, vars = {}) => sendRequest('query', [sql, vars]),
          select: (thing) => sendRequest('select', [thing]),
          create: (thing, data) => sendRequest('create', [thing, data]),
          update: (thing, data) => sendRequest('update', [thing, data]),
          merge: (thing, data) => sendRequest('merge', [thing, data]),
          delete: (thing) => sendRequest('delete', [thing]),
        }
      }

      // ========== 发送请求（核心修复） ==========
      function sendRequest(method, params) {
        return new Promise((resolve, reject) => {
          const id = Date.now() + '_' + Math.random().toString(36).substr(2, 8)

          const req = { id, method, params }

          // 超时
          const timeout = setTimeout(() => {
            callbacks.delete(id)
            reject(new Error('请求超时'))
          }, 10000)

          // 保存回调
          callbacks.set(id, { resolve, reject, timeout })

          // 发送 or 入队
          if (isConnected) {
            socketTask.send({ data: JSON.stringify(req) })
          } else {
            messageQueue.push(req)
          }
        })
      }

    } catch (err) {
      console.error('[surreal] 创建客户端失败', err)
      reject(err)
    }
  })
}

// ───────────────────────────────────────────────────────────
// 用户同步
// ───────────────────────────────────────────────────────────
async function syncUser(token, user) {
  if (!token || !user?.openid) return

  try {
    const db = await createSurrealClient(token)
    const { openid, name = '', avatar = '', sex = null, city = '', province = '', country = '' } = user

    const exist = await db.select(`user:${openid}`)
    const createTime = exist?.[0]?.create_time || new Date().toISOString()

    await db.merge(`user:${openid}`, {
      openid,
      name,
      avatar,
      sex,
      city,
      province,
      country,
      source: 'tt-miniapp',
      create_time: createTime
    })

    console.log('[sync] 用户同步成功:', openid)
    await db.close()
  } catch (err) {
    console.error('[sync] 同步失败:', err)
  }
}

// ───────────────────────────────────────────────────────────
// 登录日志
// ───────────────────────────────────────────────────────────
async function logLogin(token, user) {
  if (!token || !user?.openid) return

  try {
    const db = await createSurrealClient(token)
    const { openid, name = '', avatar = '', sex, city, province, country, unionid = '' } = user

    await db.create('login_log', {
      openid,
      name,
      avatar,
      sex,
      city,
      province,
      country,
      unionid,
      source: 'tt-miniapp',
      login_time: new Date().toISOString()
    })

    console.log('[sync] 登录日志写入成功')
    await db.close()
  } catch (err) {
    console.error('[sync] 日志写入失败:', err)
  }
}

module.exports = { syncUser, logLogin, createSurrealClient }