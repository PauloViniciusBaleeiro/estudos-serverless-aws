const uuid = require('uuid')
class Handler {
  constructor({ dynamoDbSVC }) {
    this.dynamoDbSVC = dynamoDbSVC    
    this.dynamoTable = process.env.DYNAMO_TABLE
  }

  async insertItem(params) {
    return this.dynamoDbSVC.put(params).promise()
  }
  prepareData(data) {
    const params = {
      TableName: this.dynamoTable,
      Item: {
        ...data,
        id: uuid.v1(),
        createdAt: new Date().toISOString()
      }
    }
    return params
  }

  handlerSuccess(data) {
    const response = {
      statusCode: 200,
      body: JSON.stringify(data)
    }
    return response
  }

  handlerError(data) {
    return {
      statusCode: data.statusCode || 501,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Could\'t create item!'
    }
  }

  async main(event) {
    try {
      const data = JSON.parse(event.body)
      const dbParams = this.prepareData(data)
      await this.insertItem(dbParams)
      return this.handlerSuccess(dbParams.Item)
    } catch (err) { 
      console.error('Deu ruim**', err.stack)
      return this.handlerError({ statusCode: 500 })        
    }
  }
}

// factory
const AWS = require('aws-sdk')
const dynamoDb = new AWS.DynamoDB.DocumentClient()
const handler = new Handler({
  dynamoDbSVC: dynamoDb
})
module.exports = handler.main.bind(handler)