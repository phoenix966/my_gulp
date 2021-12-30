const fetch = require('node-fetch');
const { pipeline } = require('stream');
const { promisify } = require('util');
const { appendFileSync, createWriteStream, readFileSync, existsSync, mkdirSync } = require('fs');


const defaultOptions = {
    fontsUrl: '',
    cssFilePath: './src/scss/_fonts.scss',
    downloadFontsDir: './build/fonts/',
    cssFontPath: '../fonts/',
    fontsForDownload: ['ttf','woff','woff2'],
}

// downloadFonts({downloadFontsDir:'./src/fonts/'})

module.exports =  async function downloadFonts(options = defaultOptions) {
    options = { ...defaultOptions, ...options }

    //read file option for Yury
    if (!options.fontsUrl) {
        try {
            options.fontsUrl = readFileSync('./fonts.list','utf-8')
        } catch (error) {
            console.warn('Failed to open file: ./fonts.list . Please make sure the file exists')
            process.exit({code: 0})
        }
    }

    const taskTemplates = [
        {
            format: 'ttf',
            fetchOptions: {}
        },
        {
            format: 'woff',
            fetchOptions: {
                headers: {
                    'User-Agent': 'Mozilla/4.0 (Windows NT 6.2; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/32.0.1667.0 Safari/537.36',
                }
            }
        },
        {
            format: 'woff2',
            fetchOptions: {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 6.2; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.106 Safari/537.36',
                }
            }
        }
    ]

    if (!options.fontsUrl.match(/(((https?:\/\/)|(www\.))[^)]+)/g)) {
        return console.log('Invalid URL!')
    }
    options.fontsUrl = (options.fontsUrl.match(/(((https?:\/\/)|(www\.))[^)]+)/g))[0]

    for (const [_, format] of options.fontsForDownload.entries()) {
        for (const [id, task] of taskTemplates.entries()) {
            if (format === task.format) {
                await runTask(options.fontsUrl, task, options)
            }
        }
    }

    console.log('All done!')
}

async function runTask(url, task, options) {
    let cssFile = await fetchCss(url, task.fetchOptions)
    let fonts = {}

    //parsing css, getting arrays of properties
    fonts.fontFamily = cssFile.match(/((font-family)[^;]+)/g).map(item => item.replace(/(font-family?: )|(')|( )/g, ''))
    fonts.fontStyle = cssFile.match(/((font-style)[^;]+)/g).map(item => item.replace('font-style: ', ''))
    fonts.fontWeight = cssFile.match(/((font-weight)[^;]+)/g).map(item => item.replace('font-weight: ', ''))
    fonts.src = cssFile.match(/(((https?:\/\/)|(www\.))[^)]+)/g)

    //download font, write to folder and edit font path in temporary css file
    for (const [id, item] of fonts.src.entries()) {
        const currentFontFolder = fonts.fontFamily[id] + '/'
        const fontName = `${fonts.fontFamily[id]}-${fonts.fontStyle[id]}-${fonts.fontWeight[id]}.${task.format}`
        const fontFullPath = options.downloadFontsDir + currentFontFolder + fontName
        const fontDir = options.downloadFontsDir + currentFontFolder

        task.format === 'ttf' && downloadAndSaveFont(fonts.src[id], fontDir, fontFullPath)

        //hack for woff2 styles
        if (task.format === 'woff2') {
            return
        }
        else if (task.format === 'woff') {
            const woff2Template = `url(${options.cssFontPath + currentFontFolder + fontName.replace('woff', 'woff2')}) format('woff2'),
            url(${options.cssFontPath + currentFontFolder + fontName})`
            cssFile = cssFile.replace(`url(${fonts.src[id]})`, woff2Template)
        }
        else {
            cssFile = cssFile.replace(`${fonts.src[id]}`, options.cssFontPath + currentFontFolder + fontName)
        }
        // cssFile = cssFile.replace(`${fonts.src[id]}`, options.cssFontPath + currentFontFolder + fontName)
    }

    //adding new data to the css
    task.format === 'woff' && appendFileSync(options.cssFilePath, cssFile + '\n')//prevent write woff2 styles to css file
}

async function fetchCss(url, options) {
    const response = await fetch(url, options)
    const css = await response.text()
    return css
}

async function downloadAndSaveFont(url, dirPath, fullFilePath) {
    const fontFile = await fontFetch(url)
    await writeFileToFolder(fontFile, dirPath, fullFilePath)
}

async function fontFetch(fontUrl) {
    const response = await fetch(fontUrl)
    return response.body
}

async function writeFileToFolder(target, fileDir, filePath) {
    const streamPipeline = promisify(pipeline)
    if (!existsSync(fileDir)) {
        mkdirSync(fileDir, { recursive: true });
    }
    await streamPipeline(target, createWriteStream(filePath))
}