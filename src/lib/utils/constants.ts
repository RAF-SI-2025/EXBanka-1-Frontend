export const EMPLOYEE_ROLES = [
  'EmployeeBasic',
  'EmployeeAgent',
  'EmployeeSupervisor',
  'EmployeeAdmin',
] as const

export const GENDERS = ['Male', 'Female', 'Other', 'Misha'] as const

export const COUNTRY_CODES = [
  { code: '+381', flag: '🇷🇸', iso: 'SRB' },
  { code: '+1', flag: '🇺🇸', iso: 'USA' },
  { code: '+44', flag: '🇬🇧', iso: 'GBR' },
  { code: '+49', flag: '🇩🇪', iso: 'DEU' },
  { code: '+33', flag: '🇫🇷', iso: 'FRA' },
  { code: '+39', flag: '🇮🇹', iso: 'ITA' },
  { code: '+43', flag: '🇦🇹', iso: 'AUT' },
  { code: '+385', flag: '🇭🇷', iso: 'HRV' },
  { code: '+387', flag: '🇧🇦', iso: 'BIH' },
  { code: '+382', flag: '🇲🇪', iso: 'MNE' },
  { code: '+389', flag: '🇲🇰', iso: 'MKD' },
  { code: '+36', flag: '🇭🇺', iso: 'HUN' },
  { code: '+48', flag: '🇵🇱', iso: 'POL' },
  { code: '+40', flag: '🇷🇴', iso: 'ROU' },
  { code: '+30', flag: '🇬🇷', iso: 'GRC' },
  { code: '+90', flag: '🇹🇷', iso: 'TUR' },
  { code: '+7', flag: '🇷🇺', iso: 'RUS' },
  { code: '+86', flag: '🇨🇳', iso: 'CHN' },
  { code: '+91', flag: '🇮🇳', iso: 'IND' },
  { code: '+55', flag: '🇧🇷', iso: 'BRA' },
  { code: '+52', flag: '🇲🇽', iso: 'MEX' },
  { code: '+61', flag: '🇦🇺', iso: 'AUS' },
  { code: '+81', flag: '🇯🇵', iso: 'JPN' },
  { code: '+82', flag: '🇰🇷', iso: 'KOR' },
  { code: '+27', flag: '🇿🇦', iso: 'ZAF' },
  { code: '+20', flag: '🇪🇬', iso: 'EGY' },
  { code: '+966', flag: '🇸🇦', iso: 'SAU' },
  { code: '+971', flag: '🇦🇪', iso: 'ARE' },
  { code: '+1', flag: '🇨🇦', iso: 'CAN' },
  { code: '+54', flag: '🇦🇷', iso: 'ARG' },
] as const

export const formatRoleLabel = (role: string): string => role.replace(/([A-Z])/g, ' $1').trim()
