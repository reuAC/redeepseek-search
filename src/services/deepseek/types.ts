/** 调用 DeepSeek API 所需的连接配置（由调用方注入，服务层不感知 UI / 存储） */
export interface ClientConfig {
  apiKey: string
  baseUrl: string
}

export interface SearchRequest {
  /** 1～128 个字符，支持 site: / lang: / after: 等搜索语法 */
  query: string
  /** 1～50，默认 10 */
  count?: number
  ori_question?: string
  localization?: string
  need_content?: boolean
}

export interface SearchResult {
  /** 0～3，>= 1.5 为优质结果 */
  rerank_score: number
  title: string
  url: string
  /** 100～200 字符，适合前端展示 */
  snippet: string
  /** 600～800 字符，适合模型阅读 */
  summary: string
  content: string
  site_name: string | null
  site_icon: string | null
  /** RFC 3339（UTC） */
  date: string | null
  /** 0～4，-1 表示未知，>= 3 为极权威 */
  authority: number
}

export interface SearchResponse {
  results: SearchResult[]
}

export interface FetchResponse {
  title: string
  /** Markdown 正文 */
  content: string
}

export interface TimedResult<T> {
  data: T
  /** 请求耗时（秒） */
  elapsed: number
}
