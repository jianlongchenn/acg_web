// app/search/page.tsx
'use client'

import { Suspense } from 'react'
import SearchClient from './SearchClient'

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-gray-500">Loading search results...</div>}>
      <SearchClient />
    </Suspense>
  )
}
