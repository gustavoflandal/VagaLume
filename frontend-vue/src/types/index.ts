// User types
export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  passwordConfirmation: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthResponse {
  user: User
  tokens: AuthTokens
}

// Account types
export enum AccountType {
  CHECKING = 'CHECKING',
  SAVINGS = 'SAVINGS',
  CREDIT_CARD = 'CREDIT_CARD',
  INVESTMENT = 'INVESTMENT',
  CASH = 'CASH',
  OTHER = 'OTHER'
}

export interface Account {
  id: string
  name: string
  type: AccountType
  balance: number
  initialBalance: number
  currency: string
  description?: string
  isActive: boolean
  userId: string
  createdAt: string
  updatedAt: string
}

export interface CreateAccountData {
  name: string
  type: AccountType
  balance: number
  initialBalance?: number
  currency?: string
  description?: string
}

// Transaction types
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  TRANSFER = 'TRANSFER'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  description: string
  date: string
  fromAccountId?: string
  toAccountId?: string
  categoryId?: string
  status: TransactionStatus
  tags?: string[]
  attachments?: string[]
  userId: string
  createdAt: string
  updatedAt: string
  fromAccount?: Account
  toAccount?: Account
  category?: Category
}

export interface CreateTransactionData {
  type: TransactionType
  amount: number
  description: string
  date: string
  fromAccountId?: string
  toAccountId?: string
  categoryId?: string
  status?: TransactionStatus
  tags?: string[]
}

// Category types
export interface Category {
  id: string
  name: string
  color?: string
  icon?: string
  parentId?: string
  isActive?: boolean
  userId: string
  createdAt: string
  updatedAt: string
  parent?: Category
  children?: Category[]
}

export interface CreateCategoryData {
  name: string
  color?: string
  icon?: string
  parentId?: string
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ApiError {
  message: string
  code?: string
  errors?: Record<string, string[]>
}
