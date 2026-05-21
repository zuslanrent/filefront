// // import { NextRequest, NextResponse } from 'next/server'

// // export function middleware(request: NextRequest) {
// //   const { pathname, searchParams } = new URL(request.url)

// //   if (pathname.startsWith('/regulations')) {
// //     const empId      = searchParams.get('emp_id')
// //     const divisionId = searchParams.get('division_id')
// //     const deptId     = searchParams.get('dept_id')
// //     const name       = searchParams.get('name')

// //     // URL-д параметр байвал cookie-д хадгалаад цэвэр URL руу redirect
// //     if (empId && divisionId) {
// //       const cleanUrl  = new URL(pathname, request.url)
// //       const response  = NextResponse.redirect(cleanUrl)
// //       const maxAge    = 60 * 60 * 8 // 8 цаг

// //       response.cookies.set('emp_id',      empId,                        { maxAge, path: '/' })
// //       response.cookies.set('division_id', divisionId,                   { maxAge, path: '/' })
// //       response.cookies.set('dept_id',     deptId     || '',             { maxAge, path: '/' })
// //       response.cookies.set('emp_name',    name        || '',            { maxAge, path: '/' })

// //       return response
// //     }

// //     // Cookie байхгүй бол intranet руу redirect
// //     const empCookie = request.cookies.get('emp_id')
// //     if (!empCookie?.value) {
// //       return NextResponse.redirect('http://intranet.bodigroup.mn')
// //     }
// //   }

// //   return NextResponse.next()
// // }

// // export const config = {
// //   matcher: ['/regulations/:path*'],
// // }

// import { NextRequest, NextResponse } from 'next/server'

// export function middleware(request: NextRequest) {
//   // Development дээр middleware-г ажиллуулахгүй
//   if (process.env.NODE_ENV === 'development') {
//     return NextResponse.next()
//   }

//   const { pathname, searchParams } = new URL(request.url)

//   if (pathname.startsWith('/regulations')) {
//     const empId      = searchParams.get('emp_id')
//     const divisionId = searchParams.get('division_id')

//     if (empId && divisionId) {
//       const cleanUrl = new URL(pathname, request.url)
//       const response = NextResponse.redirect(cleanUrl)
//       const maxAge   = 60 * 60 * 8

//       response.cookies.set('emp_id',      empId,                     { maxAge, path: '/' })
//       response.cookies.set('division_id', divisionId,                { maxAge, path: '/' })
//       response.cookies.set('dept_id',     searchParams.get('dept_id')  || '', { maxAge, path: '/' })
//       response.cookies.set('emp_name',    searchParams.get('name')     || '', { maxAge, path: '/' })
//       return response
//     }

//     const empCookie = request.cookies.get('emp_id')
//     if (!empCookie?.value) {
//       return NextResponse.redirect('http://intranet.bodigroup.mn')
//     }
//   }

//   return NextResponse.next()
// }

// export const config = {
//   matcher: ['/regulations/:path*'],
// }

import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/regulations/:path*'],
}