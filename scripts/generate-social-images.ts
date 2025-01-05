import path from 'path'
import puppeteer from 'puppeteer'

async function generateSocialImages() {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    const formats = [
        { name: 'og', width: 1200, height: 630 },
        { name: 'twitter', width: 1200, height: 600 }
    ]

    for (const format of formats) {
        await page.setViewport(format)
        await page.goto('http://localhost:5173/social-card')

        const element = await page.$('#social-card')
        if (element) {
            await element.screenshot({
                path: path.join('static', `${format.name}-image.png`),
                type: 'png'
            })
        }
    }

    await browser.close()
}

generateSocialImages()
