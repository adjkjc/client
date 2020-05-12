import classnames from 'classnames';
import { createElement } from 'preact';
import { useLayoutEffect, useRef } from 'preact/hooks';
import propTypes from 'prop-types';

/**
 * Object mapping icon names to SVG markup.
 *
 * @typedef {{[name: string]: string}} IconMap
 */

/**
 * Map of icon name to SVG data.
 *
 * @type {IconMap}
 */
let iconRegistry = {};

/**
 * Component that renders icons using inline `<svg>` elements.
 * This enables their appearance to be customized via CSS.
 *
 * Supply either a registerer icon `name` or a trusted SVG object
 * to the `src` prop.
 * a
 *
 * This matches the way we do icons on the website, see
 * https://github.com/hypothesis/h/pull/3675
 */
export default function SvgIcon({
  name,
  className = '',
  inline = false,
  src,
  title = '',
}) {
  let markup;

  // Registered icon
  if (name) {
    if (!iconRegistry[name]) {
      throw new Error(`Icon name "${name}" is not registered`);
    }
    markup = { __html: iconRegistry[name] };
  }
  // Trusted icon
  else if (src) {
    if (!src.trustedHTML) {
      throw new Error(
        'Un-trusted resource passed to SvgIcon. If this is a valid SVG, use the `trustMarkup` wrapper.'
      );
    }
    markup = { __html: src.trustedHTML };
  } else {
    throw new Error('Either `svg` or `name` must be supplied');
  }

  const element = useRef();
  useLayoutEffect(() => {
    const svg = element.current.querySelector('svg');
    svg.setAttribute('class', className);
  }, [
    className,
    // `markup` is a dependency of this effect because the SVG is replaced if
    // it changes.
    markup,
  ]);

  const spanProps = {};
  if (title) {
    spanProps.title = title;
  }

  return (
    <span
      className={classnames('svg-icon', { 'svg-icon--inline': inline })}
      dangerouslySetInnerHTML={markup}
      ref={element}
      {...spanProps}
    />
  );
}

SvgIcon.propTypes = {
  /**
   * The name of the icon to display.
   *
   * The name must match a name that has already been registered using the
   * `registerIcons` function.
   */
  name: propTypes.string,

  /** A CSS class to apply to the `<svg>` element. */
  className: propTypes.string,

  /** Apply a style allowing for inline display of icon wrapper */
  inline: propTypes.bool,

  /** Imported SVG resource with a trusted wrapper. */
  src: propTypes.shape({
    trustedHTML: propTypes.string,
  }),

  /** Optional title attribute to apply to the SVG's containing `span` */
  title: propTypes.string,
};

/**
 * Register icons for use with the `SvgIcon` component.
 *
 * @param {IconMap} icons - Object mapping icon names to SVG data.
 * @param {boolean} [options.reset] - If `true`, remove existing registered icons.
 */
export function registerIcons(icons, { reset = false } = {}) {
  if (reset) {
    iconRegistry = {};
  }
  Object.assign(iconRegistry, icons);
}

/**
 * Return the currently available icons.
 *
 * To register icons, don't mutate this directly but call `registerIcons`
 * instead.
 *
 * @return {IconMap}
 */
export function availableIcons() {
  return iconRegistry;
}
