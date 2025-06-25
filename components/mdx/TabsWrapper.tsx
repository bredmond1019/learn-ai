'use client'

import React from 'react'
import { Tabs } from '../ui/tabs'

export function TabsWrapper({ defaultValue, children, ...props }: any) {
  const [value, setValue] = React.useState(defaultValue || '')
  
  return (
    <Tabs value={value} onValueChange={setValue} {...props}>
      {children}
    </Tabs>
  )
}