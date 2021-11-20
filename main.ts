import katex from 'katex'
import { languages, editor } from 'monaco-editor'
import completions from './scripts/completions.json'

const language = 'latex'

function provideCompletionItems(model, pos, ctx) {
    const word = model.getWordUntilPosition(pos)
    const range = {
        startLineNumber: pos.lineNumber,
        endLineNumber: pos.lineNumber,
        startColumn: word.startColumn - 1,
        endColumn: word.endColumn,
    }
    return {
        suggestions: symbolListToSuggestions(range),
    }
}

const cachedSuggestions = completions.map((completion) => {
    let preview = 'No preview available.'
    try {
        // TODO: fix this, currently not working
        preview = katex.renderToString(trimDollar(completion.rendered))
    } catch {}
    return {
        label: completion.symbol,
        detail: completion.comment,
        insertText: completion.symbol,
        documentation: {
            value: preview,
            isTrusted: true,
            supportHtml: true,
        },
    }
})

function symbolListToSuggestions(range) {
    return cachedSuggestions.map((sug) => ({
        kind: languages.CompletionItemKind.Constant,
        range,
        ...sug,
    }))
}

function trimDollar(str: string): string {
    if (str.length < 2) {
        return str
    }
    if (str[0] === '$') {
        str = str.substring(1)
    }
    if (str[str.length - 1] === '$') {
        str = str.substring(0, str.length - 1)
    }
    return str
}

function mountEditor() {
    languages.register({ id: language })

    // TODO: add latex highlighting

    languages.registerCompletionItemProvider(language, {
        triggerCharacters: ['\\'],
        provideCompletionItems: provideCompletionItems,
    })

    const editorDiv = document.getElementById('editor_target')
    const mathPreview = document.getElementById('mathpreview')

    const editorInstance = editor.create(editorDiv, {
        language,
        fontSize: 16,
        minimap: { enabled: false },
    })

    const errorElementId = 'parseErrorMessage'
    editorInstance.onDidChangeModelContent((event) => {
        try {
            mathPreview.innerHTML = katex.renderToString(
                editorInstance.getValue(),
                {
                    strict: false,
                    displayMode: true,
                }
            )
        } catch (e) {
            // TODO: make this display cleaner, should underline position in text editor
            const existingErr = document.getElementById(errorElementId)
            if (existingErr) {
                existingErr.innerHTML = `<strong>Error</strong>: ${JSON.stringify(
                    e
                )}`
            } else {
                const errDiv = document.createElement('div')
                errDiv.id = errorElementId
                errDiv.innerHTML = `<strong>Error</strong>: ${JSON.stringify(
                    e
                )}`
                mathPreview.appendChild(errDiv)
            }
        }
    })
    editorInstance.setValue('e^{i\\pi} + 1 = 0\n\n\n\n')
}

window.addEventListener('DOMContentLoaded', () => {
    mountEditor()
})
