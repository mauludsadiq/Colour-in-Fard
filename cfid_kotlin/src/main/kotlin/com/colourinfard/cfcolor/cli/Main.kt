package com.colourinfard.cfcolor.cli

import com.colourinfard.cfcolor.fromHex

fun main(args: Array<String>) {
    if (args.isEmpty()) {
        System.err.println("usage: cfid <hex>")
        kotlin.system.exitProcess(1)
    }
    try {
        println(fromHex(args[0]))
    } catch (e: Exception) {
        System.err.println("error: ${e.message}")
        kotlin.system.exitProcess(1)
    }
}
