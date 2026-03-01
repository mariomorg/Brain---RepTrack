package com.brainreptrack.note.dto;

import lombok.Data;

import java.util.List;
import java.util.UUID;

/**
 * Request body for the folder-summary AI endpoint.
 * Contains the IDs of all notes inside the leaf folder
 * and the human-readable folder name shown in the UI.
 */
@Data
public class FolderSummaryRequestDto {
    /** Display name of the folder (last tag segment). */
    private String folderName;
    /** Full tag path of the folder (e.g. "dev/frontend"). */
    private String folderPath;
    /** IDs of the notes to summarise. */
    private List<UUID> noteIds;
}
