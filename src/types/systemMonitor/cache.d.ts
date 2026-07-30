export type RedisInfo = {
  redis_version: string
  redis_mode: 'standalone' | string
  tcp_port: number | string
  connected_clients: number | string
  uptime_in_days: number
  used_memory_human: string
  used_cpu_user_children: number | string
  maxmemory_human: string
  aof_enabled: string
  rdb_last_bgsave_status: string
  instantaneous_input_kbps: number | string
  instantaneous_output_kbps: number | string
}

export type CommandStatItem = {
  name: string
  value: number
}

export type RedisOverview = {
  info: RedisInfo
  dbSize: number
  commandStats: CommandStatItem[]
}

export type CacheNameItem = {
  cacheName: string
  remark: string | null
}

export type CacheKeyItem = {
  cacheKey: string
}

export type CacheValueDetail = {
  cacheName: string
  cacheKey: string
  cacheValue: string
}
