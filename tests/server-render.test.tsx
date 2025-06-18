import { renderToString } from "react-dom/server";
import InputElement from "../src";

describe("Test prerender", () => {
  it("should return a string", () => {
    const result = renderToString(
      <InputElement value="799912345" mask="7 (999) 999-99-99" maskPlaceholder="_" />
    );
    console.log({result})
    expect(typeof result).toBe("string");
  });
});
