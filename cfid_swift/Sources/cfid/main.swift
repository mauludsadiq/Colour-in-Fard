import CFColor
import Foundation

let args = CommandLine.arguments
guard args.count > 1 else {
    FileHandle.standardError.write("usage: cfid <hex>\n".data(using: .utf8)!)
    exit(1)
}

do {
    print(try fromHex(args[1]))
} catch {
    FileHandle.standardError.write("error: \(error)\n".data(using: .utf8)!)
    exit(1)
}
