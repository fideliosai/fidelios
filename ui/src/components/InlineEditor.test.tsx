// @vitest-environment node

import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ThemeProvider } from "../context/ThemeContext";
import { InlineEditor } from "./InlineEditor";

describe("InlineEditor", () => {
  it("renders multiline descriptions as normalized markdown in display mode", () => {
    const html = renderToStaticMarkup(
      <ThemeProvider>
        <InlineEditor
          value={"Context\\n\\n## Assignment\\n- first\\n- second"}
          onSave={vi.fn()}
          as="p"
          multiline
        />
      </ThemeProvider>,
    );

    expect(html).not.toContain("\\n");
    expect(html).toContain("<p>Context</p>");
    expect(html).toContain("<h2>Assignment</h2>");
    expect(html).toContain("<li>first</li>");
    expect(html).toContain("<li>second</li>");
  });
});
