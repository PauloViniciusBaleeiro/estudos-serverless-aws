'use strict';
const axios = require('axios')

class Handler {
  constructor({rekoSVC, translatorSVC}){
    this.rekoSVC = rekoSVC
    this.translatorSVC = translatorSVC
  }

  async detectImageLabels(buffer) {
    const result = await this.rekoSVC.detectLabels({
      Image: {
        Bytes: buffer
      }
    }).promise()

    const workingItems = result.Labels
      .filter(({ Confidence }) => Confidence >= 95)
    
    const names = workingItems
      .map(({ Name }) => Name)
      .join(' and ')
    
    return { names, workingItems }

  }

  async translateText(text) {
    const params = {
      SourceLanguageCode: 'en',
      TargetLanguageCode: 'pt',
      Text: text
    }

    const { TranslatedText } = await this.translatorSVC.translateText(params).promise()

    return TranslatedText.split(' e ')
  }

  formatTextResults(texts, workingItems) {
    const finalText = []
    for (const indexText in texts) {
      const nameInPortuguese = texts[indexText]
      const confidence = workingItems[indexText].Confidence
      finalText.push(
        ` ${confidence.toFixed(2)}% de ser do tipo ${nameInPortuguese}`
      )
    }
    return finalText.join('\n')
  }

  async getImageBuffer(imageURL) {
    const response = await axios.get(imageURL, {
      responseType: 'arraybuffer'
    })
    const buffer = Buffer.from(response.data, 'base64')
    
    return buffer
  }

  async main(event) {
    try {
      const {imageUrl} = event.queryStringParameters
      // const imgBuffer = await readFile('./img/bmw.jpeg')
      console.log('Downloading image...')
      const buffer = await this.getImageBuffer(imageUrl)
      console.log('Detecting labels...')
      const { names, workingItems } = await this.detectImageLabels(buffer)
      console.log('Translating to portuguese...')
      const translated = await this.translateText(names)
      console.log('Handling final object...')
      const finalText = this.formatTextResults(translated, workingItems)
      console.log('Finishing...')
      return {
        statusCode: 200,
        body: `A imagem tem\n`.concat(finalText)
      }
    } catch (err) {
      console.log('Error**', err.stack)
      return {
        statusCode: 500,
        body: 'Internal server error!'
      }
    }
  }
}

//factory
const AWS = require('aws-sdk');
const { stringify } = require('querystring');
const reko = new AWS.Rekognition()
const translate = new AWS.Translate()
const handler = new Handler({
  rekoSVC: reko,
  translatorSVC: translate
})

module.exports.main = handler.main.bind(handler);
