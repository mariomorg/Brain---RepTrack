import { useMemo, useState } from 'react';
import { Note } from '../types/note.types';

// ── Tree data model ────────────────────────────────────────────────────────────

interface TreeNode {
    name: string;
    fullPath: string;
    leafCount: number;   // notes whose path == this node exactly
    totalCount: number;  // notes in this entire subtree
    children: Record<string, TreeNode>;
}

function buildTree(notes: Note[]): Record<string, TreeNode> {
    const root: Record<string, TreeNode> = {};

    for (const note of notes) {
        if (!note.path) continue;
        const segments = note.path.split('/').filter(Boolean);
        let current = root;
        let cumPath = '';

        segments.forEach((seg, i) => {
            cumPath = cumPath ? `${cumPath}/${seg}` : seg;
            if (!current[seg]) {
                current[seg] = {
                    name: seg,
                    fullPath: cumPath,
                    leafCount: 0,
                    totalCount: 0,
                    children: {},
                };
            }
            current[seg].totalCount++;
            if (i === segments.length - 1) current[seg].leafCount++;
            current = current[seg].children;
        });
    }
    return root;
}

// ── Tree node component ────────────────────────────────────────────────────────

interface TreeNodeProps {
    node: TreeNode;
    activePrefix: string | null;
    onSelect: (path: string | null) => void;
    level: number;
}

function TreeNodeItem({ node, activePrefix, onSelect, level }: TreeNodeProps) {
    const childKeys = Object.keys(node.children);
    const hasChildren = childKeys.length > 0;

    const isActive = activePrefix === node.fullPath;
    const isAncestorOfActive =
        activePrefix !== null && activePrefix.startsWith(node.fullPath + '/');

    const [expanded, setExpanded] = useState(isAncestorOfActive || level === 0);

    return (
        <div className="tree-node">
            <div
                className={`tree-node__row${isActive ? ' tree-node__row--active' : ''}`}
                style={{ paddingLeft: 12 + level * 18 }}
                onClick={() => onSelect(isActive ? null : node.fullPath)}
            >
                {hasChildren ? (
                    <span
                        className="tree-node__toggle"
                        onClick={(e) => {
                            e.stopPropagation();
                            setExpanded((v) => !v);
                        }}
                    >
                        {expanded ? '▾' : '▸'}
                    </span>
                ) : (
                    <span className="tree-node__dot">•</span>
                )}
                <span className="tree-node__label">{node.name}</span>
                <span className="tree-node__count">{node.totalCount}</span>
            </div>

            {hasChildren && expanded && (
                <div>
                    {Object.values(node.children).map((child) => (
                        <TreeNodeItem
                            key={child.fullPath}
                            node={child}
                            activePrefix={activePrefix}
                            onSelect={onSelect}
                            level={level + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Public component ───────────────────────────────────────────────────────────

interface TagTreeProps {
    notes: Note[];
    activePrefix: string | null;
    onSelect: (path: string | null) => void;
}

export function TagTree({ notes, activePrefix, onSelect }: TagTreeProps) {
    const tree = useMemo(() => buildTree(notes), [notes]);
    const rootNodes = Object.values(tree);

    if (rootNodes.length === 0) return null;

    return (
        <aside className="tag-tree">
            <div className="tag-tree__header">
                <span className="tag-tree__title">Categorías</span>
                {activePrefix && (
                    <button
                        className="tag-tree__clear"
                        onClick={() => onSelect(null)}
                        title="Limpiar filtro"
                    >
                        ✕
                    </button>
                )}
            </div>
            <div className="tag-tree__nodes">
                {rootNodes.map((node) => (
                    <TreeNodeItem
                        key={node.fullPath}
                        node={node}
                        activePrefix={activePrefix}
                        onSelect={onSelect}
                        level={0}
                    />
                ))}
            </div>
        </aside>
    );
}
