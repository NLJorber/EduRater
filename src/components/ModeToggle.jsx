"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ModeToggle() {
  const { setTheme } = useTheme()

const itemClass =
  "data-[highlighted]:!bg-red-500 data-[highlighted]:!text-brand-brown " +
  "focus:!bg-brand-cream focus:!text-brand-brown " +
  "dark:data-[highlighted]:!bg-brand-brown dark:data-[highlighted]:!text-brand-cream " +
  "dark:focus:!bg-brand-brown dark:focus:!text-brand-cream"


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon"
        className="bg-brand-orange dark:bg-brand-blue text-brand-cream">
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>

<DropdownMenuContent
  align="end"
  className="z-[9999] bg-brand-blue dark:bg-brand-orange border border-brand-brown shadow-lg dark:border-brand-brown text-brand-cream dark:text-brand-cream
  w-20 min-w-0 p-1"
>
  <DropdownMenuItem onClick={() => setTheme("light")}
    
    >Light</DropdownMenuItem>
  <DropdownMenuItem onClick={() => setTheme("dark")}
    
    >Dark</DropdownMenuItem>
  <DropdownMenuItem onClick={() => setTheme("system")}
    
    >System</DropdownMenuItem>
</DropdownMenuContent>
    </DropdownMenu>
  )
}
