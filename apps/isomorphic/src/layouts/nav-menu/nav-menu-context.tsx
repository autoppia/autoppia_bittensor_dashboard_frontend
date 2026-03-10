'use client';
import React, { Dispatch, createContext, useContext } from 'react';
import type {
  ContentUiProps,
  InitialState,
  ItemRef,
  NavMenuDirection,
} from './nav-menu-types';

/** Ref type with mutable current (avoids deprecated MutableRefObject in Sonar) */
type MutableRef<T> = { current: T };

export const initialState: InitialState = {
  itemWrapperLeft: null,
  itemWrapperRight: null,
  itemWrapperTop: null,
  itemWrapperHeight: null,
  hovering: null,
  hoveringElRect: null,
  hoveringWidth: null,
  popoverLeft: null,
  popoverHeight: null,
  popoverWidth: null,
};

interface NavMenuContextProps extends InitialState {
  set: Dispatch<InitialState>;
  contentRefs: MutableRef<(HTMLElement | null)[]>;
  contentUiPropsRefs: MutableRef<(ContentUiProps | null)[]>;
  items: MutableRef<(ItemRef | null)[]>;
  dir: NavMenuDirection;
  handleMouseEnter: (index: number, el: HTMLElement) => void;
}

const NavMenuContext = createContext<NavMenuContextProps | null>(null);

export function NavMenuProvider({
  value,
  children,
}: React.PropsWithChildren<{ value: NavMenuContextProps }>) {
  return (
    <NavMenuContext.Provider value={value}>{children}</NavMenuContext.Provider>
  );
}

export const useNavMenu = () => {
  const context = useContext(NavMenuContext);
  if (!context) {
    throw new Error('useNavMenu must be used within a NavMenuProvider');
  }
  return context;
};
