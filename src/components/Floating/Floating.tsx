import type { Placement } from '@floating-ui/core'
import { autoUpdate, useFocus } from '@floating-ui/react'
import type { ComponentProps, FC, PropsWithChildren, ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import { getArrowPlacement } from '../../helpers/floating'
import { useBaseFLoating, useFloatingInteractions } from '../../helpers/use-Floating'
import { cn } from '../../helpers/cn'

export interface keepFloatingTheme {
  arrow: keepFloatingArrowTheme
  animation: string
  base: string
  content: string
  hidden: string
  style: {
    auto: string
    dark: string
    light: string
  }
  target: string
  title: string
}

export interface keepFloatingArrowTheme {
  base: string
  placement: string
  style: {
    dark: string
    light: string
    auto: string
  }
}

export type FloatingStyle = 'dark' | 'light' | 'auto'

export interface FloatingProps extends PropsWithChildren, Omit<ComponentProps<'div'>, 'content' | 'style'> {
  animation?: false | `duration-${number}`
  arrow?: boolean
  content: ReactNode
  placement?: 'auto' | Placement
  style?: FloatingStyle
  theme: keepFloatingTheme
  trigger?: 'hover' | 'click'
  minWidth?: number
  closeRequestKey?: string
}

/**
 * @see https://floating-ui.com/docs/react-dom-interactions
 */
export const Floating: FC<FloatingProps> = ({
  animation = 'duration-300',
  arrow = true,
  children,
  className,
  content,
  placement = 'top',
  style = 'dark',
  theme,
  trigger = 'hover',
  minWidth,
  closeRequestKey,
  ...props
}) => {
  const arrowRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)

  const floatingProperties = useBaseFLoating({
    open,
    placement,
    arrowRef,
    setOpen,
  })

  const {
    context,
    middlewareData: { arrow: { x: arrowX, y: arrowY } = {} },
    refs,
    strategy,
    update,
    x,
    y,
  } = floatingProperties

  const focus = useFocus(context)
  const { getFloatingProps, getReferenceProps } = useFloatingInteractions({
    context,
    role: 'tooltip',
    trigger,
    interactions: [focus],
  })

  useEffect(() => {
    if (refs.reference.current && refs.floating.current && open) {
      return autoUpdate(refs.reference.current, refs.floating.current, update)
    }
  }, [open, refs.floating, refs.reference, update])

  useEffect(() => {
    if (closeRequestKey !== undefined) setOpen(false)
  }, [closeRequestKey])

  return (
    <>
      <div ref={refs.setReference} className={theme.target} data-testid="keep-tooltip-target" {...getReferenceProps()}>
        {children}
      </div>
      <div
        ref={refs.setFloating}
        data-testid="keep-tooltip"
        {...getFloatingProps({
          className: cn(
            theme.base,
            animation && `${theme.animation} ${animation}`,
            !open && theme.hidden,
            theme.style[style],
            className,
          ),
          style: {
            position: strategy,
            top: y ?? ' ',
            left: x ?? ' ',
            minWidth,
          },
          ...props,
        })}>
        <div className={theme.content}>{content}</div>
        {arrow && (
          <div
            className={cn(
              theme.arrow.base,
              style === 'dark' && theme.arrow.style.dark,
              style === 'light' && theme.arrow.style.light,
              style === 'auto' && theme.arrow.style.auto,
            )}
            data-testid="keep-tooltip-arrow"
            ref={arrowRef}
            style={{
              top: arrowY ?? ' ',
              left: arrowX ?? ' ',
              right: ' ',
              bottom: ' ',
              [getArrowPlacement({ placement: floatingProperties.placement })]: theme.arrow.placement,
            }}>
            &nbsp;
          </div>
        )}
      </div>
    </>
  )
}
