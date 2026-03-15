import { Scrollbar } from 'react-scrollbars-custom'

/**
 * Scrollbar that fills its flex container and uses gray track/thumb styling.
 * Use as a flex child with flex-1 min-h-0 (or inside such a container).
 * From https://xobotyi.github.io/react-scrollbars-custom/
 */
export default function GrayScrollbar({ children, className = '', style = {}, ...props }) {
  return (
    <div className={`gray-scrollbar-wrapper ${className}`.trim()} style={{ position: 'relative', flex: 1, minHeight: 0, ...style }}>
      <Scrollbar
        style={{ position: 'absolute', inset: 0 }}
        className="scrollbars-gray"
        {...props}
      >
        {children}
      </Scrollbar>
    </div>
  )
}
