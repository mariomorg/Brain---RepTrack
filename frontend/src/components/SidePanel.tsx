import React, { useEffect, useState } from 'react';
import { TagNode, Idea } from '../mockData';
import { getIdeasForTag } from '../mockApi';

interface SidePanelProps {
  selectedTag: TagNode | null;
  selectedIdea: Idea | null;
  onSelectIdea: (idea: Idea) => void;
  allTags?: TagNode[];
  onSelectTag?: (tag: TagNode) => void;
}

export const SidePanel: React.FC<SidePanelProps> = ({
  selectedTag,
  selectedIdea,
  onSelectIdea,
  allTags = [],
  onSelectTag,
}) => {
  const [ideas, setIdeas] = useState<Idea[]>([]);

  useEffect(() => {
    if (selectedTag) {
      getIdeasForTag(selectedTag.path).then(setIdeas);
    } else {
      setIdeas([]);
    }
  }, [selectedTag]);

  const subTags = selectedTag
    ? allTags.filter(t => t.parentPath === selectedTag.path)
    : [];

  return (
    <aside className="side-panel">
      {selectedTag ? (
        <div className="tag-details">
          <h2>{selectedTag.name}</h2>
          <div className="tag-path">{selectedTag.path}</div>
          {subTags.length > 0 && (
            <div className="subtags-section">
              <h3>Subtemas</h3>
              <ul className="subtags-list">
                {subTags.map(sub => (
                  <li
                    key={sub.id}
                    className="subtag-item"
                    tabIndex={0}
                    onClick={() => onSelectTag?.(sub)}
                    onKeyDown={e => { if (e.key === 'Enter') onSelectTag?.(sub); }}
                  >
                    <span className="subtag-name">{sub.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="tag-ideas-count">Ideas: {ideas.length}</div>
        </div>
      ) : (
        <div className="tag-details-empty">Selecciona un tag</div>
      )}
      <div className="ideas-list">
        <h3>Ideas</h3>
        <ul>
          {ideas.slice(0, 20).map(idea => (
            <li
              key={idea.id}
              className={selectedIdea && selectedIdea.id === idea.id ? 'selected' : ''}
              tabIndex={0}
              onClick={() => onSelectIdea(idea)}
              onKeyDown={e => { if (e.key === 'Enter') onSelectIdea(idea); }}
            >
              <div className="idea-title">{idea.title}</div>
              <div className="idea-date">{idea.createdAt}</div>
            </li>
          ))}
        </ul>
      </div>
      {selectedIdea && (
        <div className="idea-details">
          <h3>{selectedIdea.title}</h3>
          <div className="idea-excerpt">{selectedIdea.excerpt}</div>
          <div className="idea-tags">Tags: {selectedIdea.tagPaths.join(', ')}</div>
        </div>
      )}
    </aside>
  );
};
