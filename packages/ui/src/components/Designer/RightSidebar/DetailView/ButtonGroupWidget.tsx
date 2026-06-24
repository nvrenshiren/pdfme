import { Button, ButtonGroup, FormItem } from '../../../primitives/index.js';
import { useTheme } from '../../../../contexts.js';
import React from 'react';
import type { ChangeSchemas, PropPanelSchema, SchemaForUI } from '@pdfme/common';
import { getSameTypeBulkUpdateSchemas } from './schemaChangeHelpers.js';
interface ButtonConfig {
  key: string;
  icon: string;
  type: 'boolean' | 'select';
  value?: string;
}

interface ButtonGroupWidgetProps {
  activeElements: HTMLElement[];
  activeSchema: SchemaForUI;
  changeSchemas: ChangeSchemas;
  schemas: SchemaForUI[];
  schema?: PropPanelSchema;
}

const ButtonGroupWidget = (props: ButtonGroupWidgetProps) => {
  const { activeElements, activeSchema, changeSchemas, schemas, schema } = props;
  const token = useTheme();
  const buttons = Array.isArray(schema?.buttons) ? (schema.buttons as ButtonConfig[]) : [];

  const getSelectedSchemas = () => {
    const ids = activeElements.map((ae) => ae.id);
    return schemas.filter((s) => ids.includes(s.id));
  };

  const getTargetSchemas = () =>
    getSameTypeBulkUpdateSchemas({
      activeSchema,
      activeSchemas: getSelectedSchemas(),
    });

  const getButtonValue = (btn: ButtonConfig, targetSchemas: SchemaForUI[]) => {
    if (btn.type !== 'boolean') return btn.value;

    const isActive = targetSchemas.every((s) =>
      Boolean((s as Record<string, unknown>)[btn.key] ?? false),
    );
    return !isActive;
  };

  const apply = (btn: ButtonConfig) => {
    const targetSchemas = getTargetSchemas();
    const value = getButtonValue(btn, targetSchemas);
    changeSchemas(targetSchemas.map((s: SchemaForUI) => ({ key: btn.key, value, schemaId: s.id })));
  };

  const isActive = (btn: ButtonConfig) => {
    const key = btn.key;
    const type = btn.type;
    const targetSchemas = getTargetSchemas();
    if (targetSchemas.length === 0) return false;

    return targetSchemas.every((s: SchemaForUI) => {
      // Cast schema to Record to safely access dynamic properties
      const schemaRecord = s as Record<string, unknown>;
      return type === 'boolean'
        ? Boolean(schemaRecord[key] ?? false)
        : schemaRecord[key] === btn.value;
    });
  };

  const replaceCurrentColor = (svgString: string, color?: string) =>
    color ? svgString.replace(/="currentColor"/g, `="${color}"`) : svgString;

  const svgIcon = (svgString: string) => {
    const svgDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(
      replaceCurrentColor(svgString, token.colorText),
    )}`;
    return <img width={17} height={17} src={svgDataUrl} alt="" />;
  };

  return (
    <FormItem>
      <ButtonGroup>
        {buttons.map((btn: ButtonConfig, index: number) => {
          const active = isActive(btn);
          return (
            <Button
              type={active ? 'primary' : undefined}
              ghost={active}
              onClick={() => apply(btn)}
              style={{
                padding: 7,
                zIndex: active ? 2 : 0,
              }}
              key={index}
              icon={svgIcon(btn.icon)}
            />
          );
        })}
      </ButtonGroup>
    </FormItem>
  );
};

export default ButtonGroupWidget;
