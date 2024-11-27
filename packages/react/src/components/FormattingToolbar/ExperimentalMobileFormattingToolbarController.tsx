import { BlockSchema, InlineContentSchema, StyleSchema } from "@blocknote/core";
import { UseFloatingOptions } from "@floating-ui/react";
import { FC, CSSProperties, useMemo, useRef, useState, useEffect } from "react";
import { useBlockNoteEditor } from "../../hooks/useBlockNoteEditor.js";
import { useUIPluginState } from "../../hooks/useUIPluginState.js";
import { FormattingToolbar } from "./FormattingToolbar.js";
import { FormattingToolbarProps } from "./FormattingToolbarProps.js";

export const ExperimentalMobileFormattingToolbarController = (props: {
  formattingToolbar?: FC<FormattingToolbarProps>;
  floatingOptions?: Partial<UseFloatingOptions>;
}) => {
  const [transform, setTransform] = useState<string>("none");
  const divRef = useRef<HTMLDivElement>(null);
  const editor = useBlockNoteEditor<
    BlockSchema,
    InlineContentSchema,
    StyleSchema
  >();
  const state = useUIPluginState(
    editor.formattingToolbar.onUpdate.bind(editor.formattingToolbar)
  );
  const style = useMemo<CSSProperties>(() => {
    return {
      display: "flex",
      position: "absolute",
      maxWidth: "100vw",
      overflowX: "auto",
      bottom: 0,
      top: "unset",
      zIndex: 3000,
      transform,
    };
  }, [transform]);

  useEffect(() => {
    const viewport = window.visualViewport!;
    function viewportHandler() {
      const layoutViewport = document.body;
      const offsetLeft = viewport.offsetLeft;
      const offsetTop =
        viewport.height -
        layoutViewport.getBoundingClientRect().height +
        viewport.offsetTop;

      setTransform(
        `translate(${offsetLeft}px, ${offsetTop}px) scale(${
          1 / viewport.scale
        })`
      );
    }
    window.visualViewport!.addEventListener("scroll", viewportHandler);
    window.visualViewport!.addEventListener("resize", viewportHandler);
    viewportHandler();

    return () => {
      window.visualViewport!.removeEventListener("scroll", viewportHandler);
      window.visualViewport!.removeEventListener("resize", viewportHandler);
    };
  }, []);

  if (!state) {
    return null;
  }

  if (!state.show && divRef.current) {
    // The component is fading out. Use the previous state to render the toolbar with innerHTML,
    // because otherwise the toolbar will quickly flickr (i.e.: show a different state) while fading out,
    // which looks weird
    return (
      <div
        ref={divRef}
        style={style}
        dangerouslySetInnerHTML={{ __html: divRef.current.innerHTML }}></div>
    );
  }

  const Component = props.formattingToolbar || FormattingToolbar;

  return (
    <div ref={divRef} style={style}>
      <Component />
    </div>
  );
};