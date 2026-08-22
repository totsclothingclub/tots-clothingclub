import { redirect } from 'next/navigation'

interface PlusSizePageProps {
  searchParams: { [key: string]: string | undefined }
}

export default function PlusSizePage({ searchParams }: PlusSizePageProps) {
  const params = new URLSearchParams()
  params.set('category', 'plus-size')
  
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, val]) => {
      if (val && key !== 'category') params.set(key, val)
    })
  }

  redirect(`/shop?${params.toString()}`)
}
