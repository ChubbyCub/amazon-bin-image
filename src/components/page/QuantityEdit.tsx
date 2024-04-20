"use client"

import { useState } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"

interface QuantityEditProps {
  quantityCallback: (quantity: number) => void
}

export const QuantityEdit: React.FC<QuantityEditProps> = ({ quantityCallback }) => {
  const [quantity, setQuantity] = useState(0)
  
  const handleIncrease = () => {
    const newQuantity = quantity + 1
    setQuantity(newQuantity)
    quantityCallback(newQuantity)
  }

  const handleDecrease = () => {
    const newQuantity = quantity - 1
    if(newQuantity <= 0) {
      setQuantity(0)
    } else {
      setQuantity(newQuantity)
    }
    quantityCallback(newQuantity)
  }
  
  return (
    <div className="flex flex-row">
      <Button className="rounded-l-lg rounded-r-none" onClick={handleIncrease}>+</Button>
      <Input className=" rounded-none text-center w-auto" placeholder="0" value={quantity} readOnly />
      <Button className="rounded-l-none rounded-r-lg" onClick={handleDecrease}>-</Button>
    </div>
  )
}