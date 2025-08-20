'use client'

import { FaCalendarAlt } from 'react-icons/fa'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'

export default function BasicDetails ({
  name, setName,
  description, setDescription,
  visibility, setVisibility,
  errors
}: {
  name: string
  setName: (v: string) => void
  description: string
  setDescription: (v: string) => void
  visibility: 'draft' | 'public' | 'private'
  setVisibility: (v: 'draft' | 'public' | 'private') => void
  errors: Record<string, string>
}) {
  return (
    <Card className="border-0 shadow-md scroll-mt-24" id="basic-details-section">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <FaCalendarAlt /> {'Basic details'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="event-name">{'Event Name'}</label>
          <input id="event-name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/30" />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="event-description">{'Description'}</label>
          <textarea id="event-description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/30" />
          {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
        </div>
        <div>
          <span className="block text-sm font-medium text-gray-700">{'Visibility'}</span>
          <div className="mt-1 flex gap-4 text-sm">
            {(['draft', 'public', 'private'] as const).map(v => (
              <label key={v} className="flex items-center gap-2">
                <input type="radio" name="visibility" checked={visibility === v} onChange={() => setVisibility(v)} />
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </label>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
