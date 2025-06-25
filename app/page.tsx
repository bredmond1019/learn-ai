import { redirect } from 'next/navigation'

export default function RootPage() {
  // This should never be reached due to middleware, but just in case
  redirect('/en')
}