import { Marked } from 'https://deno.land/x/markdown@v2.0.0/mod.ts'
import { DOMParser } from 'https://deno.land/x/deno_dom/deno-dom-wasm.ts'

const source =
    'https://raw.githubusercontent.com/KaTeX/KaTeX/main/docs/support_table.md'

const raw = await (await fetch(source)).text()

const { content: html } = Marked.parse(raw)

const doc = new DOMParser().parseFromString(html, 'text/html')
const tables = doc?.getElementsByTagName('table')
const rows = tables
    ?.flatMap((table) => {
        const rows = table.getElementsByTagName('tr')
        return rows.flatMap((row) => {
            const data = row.getElementsByTagName('td')
            if (data.length === 3) {
                return {
                    symbol: data[0].innerText,
                    rendered: data[1].innerText,
                    comment: data[2].innerText,
                }
            }
            return null
        })
    })
    .filter((row) => row)

console.log(JSON.stringify(rows))

// deno run -A --unstable main.ts > completions.json
