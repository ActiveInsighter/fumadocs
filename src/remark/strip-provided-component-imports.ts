type MdxNode = {
  type?: string;
  value?: string;
  children?: MdxNode[];
};

const PROVIDED_COMPONENT_MODULES = new Set([
  'fumadocs-ui/components/tabs',
]);

function isProvidedComponentImport(node: MdxNode) {
  if (node.type !== 'mdxjsEsm' || typeof node.value !== 'string') {
    return false;
  }

  const source = node.value.match(/\bfrom\s+['"]([^'"]+)['"]/u)?.[1];
  return source !== undefined && PROVIDED_COMPONENT_MODULES.has(source);
}

/**
 * Tabs are supplied through getMDXComponents(). Removing repeated per-document
 * imports keeps the same MDX API while reducing client-component edges in the
 * Turbopack graph.
 */
export default function stripProvidedComponentImports() {
  return (tree: MdxNode): void => {
    if (!Array.isArray(tree.children)) return;
    tree.children = tree.children.filter((node) => !isProvidedComponentImport(node));
  };
}
