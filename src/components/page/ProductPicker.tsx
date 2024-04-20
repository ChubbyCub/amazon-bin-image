"use client"

import React, { useState, useEffect } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
 
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface Product {
  uuid: string
  asin: string
  name: string
}

interface ProductPickerProps {
  uuidCallback: (uuid: string) => void
}

export const ProductPicker: React.FC<ProductPickerProps> = ({ uuidCallback }) => {
  const [open, setOpen] = useState(false)
  const [displayName, setDisplayName] = useState("")
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Fetch the product names from the server
    fetch('/api/products')
      .then(response => response.json())
      .then(data => {
        setProducts(data)
      })
      .catch(error => console.error('Error fetching product names:', error));
  }, [])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[600px] text-pretty justify-between"
        >
          {
          displayName
            ? products.find((product) => product.name === displayName)?.name
            : "Select product..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[600px] text-pretty p-0">
        <Command>
          <CommandInput placeholder="Search product..." defaultValue="" />
          <CommandEmpty>No product found.</CommandEmpty>
          <CommandList>
            {products.map((product) => {
            return (
              <CommandItem
                key={product.asin}
                value={product.name}
                defaultValue={""}
                onSelect={(currentValue) => {
                  setDisplayName(currentValue === displayName ? "" : currentValue)
                  uuidCallback(product.uuid)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    displayName === product.name ? "opacity-100" : "opacity-0"
                  )}
                />
                {product.name}
              </CommandItem>
            )})}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}