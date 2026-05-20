export interface IntranetUser {
  empId:      string
  divisionId: string
  deptId:     string
  name:       string
}

function getCookie(name: string): string {
  if (typeof document === 'undefined') return ''
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return decodeURIComponent(parts.pop()?.split(';').shift() || '')
  return ''
}

export function getIntranetUser(): IntranetUser | null {
  const empId = getCookie('emp_id')
  if (!empId) return null
  return {
    empId,
    divisionId: getCookie('division_id'),
    deptId:     getCookie('dept_id'),
    name:       getCookie('emp_name'),
  }
}