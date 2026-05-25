// @vitest-environment jsdom

import { describe, expect, it, vi } from "vitest";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { ThemeProvider } from "../context/ThemeContext";
import { InlineEditor } from "./InlineEditor";

const markdownEditorHarness = vi.hoisted(() => ({
  props: null as null | {
    value: string;
    onChange: (value: string) => void;
    onSubmit?: () => void;
    placeholder?: string;
  },
}));

vi.mock("./MarkdownEditor", async () => {
  const React = await import("react");
  return {
    MarkdownEditor: React.forwardRef(function MarkdownEditorMock(
      props: {
        value: string;
        onChange: (value: string) => void;
        onSubmit?: () => void;
        placeholder?: string;
      },
      ref: React.ForwardedRef<{ focus: () => void }>,
    ) {
      markdownEditorHarness.props = props;
      React.useImperativeHandle(ref, () => ({ focus: () => undefined }));
      return (
        <textarea
          aria-label="mock markdown editor"
          value={props.value}
          placeholder={props.placeholder}
          onChange={(event) => props.onChange(event.currentTarget.value)}
          onKeyDown={(event) => {
            if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
              props.onSubmit?.();
            }
          }}
        />
      );
    }),
  };
});

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

  it("keeps multiline edit mode open when save fails", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    const onSave = vi.fn().mockRejectedValue(new Error("save failed"));

    flushSync(() => {
      root.render(
        <ThemeProvider>
          <InlineEditor value="Initial" onSave={onSave} as="p" multiline />
        </ThemeProvider>,
      );
    });

    flushSync(() => {
      container.querySelector(".cursor-pointer")?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    const editor = container.querySelector<HTMLTextAreaElement>("textarea[aria-label='mock markdown editor']");
    expect(editor).not.toBeNull();

    flushSync(() => {
      markdownEditorHarness.props?.onChange("Changed");
    });

    flushSync(() => {
      editor!.dispatchEvent(new FocusEvent("focusout", { bubbles: true, relatedTarget: null }));
    });
    await Promise.resolve();
    await Promise.resolve();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(onSave).toHaveBeenCalledWith("Changed");
    expect(container.querySelector("textarea[aria-label='mock markdown editor']")).not.toBeNull();
    expect(container.textContent).toContain("Could not save");

    root.unmount();
    container.remove();
  });
});
