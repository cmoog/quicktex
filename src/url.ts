export function registerShareButton(editorDataGetter: () => string) {
    const button = document.getElementById('buttonShareUrl')
    button.addEventListener('click', async () => {
        const url = new URL(window.location.toString())
        url.hash = hashFromEditorData(editorDataGetter())
        try {
            await navigator.clipboard.writeText(url.toString())
        } catch (e) {
            alert(`failed to copy url "${url.toString()}": ${e}`)
        }
    })
}

export function popDataFromUrl(): string | null {
    try {
        const rawHash = window.location.hash
        clearHash()
        if (rawHash?.length > 0) {
            return decodeURIComponent(rawHash.substring(1))
        }
        return null
    } catch (e) {
        console.log('invalid url hash: ', e)
        return null
    }
}

function clearHash() {
    const url = new URL(window.location.toString())
    url.hash = ''
    window.history.pushState({}, null, url.toString())
}

export function hashFromEditorData(rawData: string) {
    return `#${encodeURIComponent(rawData)}`
}
