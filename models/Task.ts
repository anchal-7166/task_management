import mongoose, { Schema, Document, Model } from 'mongoose'

export type TaskStatus = 'todo' | 'in-progress' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface ITask extends Document {
  _id: mongoose.Types.ObjectId
  title: string
  description: string 
  status: TaskStatus
  priority: TaskPriority
  userId: mongoose.Types.ObjectId
  dueDate: Date | null
  createdAt: Date
  updatedAt: Date
}

const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title must not exceed 100 characters'],
      index: 'text', // Enable text search on title
    },
    description: {
      type: String,
      default: '',
      // Stored encrypted using AES-256
    },
    status: {
      type: String,
      enum: {
        values: ['todo', 'in-progress', 'done'],
        message: 'Status must be todo, in-progress, or done',
      },
      default: 'todo',
      index: true,
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high'],
        message: 'Priority must be low, medium, or high',
      },
      default: 'medium',
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    dueDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (_, ret:any) {
        delete ret.__v
        return ret
      },
    },
  }
)

// Compound index for efficient per-user queries with status filtering
taskSchema.index({ userId: 1, status: 1, createdAt: -1 })
taskSchema.index({ userId: 1, createdAt: -1 })
taskSchema.index({ userId: 1, title: 'text' }) // text search index

const Task: Model<ITask> =
  mongoose.models.Task || mongoose.model<ITask>('Task', taskSchema)

export default Task