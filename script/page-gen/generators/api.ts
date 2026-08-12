import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { writeFileSafe, lowerFirst, upperFirst } from '../utils/fs-helpers.ts'
import { parseArgs, type CliOptions } from '../utils/args.ts'

const DEFAULT_API_ROOT = 'src/api'

export function buildContent(Entity: string): string {
  const entityLower = lowerFirst(Entity)
  return `import request from '@/utils/request'
import { createListAPI } from '@/utils/pageRequest.ts'

const ${entityLower}BaseUrl = ''

export const get${Entity}DataAPI = createListAPI<
  ${Entity}SearchParams,
  ${Entity}Data
>(\`\${${entityLower}BaseUrl}/list\`)

export const create${Entity}API = (data: ${Entity}FormData) =>
  request.post<BaseResponse>({ url: \`\${${entityLower}BaseUrl}\`, data })

export const get${Entity}DetailAPI = (id: string) =>
  request.get<DataResponse<${Entity}Data>>({ url: \`\${${entityLower}BaseUrl}/\${id}\` })

export const update${Entity}API = (data: ${Entity}FormData & { id: string }) =>
  request.put<BaseResponse>({ url: \`\${${entityLower}BaseUrl}\`, data })

export const delete${Entity}API = (data: { ids: Array<string> }) =>
  request.post<BaseResponse>({ url: \`\${${entityLower}BaseUrl}/delete\`, data })
`
}

/**
 * @returns 实际写入（或本应写入）的文件路径
 */
export function generate(
  entityName: string,
  opts: Partial<CliOptions> = {}
): string {
  const domainPath = opts.domain ? `${opts.domain}/` : ''
  const apiPrefix = lowerFirst(entityName)

  const apiPath = opts.out
    ? path.resolve(process.cwd(), opts.out)
    : path.resolve(
        process.cwd(),
        DEFAULT_API_ROOT,
        domainPath,
        `${apiPrefix}-api.ts`
      )

  writeFileSafe(apiPath, buildContent(upperFirst(entityName)))
  return apiPath
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url)
if (isMain) {
  const { positional, opts } = parseArgs(process.argv.slice(2))
  const entityName = positional[0]
  if (!entityName) {
    console.log(
      '用法: npx tsx generators/api.ts <EntityName> [--domain=xxx] [--out=相对路径]'
    )
    process.exit(1)
  }
  generate(entityName, opts)
}
