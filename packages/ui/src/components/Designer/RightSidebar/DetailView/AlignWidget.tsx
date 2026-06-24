import { Button, ButtonGroup, FormItem } from '../../../primitives/index.js';
import React from 'react';
import type { ChangeSchemas, PropPanelSchema, SchemaForUI, Size } from '@pdfme/common';
import { DESIGNER_CLASSNAME } from '../../../../constants.js';
import {
  AlignStartVertical,
  AlignStartHorizontal,
  AlignCenterVertical,
  AlignCenterHorizontal,
  AlignEndVertical,
  AlignEndHorizontal,
  AlignVerticalSpaceAround,
  AlignHorizontalSpaceAround,
} from 'lucide-react';
import { round } from '../../../../helper.js';

interface AlignWidgetProps {
  activeElements: HTMLElement[];
  changeSchemas: ChangeSchemas;
  schemas: SchemaForUI[];
  pageSize: Size;
  schema?: PropPanelSchema;
}

const AlignWidget = (props: AlignWidgetProps) => {
  const { activeElements, changeSchemas, schemas, schema, pageSize } = props;

  const selectedSchemas = () => {
    const ids = activeElements.map((ae) => ae.id);
    return schemas.filter((s) => ids.includes(s.id));
  };

  const align = (type: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    const targets = selectedSchemas();
    const isVertical = ['left', 'center', 'right'].includes(type);
    const tgtPos: 'x' | 'y' = isVertical ? 'x' : 'y';
    const tgtSize: 'width' | 'height' = isVertical ? 'width' : 'height';
    const isSingle = targets.length === 1;
    const root = pageSize[tgtSize];

    const min = isSingle ? 0 : Math.min(...targets.map((s) => s.position[tgtPos]));
    const max = isSingle
      ? root
      : Math.max(...targets.map((s) => s.position[tgtPos] + s[tgtSize]));

    let basePos = min;
    let adjust: (size: number) => number = () => 0;
    if (['center', 'middle'].includes(type)) {
      basePos = (min + max) / 2;
      adjust = (size: number): number => size / 2;
    } else if (['right', 'bottom'].includes(type)) {
      basePos = max;
      adjust = (size: number): number => size;
    }

    changeSchemas(
      targets.map((s) => ({
        key: `position.${tgtPos}`,
        value: round(basePos - adjust(s[tgtSize]), 2),
        schemaId: s.id,
      })),
    );
  };

  const distribute = (type: 'vertical' | 'horizontal') => {
    const targets = selectedSchemas();
    const isVertical = type === 'vertical';
    const tgtPos: 'x' | 'y' = isVertical ? 'y' : 'x';
    const tgtSize: 'width' | 'height' = isVertical ? 'height' : 'width';

    const min = Math.min(...targets.map((s) => s.position[tgtPos]));
    const max = Math.max(...targets.map((s) => s.position[tgtPos] + s[tgtSize]));

    if (targets.length < 3) return;

    const boxPos = min;
    const boxSize = max - min;
    const sum = targets.reduce((acc, cur) => acc + cur[tgtSize], 0);
    const unit = (boxSize - sum) / (targets.length - 1);

    let prev = 0;
    changeSchemas(
      targets.map((s, index) => {
        const prevSize = index === 0 ? 0 : targets[index - 1][tgtSize];
        prev += index === 0 ? 0 : prevSize + unit;
        return { key: `position.${tgtPos}`, value: round(boxPos + prev, 2), schemaId: s.id };
      }),
    );
  };
  const layoutBtns: {
    id: string;
    icon: React.JSX.Element;
    onClick: () => void;
  }[] = [
    {
      id: 'left',
      icon: <AlignStartVertical size={15} />,
      onClick: () => align('left'),
    },
    {
      id: 'center',
      icon: <AlignCenterVertical size={15} />,
      onClick: () => align('center'),
    },
    {
      id: 'right',
      icon: <AlignEndVertical size={15} />,
      onClick: () => align('right'),
    },
    {
      id: 'top',
      icon: <AlignStartHorizontal size={15} />,
      onClick: () => align('top'),
    },
    {
      id: 'middle',
      icon: <AlignCenterHorizontal size={15} />,
      onClick: () => align('middle'),
    },
    {
      id: 'bottom',
      icon: <AlignEndHorizontal size={15} />,
      onClick: () => align('bottom'),
    },
    {
      id: 'vertical',
      icon: <AlignVerticalSpaceAround size={15} />,
      onClick: () => distribute('vertical'),
    },
    {
      id: 'horizontal',
      icon: <AlignHorizontalSpaceAround size={15} />,
      onClick: () => distribute('horizontal'),
    },
  ];

  return (
    <FormItem label={schema?.title}>
      <ButtonGroup>
        {layoutBtns.map((btn) => (
          <Button
            className={DESIGNER_CLASSNAME + 'align-' + btn.id}
            key={btn.id}
            style={{ padding: 7 }}
            disabled={activeElements.length <= 2 && ['vertical', 'horizontal'].includes(btn.id)}
            {...btn}
          />
        ))}
      </ButtonGroup>
    </FormItem>
  );
};

export default AlignWidget;
