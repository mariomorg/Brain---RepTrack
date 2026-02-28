/* Deterministic color palette for tag chips based on tag name hash */
const PALETTES = [
    { bg: '#EDE9FE', color: '#5B21B6' }, // violet
    { bg: '#D1FAE5', color: '#065F46' }, // green
    { bg: '#DBEAFE', color: '#1E40AF' }, // blue
    { bg: '#FEF3C7', color: '#92400E' }, // amber
    { bg: '#FCE7F3', color: '#9D174D' }, // pink
    { bg: '#E0F2FE', color: '#075985' }, // sky
    { bg: '#F3F4F6', color: '#374151' }, // gray
    { bg: '#FEE2E2', color: '#991B1B' }, // red
];

function hashTag(tag: string): number {
    let h = 0;
    for (let i = 0; i < tag.length; i++) {
        h = (h * 31 + tag.charCodeAt(i)) >>> 0;
    }
    return h % PALETTES.length;
}

interface TagChipProps {
    tag: string | null | undefined;
    onClick?: () => void;
}

export function TagChip({ tag, onClick }: TagChipProps) {
    if (!tag) return null;
    const palette = PALETTES[hashTag(tag)];
    const label = tag.startsWith('#') ? tag : `#${tag}`;
    return (
        <span
            className="tag-chip"
            style={{ backgroundColor: palette.bg, color: palette.color, cursor: onClick ? 'pointer' : 'default' }}
            onClick={onClick}
        >
            {label}
        </span>
    );
}
