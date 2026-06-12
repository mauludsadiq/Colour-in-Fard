package main

import (
"cfcolor"
"fmt"
"os"
)

func main() {
if len(os.Args) < 2 {
fmt.Fprintln(os.Stderr, "usage: cfid <hex>")
os.Exit(1)
}
id, err := cfcolor.FromHex(os.Args[1])
if err != nil {
fmt.Fprintln(os.Stderr, "error:", err)
os.Exit(1)
}
fmt.Println(id)
}
