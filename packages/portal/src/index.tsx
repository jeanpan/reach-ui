/**
 * Welcome to @reach/portal!
 *
 * Creates and appends a DOM node to the end of `document.body` and renders a
 * React tree into it. Useful for rendering a natural React element hierarchy
 * with a different DOM hierarchy to prevent parent styles from clipping or
 * hiding content (for popovers, dropdowns, and modals).
 *
 * @see Docs   https://reach.tech/portal
 * @see Source https://github.com/reach/reach-ui/tree/main/packages/portal
 * @see React  https://reactjs.org/docs/portals.html
 */

import * as React from "react";
import { useIsomorphicLayoutEffect as useLayoutEffect } from "@reach/utils/use-isomorphic-layout-effect";
import { useForceUpdate } from "@reach/utils/use-force-update";
import { createPortal } from "react-dom";
import warning from "tiny-warning";

/**
 * Portal
 *
 * @see Docs https://reach.tech/portal#portal
 */
const Portal: React.FC<PortalProps> = ({
  children,
  type = "reach-portal",
  containerRef,
  unstable_skipInitialRender,
}) => {
  let mountNode = React.useRef<HTMLDivElement | null>(null);
  let portalNode = React.useRef<HTMLElement | null>(null);
  let forceUpdate = useForceUpdate();

  if (__DEV__) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    React.useEffect(() => {
      if (containerRef != null) {
        warning(
          typeof containerRef === "object" && "current" in containerRef,
          "@reach/portal: Invalid value passed to the `containerRef` of a " +
            "`Portal`. The portal will be appended to the document body, but if " +
            "you want to attach it to another DOM node you must pass a valid " +
            "React ref object to `containerRef`."
        );

        warning(
          containerRef ? containerRef.current != null : true,
          "@reach/portal: A ref was passed to the `containerRef` prop of a " +
            "`Portal`, but no DOM node was attached to it. Be sure to pass the " +
            "ref to a DOM component.\n\nIf you are forwarding the ref from " +
            "another component, be sure to use the React.forwardRef API. " +
            "See https://reactjs.org/docs/forwarding-refs.html."
        );
      }
    }, [containerRef]);
  }

  useLayoutEffect(() => {
    // This ref may be null when a hot-loader replaces components on the page
    if (!mountNode.current) return;
    // It's possible that the content of the portal has, itself, been portaled.
    // In that case, it's important to append to the correct document element.
    let ownerDocument = mountNode.current!.ownerDocument;
    let body = containerRef?.current || ownerDocument.body;
    portalNode.current = ownerDocument?.createElement(type)!;
    body.appendChild(portalNode.current);
    forceUpdate();
    return () => {
      if (portalNode.current && body) {
        body.removeChild(portalNode.current);
      }
    };
  }, [type, forceUpdate, containerRef]);

  let [hydrated, setHydrated] = React.useState(false);
  React.useEffect(() => {
    setHydrated(true);
  }, []);

  if (unstable_skipInitialRender && !hydrated) {
    return;
  }

  return portalNode.current ? (
    createPortal(children, portalNode.current)
  ) : (
    <span ref={mountNode} />
  );
};

/**
 * @see Docs https://reach.tech/portal#portal-props
 */
type PortalProps = {
  /**
   * Regular React children.
   *
   * @see Docs https://reach.tech/portal#portal-children
   */
  children: React.ReactNode;
  /**
   * The DOM element type to render.
   *
   * @see Docs https://reach.tech/portal#portal-type
   */
  type?: string;
  /**
   * The container ref to which the portal will be appended. If not set the
   * portal will be appended to the body of the component's owner document
   * (typically this is the `document.body`).
   *
   * @see Docs https://reach.tech/portal#portal-containerRef
   */
  containerRef?: React.RefObject<Node>;
  unstable_skipInitialRender?: boolean;
};

if (__DEV__) {
  Portal.displayName = "Portal";
}

////////////////////////////////////////////////////////////////////////////////
// Exports

export default Portal;
export type { PortalProps };
export { Portal };
