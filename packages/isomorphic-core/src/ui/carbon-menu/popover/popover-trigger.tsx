import React, { cloneElement } from 'react';
import { usePopoverContext } from './popover-context';
import { useMergedRef } from './use-merged-ref';
import cn from '../../../utils/class-names';

export interface PopoverTargetProps {
  children: React.ReactElement<{
    className?: string;
    onClick?: (event: React.MouseEvent) => void;
    onMouseEnter?: (event: React.MouseEvent) => void;
    onMouseLeave?: (event: React.MouseEvent) => void;
    "data-expanded"?: boolean;
  }>;
  refProp?: string;
  popupType?: string;
}

export function isElement(value: unknown): value is React.ReactElement {
  if (Array.isArray(value) || value === null) {
    return false;
  }

  if (typeof value === 'object') {
    if (value.type === React.Fragment) {
      return false;
    }

    return true;
  }

  return false;
}

export const PopoverTrigger = React.forwardRef<
  HTMLElement,
  PopoverTargetProps & React.HTMLProps<HTMLButtonElement>
>(({ children, popupType = 'dialog', refProp = 'ref', ...props }, ref) => {
  if (!isElement(children)) {
    throw new Error(
      'Popover.Trigger component children should be an element or a component that accepts ref. Fragments, strings, numbers and other primitive values are not supported'
    );
  }

  const ctx = usePopoverContext();
  const targetRef = useMergedRef(
    ctx.reference,
    (children as React.ReactElement<{ ref?: React.Ref<HTMLElement> }>).ref,
    ref
  );

  const accessibleProps = ctx.withRoles
    ? {
        'aria-haspopup': popupType,
        'aria-expanded': ctx.opened,
        'aria-controls': ctx.getDropdownId(),
        id: ctx.getTargetId(),
      }
    : {};

  return cloneElement(children, {
    ...props,
    ...accessibleProps,
    ...ctx.targetProps,
    className: cn(
      ctx.targetProps.className,
      props.className,
      children.props.className
    ),
    [refProp]: targetRef,
    ...(ctx.controlled ? null : { onClick: ctx.onToggle }),
  });
});

PopoverTrigger.displayName = 'PopoverTrigger';
