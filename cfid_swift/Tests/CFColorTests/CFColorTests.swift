import XCTest
@testable import CFColor

final class CFColorTests: XCTestCase {

    func testSpecVectors() throws {
        let cases: [(String, String)] = [
            ("#000000", "CF-000000-86165F20"),
            ("#ffffff", "CF-FFFFFF-2DD4EB92"),
            ("#ff0000", "CF-FF0000-37AB74A7"),
            ("#00ff00", "CF-00FF00-9377CC77"),
            ("#0000ff", "CF-0000FF-D81673DF"),
            ("#7b3f00", "CF-7B3F00-EA262463"),
            ("#cc0000", "CF-CC0000-791976F7"),
        ]
        for (hex, expected) in cases {
            XCTAssertEqual(try fromHex(hex), expected, "mismatch for \(hex)")
        }
    }

    func testThreeDigitHexExpands() throws {
        XCTAssertEqual(try fromHex("#f00"), try fromHex("#ff0000"))
    }

    func testRound3TruncatesTowardZeroForNegatives() {
        XCTAssertEqual(round3(-86.183), -86.182)
    }

    func testRound3TruncatesTowardZeroForPositives() {
        XCTAssertEqual(round3(86.183), 86.183)
        XCTAssertEqual(round3(0.0001), 0.0)
    }

    func testInvalidHexThrows() {
        XCTAssertThrowsError(try fromHex("#zzzzzz"))
        XCTAssertThrowsError(try fromHex("#ff00"))
    }

    func testFromRGBMatchesFromHex() throws {
        XCTAssertEqual(fromRGB(255, 0, 0), try fromHex("#ff0000"))
    }
}
