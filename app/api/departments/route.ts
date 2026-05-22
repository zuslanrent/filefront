import { NextResponse } from 'next/server'

const INTRANET_URL = 'http://intranet.bodigroup.mn/intranet/api/departments?api_key=int_api_7f766e223f04c1638db65580fcb356be2aeb3e79'

export async function GET() {
  try {
    const res  = await fetch(INTRANET_URL, { cache: 'no-store' })
    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Хэлтэс татахад алдаа гарлаа' }, { status: 500 })
  }
}