'use client';
import React from 'react';
import { useNavMenu } from './nav-menu-context';
import cn from '@core/utils/class-names';
import { useClientWidth } from '@core/hooks/use-client-width';
import type {
  ContentWrapperRounded,
  ContentWrapperShadow,
  ItemContentRef,
  NavMenuContentProps,
} from './nav-menu-types';

export function NavMenuContent({ children }: Readonly<NavMenuContentProps>) {
  return <>{children}</>;
}

NavMenuContent.displayName = 'NavMenuContent';

const menuContentClassNames = {
  base: 'content-wrapper rounded-lg shadow-lg bg-white dark:bg-gray-100 transform-gpu shadow-gray-400/10 overflow-hidden duration-300',
  rounded: {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    none: 'rounded-none',
  },
  shadow: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    none: 'shadow-none',
  },
};

type NavMenuContentWrapperProps = {
  items: (ItemContentRef | null | undefined)[];
  menuContentClassName?: string;
  fullscreen?: boolean;
  floatingOffset: number;
};

export function NavMenuContentWrapper({
  items,
  menuContentClassName,
  fullscreen = false,
  floatingOffset,
}: Readonly<NavMenuContentWrapperProps>) {
  const clientWidth = useClientWidth();

  const {
    hovering,
    contentRefs,
    contentUiPropsRefs,
    popoverLeft,
    hoveringWidth,
    hoveringElRect,
    popoverHeight,
    popoverWidth,
    dir,
  } = useNavMenu();

  const roundedKey: ContentWrapperRounded =
    contentUiPropsRefs.current[hovering ?? -1]?.rounded ?? 'md';
  const shadowKey: ContentWrapperShadow =
    contentUiPropsRefs.current[hovering ?? -1]?.shadow ?? 'md';

  const hoveringX = hoveringElRect?.x ?? 0;
  const popoverW = popoverWidth ?? 0;
  const negativeXLtrValue =
    clientWidth - hoveringX - floatingOffset < popoverW
      ? popoverW - (clientWidth - hoveringX - floatingOffset) + floatingOffset
      : 0;

  const hoveringW = hoveringWidth ?? 0;
  const popoverL = popoverLeft ?? 0;
  const leftRtl =
    popoverW > hoveringX + hoveringW - floatingOffset
      ? popoverL + hoveringW - hoveringW - hoveringX + floatingOffset
      : popoverL + hoveringW - popoverW;

  const positionStyle = fullscreen
    ? {
        width: 'var(--client-width)',
        position: 'fixed' as const,
        insetInlineStart: 0,
      }
    : {
        left: dir === 'ltr' ? popoverL - Math.abs(negativeXLtrValue) : leftRtl,
        width: popoverW || 0,
        position: 'absolute' as const,
      };

  const itemKeys = React.useMemo(
    () => items.map((_, i) => `nav-menu-item-${i}`),
    [items.length]
  );

  const baseStyle: React.CSSProperties & { '--client-width'?: string } = {
    ['--client-width']: `${clientWidth}px`,
    transformOrigin: 'top',
    height: popoverHeight ?? 0,
    ...positionStyle,
  };

  return (
    <div
      style={baseStyle}
      className={cn(
        menuContentClassNames.base,
        menuContentClassNames.rounded[roundedKey],
        menuContentClassNames.shadow[shadowKey],
        menuContentClassName,
        hovering === null
          ? 'invisible scale-y-95 opacity-0'
          : 'visible scale-y-100 opacity-100 transition-all',
        hovering !== null && !items[hovering]?.component && 'border-none opacity-0 shadow-none'
      )}
    >
      {items.map((item, index) => {
          const uiProps = {
            // @ts-ignore
            rounded: item?.component?.props?.rounded || null,
            // @ts-ignore
            shadow: item?.component?.props?.shadow || null,
          };
          return (
            <Wrapper
              key={itemKeys[index]}
              hovering={hovering}
              index={index}
            >
                <div
                  ref={(element) => {
                    contentUiPropsRefs.current[index] = uiProps;
                    contentRefs.current[index] = element;
                  }}
                  className={cn(
                    'w-32',
                    // @ts-ignore
                    item?.component?.props?.children?.props?.className
                  )}
                >
                  {/* children of <NavMenu.Content></NavMenu.Content>*/}
                  {/* @ts-ignore */}
                  {item?.component?.props?.children?.props?.children}
                </div>
            </Wrapper>
          );
        })}
    </div>
  );
}

type WrapperProps = {
  children: React.ReactNode;
  hovering: number | null;
  index: number;
};

function getWrapperTransformClass(hovering: number | null, index: number): string {
  if (hovering === index) return 'transform-none';
  if (hovering === null) return 'translate-x-0 opacity-0';
  return hovering > index ? '-translate-x-1/4' : 'translate-x-1/4';
}

function Wrapper(props: Readonly<WrapperProps>) {
  const { hovering, index, children } = props;
  const opacityClass =
    hovering === index ? 'opacity-100' : 'pointer-events-none translate-x-0 opacity-0';
  const transformClass = getWrapperTransformClass(hovering, index);
  return (
    <div
      className={cn(
        'absolute start-0 top-0 w-full overflow-hidden transition-all duration-300 ease-in-out',
        opacityClass,
        transformClass,
        hovering === null && 'translate-x-0 opacity-0'
      )}
    >
      {children}
    </div>
  );
}
