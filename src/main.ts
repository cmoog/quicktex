import katex from 'katex'
import { languages, editor } from 'monaco-editor'
import { initVimMode } from 'monaco-vim'

import completions from '../scripts/completions.json'
import { registerOptionsInputs } from './options'
import languageConfig from './languageConfiguration.json'
import famousEquations from './famousEquations.json'
import { clearHash, extractDataFromUrl, registerShareButton } from './url'

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

function randomizeInitialValue(): string {
    const equn =
        famousEquations[Math.floor(Math.random() * famousEquations.length)]
    return `% ${equn.name}\n${equn.formula}\n\n`
}

function mountEditor() {
    let editorDirty = false
    languages.register({ id: language })

    // TODO: add latex highlighting

    languages.registerCompletionItemProvider(language, {
        triggerCharacters: ['\\'],
        provideCompletionItems: provideCompletionItems,
    })
    languages.setLanguageConfiguration(
        language,
        languageConfig as unknown as languages.LanguageConfiguration
    )

    const editorDiv = document.getElementById('editor_target')
    const mathPreview = document.getElementById('mathPreview')

    const editorInstance = editor.create(editorDiv, {
        language,
        fontSize: 14,
        minimap: { enabled: false },
    })

    const render = () => {
        const raw = editorInstance.getValue()
        mathPreview.innerHTML = katex.renderToString(raw, {
            strict: false,
            displayMode: !inlineMode,
        })
    }

    const errorElementId = 'parseErrorMessage'
    let inlineMode = false

    const initialValue = extractDataFromUrl() || randomizeInitialValue()

    editorInstance.onDidChangeModelContent(() => {
        if (editorInstance.getValue() !== initialValue) {
            clearHash()
            editorDirty = true
        }

        try {
            render()
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
    editorInstance.setValue(initialValue)

    let vimDispose = () => {}

    registerOptionsInputs({
        vim: (checked) => {
            if (checked) {
                const vim = initVimMode(editorInstance, null) // document.getElementById('vimstatus'))
                vimDispose = () => vim.dispose()
            } else {
                vimDispose()
            }
        },
        inline: (checked) => {
            inlineMode = checked
            render()
        },
    })
    registerShareButton(() => editorInstance.getValue())

    // warn that editor contents will be reset during reload
    window.onbeforeunload = () =>
        editorDirty ? 'The contents of the editor will be lost.' : null
}

window.addEventListener('DOMContentLoaded', () => {
    mountEditor()
})
