// See https://kit.svelte.dev/docs/types#app
import type { Session, User } from 'better-auth/types'

declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      session: Session | null
      user: User | null
      visitorId: string | null
    }
    // interface PageData {}
    // interface Platform {}
  }
}

export {}
