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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon"
        className="bg-brand-orange dark:bg-brand-blue">
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>

<DropdownMenuContent
  align="end"
  className="z-[9999] bg-brand-cream dark:bg-brand-orange border border-brand-blue shadow-lg dark:border-brand-cream
  w-20 min-w-0 p-1"
>
  <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
  <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
  <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
</DropdownMenuContent>
    </DropdownMenu>
  )
}
