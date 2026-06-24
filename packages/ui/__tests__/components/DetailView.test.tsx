import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { BLANK_PDF, pluginRegistry, getDefaultFont, type SchemaForUI } from '@pdfme/common';
import { builtInPlugins } from '@pdfme/schemas/builtins';
import { multiVariableText } from '@pdfme/schemas';
import DetailView from '../../src/components/Designer/RightSidebar/DetailView/index';
import { I18nContext, FontContext, PluginsRegistry, OptionsContext } from '../../src/contexts';
import { __fieldRenderTally } from '../../src/components/Designer/RightSidebar/DetailView/form/index';

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

const textSchema = (): SchemaForUI => ({
  id: 'abc',
  name: 'field1',
  type: 'text',
  content: 'hello',
  position: { x: 10, y: 20 },
  width: 45,
  height: 10,
  rotate: 0,
  opacity: 1,
  fontSize: 13,
  fontColor: '#000000',
  backgroundColor: '',
});

const element = (id: string) => {
  const div = document.createElement('div');
  div.id = id;
  return div;
};

const mvtSchema = (): SchemaForUI => ({
  id: 'mvt1',
  name: 'greeting',
  type: 'multiVariableText',
  text: 'Hello {name}',
  content: '{"name":"World"}',
  variables: ['name'],
  position: { x: 10, y: 20 },
  width: 45,
  height: 10,
  fontSize: 13,
});

const renderDetailView = (schema: SchemaForUI = textSchema()) => {
  const changeSchemas = vi.fn();
  const ui = (
    <I18nContext.Provider value={(key: string) => key as never}>
      <FontContext.Provider value={getDefaultFont()}>
        <PluginsRegistry.Provider value={pluginRegistry({ ...builtInPlugins, multiVariableText })}>
          <OptionsContext.Provider value={{}}>
            <DetailView
              size={{ width: 400, height: 600 }}
              pageSize={{ width: 210, height: 297 }}
              basePdf={BLANK_PDF}
              schemas={[schema]}
              schemasList={[[schema]]}
              activeElements={[element('abc')]}
              changeSchemas={changeSchemas}
              deselectSchema={vi.fn()}
              activeSchema={schema}
            />
          </OptionsContext.Provider>
        </PluginsRegistry.Provider>
      </FontContext.Provider>
    </I18nContext.Provider>
  );
  return { changeSchemas, ...render(ui) };
};

describe('DetailView propPanel form engine', () => {
  test('renders the built-in and text-plugin fields', () => {
    const { container } = renderDetailView();

    // Selects (Radix triggers): type, fontName, overflow (at minimum).
    expect(container.querySelectorAll('[role="combobox"]').length).toBeGreaterThanOrEqual(3);
    // Number inputs: position x/y, width, height, fontSize, etc.
    expect(container.querySelectorAll('input[type="number"]').length).toBeGreaterThanOrEqual(6);
    // Color widgets (swatch buttons): fontColor, backgroundColor, borderColor.
    expect(container.querySelectorAll('.pdfme-swatch').length).toBeGreaterThanOrEqual(3);
    // Boolean toggle (editable) renders as a switch.
    expect(container.querySelectorAll('[role="switch"]').length).toBeGreaterThanOrEqual(1);
    // AlignWidget custom widget renders its alignment buttons.
    expect(container.querySelector('.pdfme-designer-align-left')).toBeTruthy();
  });

  test('editing the field name commits a change through validate → watch', async () => {
    const { container, changeSchemas } = renderDetailView();

    const nameInput = Array.from(container.querySelectorAll('input')).find(
      (el) => (el as HTMLInputElement).value === 'field1',
    ) as HTMLInputElement;
    expect(nameInput).toBeTruthy();

    fireEvent.change(nameInput, { target: { value: 'renamed' } });

    await waitFor(() => {
      expect(changeSchemas).toHaveBeenCalled();
    });
    const committed = changeSchemas.mock.calls
      .flat()
      .flat()
      .some((c) => c && (c as { key?: string }).key === 'name' && (c as { value?: string }).value === 'renamed');
    expect(committed).toBe(true);
  });

  test('editing one field re-renders only that field, not the whole panel', () => {
    const { container } = renderDetailView();
    const nameInput = Array.from(container.querySelectorAll('input')).find(
      (el) => (el as HTMLInputElement).value === 'field1',
    ) as HTMLInputElement;

    // Reset the per-field render tally after the initial mount.
    __fieldRenderTally.clear();
    fireEvent.change(nameInput, { target: { value: 'field1x' } });

    // The edited field re-rendered...
    expect(__fieldRenderTally.get('name')).toBeGreaterThanOrEqual(1);
    // ...but sibling fields did not (no tally entry == no committed re-render).
    expect(__fieldRenderTally.get('fontSize')).toBeUndefined();
    expect(__fieldRenderTally.get('width')).toBeUndefined();
    expect(__fieldRenderTally.get('position.x')).toBeUndefined();
  });

  test('multiVariableText dynamic-variable widget renders without antd DOM', () => {
    const { container } = renderDetailView(mvtSchema());
    // The mapDynamicVariables widget builds its own labeled textarea per variable
    // (previously it cloned an `.ant-form-item` row and threw when antd was removed).
    const varInput = container.querySelector('#dynamic-var-name') as HTMLTextAreaElement | null;
    expect(varInput).toBeTruthy();
    expect(varInput?.value).toBe('World');
  });
});
