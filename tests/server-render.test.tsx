import { renderToString } from "react-dom/server";
import InputElement from "../src";

describe("Test prerender", () => {
  it("should return a string", () => {
    const result = renderToString(
      <InputElement value="799912345" mask="7 (999) 999-99-99" maskPlaceholder="_" />
    );
    expect(typeof result).toBe("string");
    expect(result).toBe('<input role="textbox" value="7 (999) 123-45-__"/>');
  });
});
