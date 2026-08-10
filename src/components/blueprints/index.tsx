import type { ComponentType } from 'react';
import { RetrievalPipeline } from './RetrievalPipeline';

/**
 * Diagrams are keyed so an ADR can reference one from frontmatter without the
 * content layer needing to import React.
 */
export const blueprints: Record<string, ComponentType> = {
  'retrieval-pipeline': RetrievalPipeline,
};

export function Blueprint({ name }: { name: string }) {
  const Diagram = blueprints[name];
  if (!Diagram) return null;
  return <Diagram />;
}
