'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { departments } from '@/lib/mock-data/departments'
import { allUsers } from '@/lib/mock-data/users'
import { Bell, Users, Mail, User, X } from 'lucide-react'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

export interface NotificationConfig {
  type: 'all' | 'departments' | 'users' | 'email'
  departments: string[]
  users: string[]
  groupEmail: string
}

interface NotificationSelectorProps {
  value: NotificationConfig
  onChange: (value: NotificationConfig) => void
}

export function NotificationSelector({ value, onChange }: NotificationSelectorProps) {
  const [userSearchOpen, setUserSearchOpen] = useState(false)

  const handleTypeChange = (type: NotificationConfig['type']) => {
    onChange({
      ...value,
      type,
    })
  }

  const toggleDepartment = (deptId: string) => {
    const newDepts = value.departments.includes(deptId)
      ? value.departments.filter(d => d !== deptId)
      : [...value.departments, deptId]
    onChange({ ...value, departments: newDepts })
  }

  const toggleUser = (userId: string) => {
    const newUsers = value.users.includes(userId)
      ? value.users.filter(u => u !== userId)
      : [...value.users, userId]
    onChange({ ...value, users: newUsers })
  }

  const removeUser = (userId: string) => {
    onChange({
      ...value,
      users: value.users.filter(u => u !== userId),
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Bell className="size-4 text-muted-foreground" />
        <Label className="font-medium">Мэдэгдэл илгээх</Label>
      </div>

      <RadioGroup
        value={value.type}
        onValueChange={(v) => handleTypeChange(v as NotificationConfig['type'])}
        className="grid gap-3"
      >
        {/* All employees */}
        <div className="flex items-center space-x-3">
          <RadioGroupItem value="all" id="notify-all" />
          <Label htmlFor="notify-all" className="flex items-center gap-2 cursor-pointer">
            <Users className="size-4 text-blue-500" />
            Бүх ажилтнууд руу
          </Label>
        </div>

        {/* By departments */}
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <RadioGroupItem value="departments" id="notify-departments" />
            <Label htmlFor="notify-departments" className="cursor-pointer">
              Хэлтсүүд рүү
            </Label>
          </div>
          
          {value.type === 'departments' && (
            <Card className="ml-6">
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 gap-2">
                  {departments.map(dept => (
                    <div key={dept.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`notify-dept-${dept.id}`}
                        checked={value.departments.includes(dept.id)}
                        onCheckedChange={() => toggleDepartment(dept.id)}
                      />
                      <Label
                        htmlFor={`notify-dept-${dept.id}`}
                        className="text-sm cursor-pointer"
                      >
                        {dept.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* By users */}
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <RadioGroupItem value="users" id="notify-users" />
            <Label htmlFor="notify-users" className="flex items-center gap-2 cursor-pointer">
              <User className="size-4 text-green-500" />
              Сонгосон ажилтнууд руу
            </Label>
          </div>
          
          {value.type === 'users' && (
            <Card className="ml-6">
              <CardContent className="pt-4 space-y-3">
                <Popover open={userSearchOpen} onOpenChange={setUserSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <User className="size-4 mr-2" />
                      Ажилтан сонгох...
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-72" align="start">
                    <Command>
                      <CommandInput placeholder="Ажилтан хайх..." />
                      <CommandList>
                        <CommandEmpty>Олдсонгүй</CommandEmpty>
                        <CommandGroup>
                          {allUsers
                            .filter(u => !value.users.includes(u.id))
                            .map(user => (
                              <CommandItem
                                key={user.id}
                                value={user.name}
                                onSelect={() => {
                                  toggleUser(user.id)
                                  setUserSearchOpen(false)
                                }}
                              >
                                <div>
                                  <p className="font-medium">{user.name}</p>
                                  <p className="text-xs text-muted-foreground">{user.email}</p>
                                </div>
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                {value.users.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {value.users.map(userId => {
                      const user = allUsers.find(u => u.id === userId)
                      if (!user) return null
                      return (
                        <Badge key={userId} variant="secondary" className="gap-1">
                          {user.name}
                          <button
                            onClick={() => removeUser(userId)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="size-3" />
                          </button>
                        </Badge>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Group email */}
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <RadioGroupItem value="email" id="notify-email" />
            <Label htmlFor="notify-email" className="flex items-center gap-2 cursor-pointer">
              <Mail className="size-4 text-orange-500" />
              Групп имэйл хаяг руу
            </Label>
          </div>
          
          {value.type === 'email' && (
            <Card className="ml-6">
              <CardContent className="pt-4">
                <Input
                  type="email"
                  placeholder="group@company.mn"
                  value={value.groupEmail}
                  onChange={(e) => onChange({ ...value, groupEmail: e.target.value })}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </RadioGroup>
    </div>
  )
}
