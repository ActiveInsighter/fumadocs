type MdxNode = {
  type?: string;
  value?: string;
  children?: MdxNode[];
};

const REGISTERED_COMPONENT_IMPORTS = new Set([
  'fumadocs-ui/components/accordion',
  'fumadocs-ui/components/dynamic-codeblock',
  'fumadocs-ui/components/files',
  'fumadocs-ui/components/image-zoom',
  'fumadocs-ui/components/inline-toc',
  'fumadocs-ui/components/steps',
  'fumadocs-ui/components/tabs',
  'fumadocs-ui/components/type-table',
]);

function isRegisteredComponentImport(node: MdxNode): boolean {
  if (node.type !== 'mdxjsEsm' || typeof node.value !== 'string') {
    return false;
  }

  const sourceMatch = node.value.match(/\bfrom\s+['"]([^'"]+)['"]/u);
  return sourceMatch !== null && REGISTERED_COMPONENT_IMPORTS.has(sourceMatch[1]);
}

/**
 * Dynamic Fumadocs pages receive UI components through getMDXComponents().
 * Remove legacy per-document imports of the same components so the runtime
 * compiler does not evaluate a second React-bound module instance.
 */
export default function stripRegisteredComponentImports() {
  return (tree: MdxNode): void => {
    if (!Array.isArray(tree.children)) return;
    tree.children = tree.children.filter(
      (node) => !isRegisteredComponentImport(node),
    );
  };
}
