"use client"

import { ProductPicker } from "@/components/page/ProductPicker";
import { QuantityEdit } from "@/components/page/QuantityEdit";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import Image from 'next/image'


export default function Home() {
  const [rows, setRows] = useState([{id: 1, uuid: "", quantity: 0}])
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const addRow = () => {
    const newRow = {
      id: rows.length + 1,
      uuid: "",
      quantity: 0
    }
    setRows([...rows, newRow])
  }

  const handleInputChange = (id: number, uuid: string, quantity: number) => {
    const newRows: any = rows.map(row => {
      if (row.id === id) {
        return { ...row, uuid, quantity };
      }
      return row;
    });
    setRows(newRows);
  }

  const lookup = async () => {
    try {
      // Map each row to a fetch promise, fetching the image urls from the server
      const fetchPromises = rows.map((row) => 
          fetch(`/api/products/${row.uuid}?quantity=${row.quantity}`).then(response => {
              if (!response.ok) {
                  throw new Error(`HTTP error! status: ${response.status}`);
              }
              return response.json();  // Assuming the server returns JSON with the URL data
          })
      );

      // Wait for all fetch requests to complete
      const resolvedUrls = await Promise.all(fetchPromises);
      console.log(resolvedUrls)

      // Set the image URLs in the state
      setImageUrls(resolvedUrls[0]);
    } catch (error) {
      console.error('Failed to fetch image URLs:', error);
      // Handle errors, perhaps set an error state or retry logic
    }
  }
  console.log(imageUrls)
  return(
    <div className="container mx-auto">
      <Card className="flex flex-col justify-items-center justify-center w-auto">
      <CardHeader>
        <CardTitle>Bin Sense AI</CardTitle>
        <CardDescription>
          Choose the product and quantity you need to look up!
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {rows.map((row) => {
          return (
            <div className="p-4 flex justify-center gap-4" key={row.id}>
              <ProductPicker uuidCallback={(uuid) => handleInputChange(row.id, uuid, row.quantity)}/>
              <QuantityEdit quantityCallback={(q) => handleInputChange(row.id, row.uuid, q)}/>
            </div>
          )
        })}
      </CardContent>
      <CardFooter className="flex flex-row gap-4 justify-end">
        <Button onClick={addRow}>More</Button>
        <Button onClick={lookup}>Look up!</Button>
      </CardFooter>
      </Card>
      <Card>
        {imageUrls.map((url) => 
          <Image
            key={url}
            src={url}
            width={500}
            height={500}
            alt="Picture of the author"
          />
        )}
      </Card>
    </div>
    
  );
}
