import { Scrollbar } from 'react-scrollbars-custom'

const TRANSPARENT = { background: 'transparent' }

/**
 * Scrollbar that fills its flex container and uses gray track/thumb styling.
 * Wrapper and scroller backgrounds are forced transparent so the page background shows through.
 * From https://xobotyi.github.io/react-scrollbars-custom/
 */
export default function GrayScrollbar({ children, className = '', style = {}, ...props }) {
  return (
    <div className={`gray-scrollbar-wrapper ${className}`.trim()} style={{ position: 'relative', flex: 1, minHeight: 0, ...style }}>
      <Scrollbar
        style={{ position: 'absolute', inset: 0 }}
        className="scrollbars-gray"
        wrapperProps={{ style: TRANSPARENT }}
        scrollerProps={{ style: TRANSPARENT }}
        contentProps={{ style: TRANSPARENT }}
        {...props}
      >
        {children}
      </Scrollbar>
    </div>
  )
}
