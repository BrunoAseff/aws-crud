import type { Hono } from 'hono'
import {
  PutCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand
} from '@aws-sdk/lib-dynamodb'
import { v4 as uuidv4 } from 'uuid'
import { ddbDocClient, TASKS_TABLE } from '../dynamodb'

export type Task = {
  id: string
  title: string
  description: string
  date: string
}

export type TaskInput = {
  title: string
  description: string
  date: string
}

export const registerTaskRoutes = (app: Hono) => {

  app.post('/tasks', async (c) => {
    const body = await c.req.json<TaskInput>().catch(() => null)

    if (!body || !body.title || !body.description || !body.date) {
      return c.json(
        { message: 'Campos obrigatórios: title, description, date' },
        400
      )
    }

    const id = uuidv4()
    const newTask: Task = { id, ...body }

    await ddbDocClient.send(
      new PutCommand({
        TableName: TASKS_TABLE,
        Item: newTask
      })
    )

    return c.json(newTask, 201)
  })

  app.get('/tasks/:id', async (c) => {
    const id = c.req.param('id')

    const result = await ddbDocClient.send(
      new GetCommand({
        TableName: TASKS_TABLE,
        Key: { id }
      })
    )

    if (!result.Item) {
      return c.json({ message: 'Task not found' }, 404)
    }

    return c.json(result.Item as Task)
  })

  app.put('/tasks/:id', async (c) => {
    const id = c.req.param('id')
    const body = await c.req.json<Partial<TaskInput>>().catch(() => null)

    if (!body || (!body.title && !body.description && !body.date)) {
      return c.json(
        { message: 'Informe pelo menos um campo para atualizar: title, description ou date' },
        400
      )
    }

    const updateExpressions: string[] = []
    const expressionAttributeNames: Record<string, string> = {}
    const expressionAttributeValues: Record<string, unknown> = {}

    if (body.title !== undefined) {
      updateExpressions.push('#title = :title')
      expressionAttributeNames['#title'] = 'title'
      expressionAttributeValues[':title'] = body.title
    }

    if (body.description !== undefined) {
      updateExpressions.push('#description = :description')
      expressionAttributeNames['#description'] = 'description'
      expressionAttributeValues[':description'] = body.description
    }

    if (body.date !== undefined) {
      updateExpressions.push('#date = :date')
      expressionAttributeNames['#date'] = 'date'
      expressionAttributeValues[':date'] = body.date
    }

    const result = await ddbDocClient.send(
      new UpdateCommand({
        TableName: TASKS_TABLE,
        Key: { id },
        UpdateExpression: 'SET ' + updateExpressions.join(', '),
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW'
      })
    )

    if (!result.Attributes) {
      return c.json({ message: 'Task not found' }, 404)
    }

    return c.json(result.Attributes as Task)
  })

  app.delete('/tasks/:id', async (c) => {
    const id = c.req.param('id')

    await ddbDocClient.send(
      new DeleteCommand({
        TableName: TASKS_TABLE,
        Key: { id }
      })
    )

    return c.json({ message: 'Task deleted' })
  })

  app.get('/tasks', async (c) => {
    const date = c.req.query('date')

    const result = await ddbDocClient.send(
      new ScanCommand({
        TableName: TASKS_TABLE,
        ...(date
          ? {
              FilterExpression: '#date = :date',
              ExpressionAttributeNames: { '#date': 'date' },
              ExpressionAttributeValues: { ':date': date }
            }
          : {})
      })
    )

    return c.json((result.Items || []) as Task[])
  })
}


