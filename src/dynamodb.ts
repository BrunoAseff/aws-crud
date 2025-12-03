import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'

export const TASKS_TABLE = process.env.TASKS_TABLE || 'Tasks'

const dynamoClient = new DynamoDBClient({})

export const ddbDocClient = DynamoDBDocumentClient.from(dynamoClient)


