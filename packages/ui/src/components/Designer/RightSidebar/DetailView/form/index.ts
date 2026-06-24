import type { PropPanelSchema } from '@pdfme/common';

export { useForm } from './useForm.js';
export type { FormInstance, NamePath, ValidateErrorEntity, FormWidgets, FormWatch } from './useForm.js';
export { default } from './FormRender.js';
export type { FormRenderProps } from './FormRender.js';
export { __fieldRenderTally } from './renderTally.js';

/** The schema shape consumed by FormRender (alias of {@link PropPanelSchema}). */
export type Schema = PropPanelSchema;
