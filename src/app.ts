import { Hono } from 'hono'
import { registerTaskRoutes } from './routes/tasks'

export const app = new Hono()

registerTaskRoutes(app)


