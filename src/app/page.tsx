import { redirect } from 'next/navigation'

export default function HomePage() {
  // Redirect to dashboard - the main application entry point
  redirect('/dashboard')
}