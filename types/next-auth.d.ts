import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      familyName: string
      parentPin: string
    }
  }
  interface User {
    id: string
    email: string
    familyName: string
    parentPin: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    familyName: string
    parentPin: string
  }
}
