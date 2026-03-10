import type { ReactNode } from "react";
import { DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent, type UniqueIdentifier } from "@dnd-kit/core";
import {
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  SortingStrategy,
} from "@dnd-kit/sortable";
import { SortableOverlay } from "./dnd-sortable-overly";
import { DragHandle, SortableItem } from "./dnd-sortable-item";

interface BaseItem {
  id: UniqueIdentifier;
}

interface Props<T extends BaseItem> {
  items: T[];
  onChange(event: DragEndEvent): void;
  renderItem?: ReactNode;
  children?: ReactNode;
  strategy?: SortingStrategy;
}

export function SortableList<T extends BaseItem>({
  items,
  onChange,
  renderItem,
  children,
  strategy = rectSortingStrategy,
}: Readonly<Props<T>>) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <DndContext
      sensors={sensors}
      onDragEnd={(event) => {
        onChange(event);
      }}
    >
      <SortableContext
        items={items}
        strategy={strategy}
      >
        {children}
      </SortableContext>
    </DndContext>
  );
}

SortableList.Item = SortableItem;
SortableList.DragHandle = DragHandle;
SortableList.Overlay = SortableOverlay;
