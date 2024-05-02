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
  const [productNames, setProductNames] = useState<string[]>([])
  const [quantities, setQuantities] = useState<number[]>([])
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
      // const fetchPromises = rows.map((row) => 
      //   fetch(`/api/products/${row.uuid}?quantity=${row.quantity}`).then(response => {
      //     if (!response.ok) {
      //       throw new Error(`HTTP error! status: ${response.status}`);
      //     }
      //     return response.json();  // Assuming the server returns JSON with the URL data
      //   })
      // );
      const fetchPromises = async () => {
        const quantities = rows.map(row => row.quantity);
        const ids = rows.map(row => row.uuid);
        const response = await fetch(`/api/products/images?ids=${ids}&quantities=${quantities}`);
        return response.json()
      }
      // Wait for all fetch requests to complete
      const urls = await fetchPromises();

      // const urls = resolvedPromises
      //   .map((promise) => promise.map((item: { image_s3_url: string; }) => item.image_s3_url))
      //   .flatMap(url => url);

      // const productNames = resolvedPromises
      //   .map((promise) => promise.map((item: { product_name: string; }) => item.product_name))
      //   .flatMap(name => name)

      // const binQuantity = resolvedPromises
      //   .map((promise) => promise.map((item: { quantity: number }) => item.quantity))
      //   .flatMap(q => q)

      // Set the image URLs in the state
      setImageUrls(urls);
    } catch (error) {
      console.error('Failed to fetch image URLs:', error);
      // Handle errors, perhaps set an error state or retry logic
    }
  }

  return(
    <div className="flex flex-col gap-4 container mx-auto">
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
              <ProductPicker 
                uuidCallback={(uuid) => handleInputChange(row.id, uuid, row.quantity)} />
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
      <Card className="grid grid-cols-3 gap-4 p-4">
        {imageUrls.map((url, index) =>
          <div className="w-auto h-auto" key={index}>
            <Image
              src={url}
              className="rounded-lg"
              width={400}
              height={400}
              alt="Bin Picture"
          /></div> 
        )}
        {imageUrls.length === 0 ? <div>
          <Image 
            src="https://demofree.sirv.com/nope-not-here.jpg" 
            className="rounded-lg"
            width={400}
            height={400}
            alt="Not Found Image"
          />
        </div> : <></>
        }
      </Card>
    </div>
    
  );
}
